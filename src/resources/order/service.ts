/** @format */

import orderModel, { iOrderDocument, iOrderWithPaymentLink } from "./model";
import userModel from "../companyUser/model";
import billingModel from "../Billing/model";
import iOrder, { iShipRocketOrderStatus } from "../../resources/order/interface";
import HttpException from "../../utils/http.exception";
import mailjetService from "../../utils/gobalServices/mailer.service";
import companyUserService from "../companyUser/services";
import companyService from "../company/service";
import billingService from "../Billing/services";
import pdfService from "../../utils/gobalServices/pdf";
import consumerService from "../../resources/consumer/services";
import PaymentGatewayService from "@/utils/gobalServices/paymentGateway.service";
import ShipRocketService from "@/resources/ShipRocket/services";
import ConsumerModel from "../consumer/model";
import calWeight from "@/utils/gobalServices/weight";
import moment from "moment";
import { createOrderAndBillInfo, getMonthDate, getWeekDates } from "@/utils/helpers";
import RedisCache from "@/utils/Redis/Redis";

class orderService {
  private orderModel = orderModel;
  private consumerModel = ConsumerModel;
  private companyUserService = new companyUserService();
  private consumerService = new consumerService();
  private billingService = new billingService();
  private ShipRocketService = new ShipRocketService();
  private RedisCacheService = new RedisCache();
  private pdfService = new pdfService();
  private paymentStatusMapping = {
    NEW: "pending",
    AUTHORIZING: "pending",
    CHARGED: "success",
    Failed: "failed",
    AUTHENTICATION_FAILED: "failed",
    AUTHORIZATION_FAILED: "failed",
    Expired: "failed",
    Cancelled: "failed",
  };
  private orderStatusMapping = {
    NEW: "ordered",
    AUTHORIZING: "ordered",
    CHARGED: "accepted",
    Failed: "rejected",
    AUTHENTICATION_FAILED: "rejected",
    AUTHORIZATION_FAILED: "rejected",
    Expired: "rejected",
    Cancelled: "cancelled",
  };

  public async create(body: iOrder, userData: any): Promise<iOrder> {
    try {
      // console.log(userData);

      body["orderedBy"] = userData.id;
      // console.log("body",body);

      const consumer = await this.consumerModel.findById(body.orderedBy);
      if (!consumer) throw new HttpException(400, "Consumer not found");

      let order = new this.orderModel(body) as iOrderDocument;
      order = await order.validateStock();


      const paymentGateway = new PaymentGatewayService();
      const sessionResponse = await paymentGateway.callSessionApi({
        orderId: body.orderNo,
        amount: Number(body.finalAmount),
        customer: consumer,
      });

      if (!sessionResponse?.payment_links)
        throw new HttpException(400, "Payment gateway error");

      await order.save();

      // const order = await this.orderModel.create(body);
      const paymentOrder = {
        ...order.toJSON(),
        payment_links: sessionResponse?.payment_links,
      } as iOrderWithPaymentLink;

      // this.orderModel.createWithPaymentSession(body);

      // const updatedBill = await this.billingModel.findOneAndUpdate(
      //   { _id: bill._id },
      //   { orderId: order._id, company_id: userData.company_id },
      //   { new: true }
      // );
      // if (order) {
      //   const reportingToUser = await this.companyUserService.fetchSingleUser(order.reportingTo)
      //   if (!reportingToUser) throw new Error('reportingTo does not exist')
      //   const message = `your assing for this order ${order._id}`;
      //   if (reportingToUser.emailId) {
      //     this.mailjetService.mailer(
      //       reportingToUser.emailId,
      //       "Assing New Order",
      //       "",
      //       message,
      //       "",
      //       [],
      //     );
      //   }
      // }
      //   console.log("updatedBill",updatedBill);
      // console.log("order", order);
      return paymentOrder;
    } catch (error: any) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async update(id: any, body: iOrder | object): Promise<iOrder | any> {
    try {
      let updateObj = { ...body };
      console.log(updateObj);

      const user = await this.orderModel.findByIdAndUpdate(
        { _id: id },
        { ...updateObj },
        { new: true }
      );
      // console.log(user);

      return user;
    } catch (error) {
      console.error(error);
      throw new Error("Unable to update user");
    }
  }

  public async fetchAllOrder(): Promise<iOrder | Array<object>> {
    try {
      // companyId to be add
      const user = await this.orderModel
        .find(
          {},
          {
            _id: 0,
            orderNo: 1,
            invoiceNo: 1,
            orderStatus: 1,
            status: 1,
            actualAmount: 1,
            discountAmount: 1,
          }
        )
        .populate("reportingTo");
      return user;
    } catch (error) {
      throw new Error("Unable to fetch user");
    }
  }

  public async fetchSingleOrder(orderId: any): Promise<iOrder | any> {
    try {
      console.log("orderId-----", orderId);

      const user = await this.orderModel
        .findOne({ _id: orderId })
        .populate(["company", "itemList.product"]);
      return user;
    } catch (error) {
      console.log(error);
      throw new Error("Unable to fetch order");
    }
  }

  public async delete(id: string): Promise<iOrder | any> {
    try {
      const user = await this.orderModel.findOneAndDelete({ _id: id });
      return user;
    } catch (error) {
      console.log(error);
      throw new Error("Unable to delete order");
    }
  }
  // change order approval status
  public async changeStatus(
    orderId: string,
    status: string,
    userData: object | any
  ): Promise<iOrder | any> {
    try {
      if (status === "approval") {
        const order: any = await this.orderModel
          .findById({ _id: orderId })
          .populate("company");
        // let companyCredit = order?.company?.credit
        // if (order && Number(Number(companyCredit) < Number(order.total))) {
        //   throw new HttpException(500, 'you have not enough credit for this order');
        // }
        // await new this.companyService().deductCredit({ credit: order.total, company_id: userData.company_id })
      }
      // const {userId} = userData;
      const reportingToData = await this.companyUserService.fetchSingleUser(
        userData?.id
      );
      const orderStatus = await this.orderModel.findOneAndUpdate(
        { _id: orderId, reportingTo: userData.id },
        {
          approvalStatus: status,
          reportingTo: reportingToData._id,
          approvedByName: `${reportingToData.firstName} ${reportingToData.lastName}`,
          approvedDate: new Date(),
        },
        { new: true }
      );
      if (orderStatus) return orderStatus;
    } catch (error) {
      throw new Error("Unable to change order status");
    }
  }

  public async tableQuery(query: any[], countQuery: any[]): Promise<object> {
    try {
      const queryData = await this.orderModel.aggregate(query);
      const queryCount = await this.orderModel.aggregate(countQuery);
      let count = 0;

      if (queryCount[0] && queryCount[0].count) count = queryCount[0].count;
      return { queryData: queryData, count: count };
    } catch (error) {
      throw error;
    }
  }

  public async latestOrders(): Promise<iOrder | any> {
    try {
      const orders = (await orderModel.find({}).sort({ createdAt: -1 })).splice(
        0,
        5
      );
      return orders;
    } catch (error) {
      console.error(error);
      throw new HttpException(401, "Unable to update  orders ");
    }
  }

  public async CreditCounter(company_id: string, order: any): Promise<any> {
    // let creditPending: number = 0;
    let creditUsed: number = 0;
    creditUsed = order?.total;
    const orders = await this.orderModel.find({ company: company_id });
    orders.forEach((item: any) => {
      // if (item.approvalStatus === "waitingForApproval") {
      //   creditPending = creditPending + Number(item.total)
      // }
      // if (item.approvalStatus === "approval" && item.orderStatus === "accepted") {
      //   creditUsed = creditUsed + Number(item.total)
      // }
    });
    console.log("creditUsed", creditUsed);
    return creditUsed;
  }
  // fetch all  orders of company
  public async fetchOrders(company_id: string): Promise<any> {
    return await this.orderModel.find({ company: company_id });
  }

  // fetch all pending orders of company
  public async fetchPendingOrders(company_id: string): Promise<any> {
    return await this.orderModel.find({
      company: company_id,
      approvalStatus: "waitingForApproval",
    });
  }

  public async orderPaymentWebhook(body: any): Promise<any> {
    return await this.orderModel.findOneAndUpdate(
      { _id: body.data.orderId },
      { orderStatus: "accepted", paymentStatus: "paid" }
    );
  }

  public async onOrderPaymentSuccess(body: any) {
    const payload = {
      id: "evt_V2_b737837102414514ae0e9717a9f2664d",
      event_name: "ORDER_SUCCEEDED",
      date_created: "2023-08-10T07:00:48Z",
      content: {
        order: {
          offers: [],
          txn_id: "ms-sample_ord_200-1",
          udf7: "FILTERED",
          payment_method: "VISA",
          txn_uuid: "moziqFZtYKQkTsRFGXX",
          metadata: {
            payment_page_client_id: "FILTERED",
            merchant_payload:
              '{"customerPhone":"999999999","customerEmail":"1111111"}',
            payment_page_sdk_payload: "FILTERED",
            payment_links: {
              web: "https://smartgateway.hdfcbank.com/orders/ordeh_a9eb2884e4fe4738b70c3d51e6397d34/payment-page",
              iframe:
                "https://smartgateway.hdfcbank.com/orders/ordeh_a9eb2884e4fe4738b70c3d51e6397d34/payment-page",
              mobile:
                "https://smartgateway.hdfcbank.com/orders/ordeh_a9eb2884e4fe4738b70c3d51e6397d34/payment-page",
            },
          },
          udf5: "FILTERED",
          status_id: 21,
          amount_refunded: 0,
          udf9: "FILTERED",
          status: "CHARGED",
          bank_error_message: "",
          id: "ordeh_a9eb2884e4fe4738b70c3d51e6397d34",
          auth_type: "THREE_DS",
          udf3: "",
          udf6: "FILTERED",
          udf10: "FILTERED",
          effective_amount: 1,
          product_id: "",
          order_id: "sample_ord_200",
          return_url: "https://shop.merchant.com",
          payment_gateway_response: {
            gateway_response: {
              authCode: "ybbjy9",
              resMessage: "FILTERED",
              mandateToken: "FILTERED",
              resCode: "200",
            },
            created: "2023-08-10T07:00:48Z",
            auth_id_code: "ybbjy9",
          },
          udf1: "",
          currency: "INR",
          udf4: "",
          customer_id: "FILTERED",
          date_created: "1111111T07:00:40Z",
          gateway_id: 100,
          payment_links: {
            web: "https://smartgateway.hdfcbank.com/merchant/pay/ordeh_a9eb2884e4fe4738b70c3d51e6397d34",
            iframe:
              "https://smartgateway.hdfcbank.com/merchant/ipay/ordeh_a9eb2884e4fe4738b70c3d51e6397d34",
            mobile:
              "https://smartgateway.hdfcbank.com/merchant/pay/ordeh_a9eb2884e4fe4738b70c3d51e6397d34?mobile=true",
          },
          maximum_eligible_refund_amount: "FILTERED",
          txn_detail: {
            express_checkout: true,
            txn_id: "ms-sample_ord_200-1",
            txn_amount: 1,
            error_message: "",
            txn_uuid: "moziqFZtYKQkTsRFGXX",
            created: "2023-08-10T07:00:46Z",
            metadata: { payment_channel: "WEB", microapp: "hyperpay" },
            gateway: "DUMMY",
            status: "CHARGED",
            net_amount: 1,
            order_id: "sample_ord_200",
            currency: "INR",
            error_code: "",
            gateway_id: 100,
            txn_flow_type: "FILTERED",
            redirect: true,
          },
          bank_error_code: "",
          udf8: "FILTERED",
          payment_method_type: "CARD",
          customer_phone: "FILTERED",
          merchant_id: "ms",
          customer_email: "FILTERED",
          udf2: "",
          amount: 1,
          refunded: false,
          card: "FILTERED",
        },
      },
    };
    return this.orderModel.findOneAndUpdate(
      { _id: body.data.orderId },
      { orderStatus: "accepted", paymentStatus: "paid" }
    );
  }

  public async onOrderPaymentFailure(body: any) {
    const payload = {
      id: "evt_V2_f139d51b776541bdbccf6cf49234bc8c",
      event_name: "ORDER_FAILED",
      date_created: "2023-08-10T07:19:10Z",
      content: {
        order: {
          offers: [],
          txn_id: "ms-sample_ord_502-1",
          udf7: "",
          payment_method: "VISA",
          txn_uuid: "mozjMqS7hbYyLR6fdw1",
          metadata: {
            payment_page_client_id: "FILTERED",
            merchant_payload:
              '{"customerPhone":"999999999","customerEmail":"1111111"}',
            payment_page_sdk_payload: "FILTERED",
            payment_links: {
              web: "https://smartgateway.hdfcbank.com/orders/ordeh_3bdee390002446519a8ba483d41e0e7e/payment-page",
              iframe:
                "https://smartgateway.hdfcbank.com/orders/ordeh_3bdee390002446519a8ba483d41e0e7e/payment-page",
              mobile:
                "https://smartgateway.hdfcbank.com/orders/ordeh_3bdee390002446519a8ba483d41e0e7e/payment-page",
            },
          },
          udf5: "",
          status_id: 27,
          amount_refunded: 0,
          udf9: "",
          gateway_reference_id: null,
          status: "AUTHORIZATION_FAILED",
          bank_error_message: "Not sufficient funds",
          id: "ordeh_3bdee390002446519a8ba483d41e0e7e",
          auth_type: "THREE_DS",
          udf3: "",
          udf6: "",
          udf10: "",
          effective_amount: 8,
          product_id: "",
          bank_pg: null,
          order_id: "sample_ord_502",
          return_url: "https://shop.merchant.com",
          payment_gateway_response: {
            txn_id: null,
            gateway_response: {
              authCode: "",
              resMessage: "FILTERED",
              mandateToken: "",
              resCode: "03",
            },
            created: "2023-08-10T07:19:10Z",
            resp_message: null,
            resp_code: null,
            auth_id_code: "",
            epg_txn_id: null,
            rrn: null,
          },
          udf1: "",
          currency: "INR",
          udf4: "",
          customer_id: "FILTERED",
          date_created: "1111111T07:18:57Z",
          gateway_id: 100,
          payment_links: {
            web: "https://smartgateway.hdfcbank.com/merchant/pay/ordeh_3bdee390002446519a8ba483d41e0e7e",
            iframe:
              "https://smartgateway.hdfcbank.com/merchant/ipay/ordeh_3bdee390002446519a8ba483d41e0e7e",
            mobile:
              "https://smartgateway.hdfcbank.com/merchant/pay/ordeh_3bdee390002446519a8ba483d41e0e7e?mobile=true",
          },
          txn_detail: {
            express_checkout: true,
            txn_id: "ms-sample_ord_502-1",
            txn_amount: 8,
            error_message: "Not sufficient funds",
            txn_uuid: "mozjMqS7hbYyLR6fdw1",
            created: "2023-08-10T07:19:07Z",
            metadata: { payment_channel: "WEB", microapp: "hyperpay" },
            gateway: "DUMMY",
            status: "AUTHORIZATION_FAILED",
            net_amount: 8,
            order_id: "sample_ord_502",
            currency: "INR",
            error_code: "03",
            gateway_id: 100,
            surcharge_amount: null,
            txn_flow_type: "FILTERED",
            tax_amount: null,
            redirect: true,
          },
          bank_error_code: "03",
          udf8: "",
          payment_method_type: "CARD",
          rewards_breakup: null,
          customer_phone: "FILTERED",
          merchant_id: "ms",
          customer_email: "FILTERED",
          udf2: "",
          amount: 8,
          refunded: false,
          card: "FILTERED",
        },
      },
    };

    return await this.orderModel.findOneAndUpdate(
      { _id: body.data.orderId },
      { orderStatus: "rejected", paymentStatus: "failed" }
    );
  }

  public async verifyPayment() {
    const crypto = await import("crypto");

    const verify_hmac = (params: any, secret: string) => {
      let paramsList: any = [];
      for (var key in params) {
        if (key != "signature" && key != "signature_algorithm") {
          paramsList[key] = params[key];
        }
      }

      paramsList = sortObjectByKeys(paramsList);

      var paramsString = "";
      for (var key in paramsList) {
        paramsString = paramsString + key + "=" + paramsList[key] + "&";
      }

      let encodedParams = encodeURIComponent(
        paramsString.substring(0, paramsString.length - 1)
      );
      let computedHmac = crypto
        .createHmac("sha256", secret)
        .update(encodedParams)
        .digest("base64");
      let receivedHmac = decodeURIComponent(params.signature);

      console.log("computedHmac :", computedHmac);
      console.log("receivedHmac :", receivedHmac);

      return decodeURIComponent(computedHmac) == receivedHmac;
    };

    const sortObjectByKeys = (o: any) => {
      return Object.keys(o)
        .sort()
        .reduce((r: any, k) => ((r[k] = o[k]), r), {});
    };

    console.log(
      verify_hmac(
        {
          status_id: "21",
          status: "CHARGED",
          order_id: "**6**3**",
          signature: "******crdU/AW8BkpqnMHK2********TE=",
          signature_algorithm: "HMAC-SHA256",
        },
        ""
      )
    );
  }

  public async fetchandUpdateOrderStatus(orderNo: string) {
    let shipmentRes: any = {};
    let updateObj: any = {};
    const paymentService = new PaymentGatewayService();
    const orderDetails = await paymentService.fetchOrderStatus(orderNo);
    console.log("orderDetails++++++++++++", orderDetails);

    // const orderDetails = { status: "Charged" };
    const pgOrderStatus =
      orderDetails.status as keyof typeof this.paymentStatusMapping;
    const paymentStatus = this.paymentStatusMapping[pgOrderStatus] || "pending";
    const orderStatus = this.orderStatusMapping[pgOrderStatus] || "ordered";
    console.log("pgOrderStatus]++++++++++++", pgOrderStatus);
    console.log("paymentStatus++++++++++++", paymentStatus);

    if (orderDetails.status === 'CHARGED') {
      const boxSizeParams: any = { length: 0, breadth: 0, height: 0 };
      const order: any = await this.orderModel.findOne({ orderNo }).populate("itemList.product");
      const consumer: any = await this.consumerService.fetchSingleUser(order.consumer)
      const billExist: any = await this.billingService.findOneBill(order?._id)
      // check bill exist or not
      if (!billExist) {
        // bill creation
        let createObj = createOrderAndBillInfo(
          order?.orderStatus,
          order?.status,
          order?.cgst,
          order?.sgst,
          order?.igst,
          order?.gstTotal,
          order?.billingAddress,
          order?.shippingAddress,
          order?.actualAmount,
          order?.shippingCharges,
          order?.discountAmount,
          order?.discount,
          order?.orderedBy,
          order?.courier_company_id,
          order?.fullName,
          order?.phoneNo,
          order?.total,
          order?.totalProductsPrice,
          order?.emailId,
          order?.company,
          order?.createdBy,
          order?.createdByName,
          consumer,
          order?.itemList,
          order?._id,
        );
        const bill: any = await this.billingService.create(createObj);
        console.log("bill-----------------------------------", bill);
        if (bill) {
          await this.pdfService.createinvoice(
            bill.billingId,
            bill.invoiceNo,
            bill.branchId,
            bill.userId,
            bill.fullName,
            bill.phoneNo,
            bill.emailId,
            bill.companyName,
            bill.branchName,
            bill.centreName,
            bill.branchAddress,
            bill.memberAddress,
            bill.gstNo,
            bill.link,
            bill.note,
            bill.date,
            bill.cgst,
            bill.sgst,
            bill.igst,
            bill.gstTotal,
            bill.key,
            bill.discount,
            bill.amount,
            bill.discountAmt,
            bill.taxAmt,
            bill.total,
            bill.finalAmount,
            bill.shippingCharges,
            bill.pendingAmount,
            bill.writeOffAmount,
            bill.writeOffDate,
            bill.dueDate,
            bill.paymentId,
            bill.paymentStatus,
            bill.invoiceStatus,
            bill.logo,
            bill.gstChargedOn,
            bill.gstStatus,
            bill.createDate,
            bill.updatedAt,
            bill.createdBy,
            bill.updatedBy,
            bill.createdByName,
            bill.updatedByName,
            bill.comment,
            bill.manualRecpritNumber,
            bill.billType,
            bill.memberGSTNo,
            bill.lastPaymentId,
            bill.lastPaymentcomment,
            bill.assignedTo,
            bill.assignedToName,
            bill.autoRenewal,
            bill.isLatest,
            bill.resale,
            order?.itemList
          );
          // return invoice
        }
        const findPickUpLocation = await this.ShipRocketService.findPickUpLocation(order?.billingAddress?.pincode)
        const itemList = order?.itemList?.map((item: any) => {
          boxSizeParams.length = boxSizeParams?.length + item?.length;
          boxSizeParams.breadth = boxSizeParams?.breadth + item?.breadth;
          boxSizeParams.height = boxSizeParams?.height + item?.height;
          return {
            name: item?.productName,
            sku: item?.productCode,
            units: item?.orderQty,
            selling_price: item?.actualProductPrice
          }
        })
        console.log("findPickUpLocation",findPickUpLocation);
        
        const shipmentOrderData: any = {
          order_date: order.createdAt,
          billing_customer_name: order?.fullName,
          courier_company_id: order?.courier_company_id,
          billing_last_name: order?.fullName.split(' ')[1],
          billing_address: order?.billingAddress?.address,
          billing_city: order?.billingAddress?.city,
          billing_pincode: order?.billingAddress?.pincode,
          billing_state: order?.billingAddress?.state,
          billing_country: order?.billingAddress?.country,
          billing_email: order?.emailId,
          billing_phone: order?.phoneNo,
          shipping_is_billing: true,
          order_items: itemList,
          payment_method: "Prepaid",
          sub_total: order?.finalAmount,
          length: boxSizeParams?.length,
          breadth: boxSizeParams?.breadth,
          height: boxSizeParams?.height,
          weight: calWeight(order?.itemList),
          pickup_location: findPickUpLocation?.pickuplocation,
          vendor_details: {
            email: findPickUpLocation?.email,
            phone: findPickUpLocation?.phone,
            name: findPickUpLocation?.name,
            address: findPickUpLocation?.address,
            address_2: findPickUpLocation?.address_2,
            city: findPickUpLocation?.city,
            state: findPickUpLocation?.state,
            country: findPickUpLocation?.country,
            pin_code: findPickUpLocation?.pin_code,
            pickup_location: findPickUpLocation?.pickup_location
          }
        }
        shipmentRes = await this.ShipRocketService.createShipmentOrder(shipmentOrderData);
        updateObj.shipRocketOrder = shipmentRes?.res?.data
        updateObj.shipmentOrderId = shipmentRes?.shipmentOrderId
        updateObj.bill = bill?._id
        updateObj.invoiceNo = bill?.invoiceNo
        console.log("shipmentOrderId", shipmentOrderData);
      }
    }
    updateObj["orderComeFrom"] = "www.themixxo.com";
    updateObj.orderStatus = orderStatus;
    updateObj.paymentStatus = paymentStatus;
    console.log("updateObj+++++++++++++++", updateObj);
    
    let res = await this.orderModel.findOneAndUpdate(
      { orderNo },
      updateObj,
      { new: true }
    );
    await this.RedisCacheService.clearAllData()
    console.log("res", res);
    
    return res
    
  }

  public async cancelOrderService(body: any) {
    try {
      const cancelOrder = await this.ShipRocketService.cancelOrder(body)

      console.log("cancelOrder", body, cancelOrder?.status_code);

      if (cancelOrder.status_code === 200 || cancelOrder.status === 200) {
        await this.orderModel.findOneAndUpdate(
          { 'shipRocketOrder.payload.order_id': body?.ids[0] },
          { orderStatus: 'cancelled' },
          { new: true }
        );
      }
      console.log("cancelOrder", cancelOrder);

      return cancelOrder
    } catch (error) {
      console.log("cancel order service", error);

    }

  }

  public async fetchOrderAndTrackingRecord(shipment_id: string, orderId: string) {
    const order = await this.fetchSingleOrder(orderId);
    const trackingStatus = await this.ShipRocketService.trackShipment(shipment_id);
    return { ...order?._doc, trackingStatus: { ...trackingStatus } }
  }

  public async webhookService(body: iShipRocketOrderStatus) {
    try {
      console.log("webhook---body", body);

      const order = await this.orderModel.findOneAndUpdate(
        { shipmentOrderId: body.order_id },
        { shipRocketOrderStatus: body },
        { new: true }
      );
      console.log("order-------", order);
      // const email = await this.ShipRocketService.webHookForOrderStatus(body , order);
      // console.log("email-------",email);
      return
    } catch (error) {
      console.log("webhookService", error);

    }
  }


  /////// dashborad
  public async getTotalSales(searchData: any): Promise<any> {
    try {
      const startOfLastMonth = moment().subtract(1, 'months').startOf('month').toISOString();
      const endOfLastMonth = moment().subtract(1, 'months').endOf('month').toISOString();
      const startOfCurrentMonth = moment().startOf('month').toISOString();
      let searchQuery: any = {
        paymentStatus: "success",
        orderStatus: 'accepted'
      }
      searchQuery['createdAt'] = { $gte: new Date(searchData?.startDate ? new Date(searchData?.startDate) : new Date(startOfCurrentMonth)), $lte: searchData?.endDate ? new Date(searchData?.endDate) : new Date() }
      if (searchData?.lastMonth) searchQuery['createdAt'] = { '$gte': new Date(startOfLastMonth), '$lte': new Date(endOfLastMonth) }
      console.log('searrch', searchQuery);

      return await this.orderModel.aggregate([
        {
          $match: searchQuery
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$finalAmount" }
          }
        }
      ])


    } catch (error) {
      console.log("error", error);

    }
  }

  public async getMostPopularProducts(searchData: any): Promise<any> {
    try {
      const startOfLastMonth = moment().subtract(1, 'months').startOf('month').toISOString();
      const endOfLastMonth = moment().subtract(1, 'months').endOf('month').toISOString();
      const startOfCurrentMonth = moment().startOf('month').toISOString();
      let searchQuery: any = {
        paymentStatus: "success",
        orderStatus: 'accepted'
      }
      searchQuery['createdAt'] = { $gte: new Date(searchData?.startDate ? new Date(searchData?.startDate) : new Date(startOfCurrentMonth)), $lte: searchData?.endDate ? new Date(searchData?.endDate) : new Date() }
      if (searchData?.lastMonth) searchQuery['createdAt'] = { '$gte': new Date(startOfLastMonth), '$lte': new Date(endOfLastMonth) }
      console.log('searrch', searchQuery);

      const products = await this.orderModel.aggregate(
        [
          {
            $match: searchQuery
          },
          {
            $unwind: "$itemList"
          },
          {
            $group: {
              _id: "$_id",
              uniqueProducts: { $addToSet: "$itemList.productName" }
            }
          },
          {
            $unwind: "$uniqueProducts"
          },
          {
            $group: {
              _id: "$uniqueProducts",
              totalSalesOfProducts: { $sum: 1 },
            }
          },
          {
            $sort: { totalSalesOfProducts: -1 }
          }
        ]

      )
      return products.slice(0,4)
    } catch (error) {
      console.log("error", error);

    }
  }

  public async salesPerProductsCategory(searchData: any): Promise<any> {
    try {
      const startOfLastMonth = moment().subtract(1, 'months').startOf('month').toISOString();
      const endOfLastMonth = moment().subtract(1, 'months').endOf('month').toISOString();
      const startOfCurrentMonth = moment().startOf('month').toISOString();
      let searchQuery: any = {
        paymentStatus: "success",
        orderStatus: 'accepted'
      }
      searchQuery['createdAt'] = { $gte: new Date(searchData?.startDate ? new Date(searchData?.startDate) : new Date(startOfCurrentMonth)), $lte: searchData?.endDate ? new Date(searchData?.endDate) : new Date() }
      if (searchData?.lastMonth) searchQuery['createdAt'] = { '$gte': new Date(startOfLastMonth), '$lte': new Date(endOfLastMonth) }
      console.log('searrch', searchQuery);

      return this.orderModel.aggregate(
        [
          {
            $match: searchQuery
          },
          {
            $unwind: "$itemList"
          },
          {
            $group: {
              _id: "$itemList.productCategory",
              products: {
                $sum: '$itemList.orderPrice'

              }
            }
          },
          {
            $project: {
              _id: 1,
              total: "$products"
            }
          }
        ]

      )
    } catch (error) {
      console.log("error", error);

    }
  }

  public async repeatAndNewOrders(): Promise<any> {
    try {
      let orders = await this.orderModel.aggregate(
        [
          {
            $addFields: {
              month: { $month: "$createdAt" }  // Extract month from createdAt
            }
          },
          {
            $group: {
              _id: {
                emailId: "$emailId",
                month: "$month",
                year: { $year: "$createdAt" }
              },
              totalOrder: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              emailId: "$_id.emailId",
              month: "$_id.month",
              year: "$_id.year",
              totalOrder: 1,
              Repeat: { $cond: [{ $gt: ["$totalOrder", 1] }, "$totalOrder", 0] },
              New: { $cond: [{ $eq: ["$totalOrder", 1] }, "$totalOrder", 0] }
            }
          },
          {
            $group: {
              _id: { month: "$month", year: "$year" },
              new: { $sum: '$New' },
              repeat: { $sum: '$Repeat' }
            }
          },
          {
            $sort: { "_id.month": 1 }  // Optional: Sort by year for easier plotting on a time-based chart
          }
        ]

      )

      const newOrders = orders.map((item) => {
        let timeObj = getMonthDate(item?._id?.month, item?._id?.year)
        return {
          ...item,
          dates: timeObj
        }
      })
      return newOrders
    } catch (error) {
      console.log("error", error);

    }
  }

  public async averageOrderFinalAmount(searchData: any): Promise<any> {
    try {
      const startOfLastMonth = moment().subtract(1, 'months').startOf('month').toISOString();
      const endOfLastMonth = moment().subtract(1, 'months').endOf('month').toISOString();
      const startOfCurrentMonth = moment().startOf('month').toISOString();
      let searchQuery: any = {
        paymentStatus: "success",
        orderStatus: 'accepted'
      }
      searchQuery['createdAt'] = { $gte: new Date(searchData?.startDate ? new Date(searchData?.startDate) : new Date(startOfCurrentMonth)), $lte: searchData?.endDate ? new Date(searchData?.endDate) : new Date() }
      if (searchData?.lastMonth) searchQuery['createdAt'] = { '$gte': new Date(startOfLastMonth), '$lte': new Date(endOfLastMonth) }
      console.log('searrch', searchQuery);

      return this.orderModel.aggregate(
        [
          {
            $match: searchQuery
          },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              averageOrderFinalAmount: { $avg: { $sum: "$finalAmount" } }
            }
          },
          {
            $project: {
              _id: 0,
              totalOrders: 1,
              averageOrderFinalAmount: 1
            }
          }
        ]
      )
    } catch (error) {
      console.log("averageOrderFinalAmount", error);

    }
  }

  public async salesTrend(timeFlag: any): Promise<any> {
    try {
      let timeObj: any = (timeFlag === 'month') ? { $month: "$createdAt" } : { $week: "$createdAt" }
      let trends = await this.orderModel.aggregate(
        [
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: timeObj
              },
              Sales: { $sum: "$finalAmount" },
              Orders: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              year: "$_id.year",
              month: "$_id.month",
              Sales: 1,
              Orders: 1
            }
          },
          { $sort: { year: 1, month: 1 } }
        ]
      )

      const newTrendsArr = trends?.map((item) => {
        let newObj:any = (timeFlag === 'month') ? getMonthDate(item?.month, item?.year) : getWeekDates(item?.month, item?.year)
        return {
          ...item,
          Sales: item.Sales?.toFixed(2),
          dates: (timeFlag === 'month') ?  newObj : `${newObj?.start} to ${newObj?.end}`
        }
      });
      return newTrendsArr
    } catch (error) {
      console.log("salesTrend error", error);

    }
  }

  public async orderStatus(searchData: any): Promise<any> {
    try {
      const startOfLastMonth = moment().subtract(1, 'months').startOf('month').toISOString();
      const endOfLastMonth = moment().subtract(1, 'months').endOf('month').toISOString();
      const startOfCurrentMonth = moment().startOf('month').toISOString();
      let searchQuery: any = {}
      searchQuery['createdAt'] = { $gte: new Date(searchData?.startDate ? new Date(searchData?.startDate) : new Date(startOfCurrentMonth)), $lte: searchData?.endDate ? new Date(searchData?.endDate) : new Date() }
      if (searchData?.lastMonth) searchQuery['createdAt'] = { '$gte': new Date(startOfLastMonth), '$lte': new Date(endOfLastMonth) }
      console.log('searrch', searchQuery);

      return await this.orderModel.aggregate(
        [
          {
            $match: searchQuery
          },
          {
            $group: {
              _id: "$orderStatus",
              total: { "$sum": 1 }
            }
          },
          {
            $project: {
              _id: 0,
              status: "$_id",
              total: 1
            }
          }
        ]
      )
    } catch (error) {
      console.log("orderStatus error", error);

    }
  }

  public async productPerformance(searchData: any): Promise<any> {
    try {
      const startOfLastMonth = moment().subtract(1, 'months').startOf('month').toISOString();
      const endOfLastMonth = moment().subtract(1, 'months').endOf('month').toISOString();
      const startOfCurrentMonth = moment().startOf('month').toISOString();
      let searchQuery: any = {}
      searchQuery['createdAt'] = { $gte: new Date(searchData?.startDate ? new Date(searchData?.startDate) : new Date(startOfCurrentMonth)), $lte: searchData?.endDate ? new Date(searchData?.endDate) : new Date() }
      if (searchData?.lastMonth) searchQuery['createdAt'] = { '$gte': new Date(startOfLastMonth), '$lte': new Date(endOfLastMonth) }
      console.log('searrch', searchQuery);

      const products = await this.orderModel.aggregate(
        [
          {
            $match: searchQuery
          },
          {
            $unwind: "$itemList"
          },
          {
            $group: {
              _id: "$itemList.productName",
              units: { $sum: "$itemList.orderQty" },
              revenue: { $sum: "$finalAmount" }
            }
          },
          {
            $sort: {
              units: -1
            }
          }
        ]
      )
      return products.slice(0, 5)
    } catch (error) {
      console.log("productPerformance error", error);

    }
  }

  public async revenueByChannel(): Promise<any> {
    try {

      const order = await this.orderModel.aggregate(
        [
          {
            $group: {
              _id:  {
                channel : "$orderComeFrom"
              },
              revenue : {$sum : "$finalAmount"},
              orders : {$sum : 1}
            }
          },
          {
            $project: {
              _id : 0,
              channel : "$_id.channel",
              revenue : "$revenue",
              orders : "$orders",
            }
          }
        ]
      )
      const newTrendsArr = order?.map((item) => {
        return {
          ...item,
          revenue: item.revenue?.toFixed(2),
        }
      });
      
      return newTrendsArr
    } catch (error) {
      console.log("revenueByChannel error", error);

    }
  }




}

export default orderService;
