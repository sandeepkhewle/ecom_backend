/** @format */

import iOrder from "@/resources/order/interface";
import orderService from "@/resources/order/service";
import billingService from "@/resources/Billing/services";
import consumerService from "@/resources/consumer/services";
import productService from "@/resources/product/services";
import pdfService from "@/utils/gobalServices/pdf";

import { createOrderAndBillInfo } from "../helpers";
class accountService {
  private orderService = new orderService();
  private productService = new productService();
  private billingService = new billingService();
  private consumerService = new consumerService();
 

  public async createBill(
    {
      orderStatus,
      status,
      itemList,
      cgst,
      sgst,
      igst,
      gstTotal,
      billingAddress,
      shippingAddress,
      actualAmount,
      shippingCharges,
      discountAmount,
      discount,
      orderedBy,
      courier_company_id,
      fullName,
      phoneNo,
      total,
      totalProductsPrice,
      emailId,
      company,
      createdBy,
      createdByName,
    }: iOrder,
    userData: { id: string }
  ) {
    try {
      let udata = await this.consumerService.fetchSingleUser(userData.id);
      console.log("udata", udata);

      let createObj:any = createOrderAndBillInfo(
        orderStatus,
        status,
        cgst,
        sgst,
        igst,
        gstTotal,
        billingAddress,
        shippingAddress,
        actualAmount,
        shippingCharges,
        discountAmount,
        discount,
        orderedBy,
        courier_company_id,
        fullName,
        phoneNo,
        total,
        totalProductsPrice,
        emailId,
        company,
        createdBy,
        createdByName,
        udata,
        itemList,
      )

  
      
      // const bill = await this.billingService.create(createObj);
      // // console.log("bill-----------------------------------",bill);

      // // if (bill) {
      // //   const invoice = await this.pdfService.createinvoice(
      // //     bill.billingId,
      // //     bill.invoiceNo,
      // //     bill.branchId,
      // //     bill.userId,
      // //     bill.fullName,
      // //     bill.phoneNo,
      // //     bill.emailId,
      // //     bill.companyName,
      // //     bill.branchName,
      // //     bill.centreName,
      // //     bill.branchAddress,
      // //     bill.memberAddress,
      // //     bill.gstNo,
      // //     bill.link,
      // //     bill.note,
      // //     bill.date,
      // //     bill.cgst,
      // //     bill.sgst,
      // //     bill.igst,
      // //     bill.gstTotal,
      // //     bill.key,
      // //     bill.discount,
      // //     bill.amount,
      // //     bill.discountAmt,
      // //     bill.taxAmt,
      // //     bill.total,
      // //     bill.finalAmount,
      // //     bill.shippingCharges,
      // //     bill.pendingAmount,
      // //     bill.writeOffAmount,
      // //     bill.writeOffDate,
      // //     bill.dueDate,
      // //     bill.paymentId,
      // //     bill.paymentStatus,
      // //     bill.invoiceStatus,
      // //     bill.logo,
      // //     bill.gstChargedOn,
      // //     bill.gstStatus,
      // //     bill.createDate,
      // //     bill.updatedAt,
      // //     bill.createdBy,
      // //     bill.updatedBy,
      // //     bill.createdByName,
      // //     bill.updatedByName,
      // //     bill.comment,
      // //     bill.manualRecpritNumber,
      // //     bill.billType,
      // //     bill.memberGSTNo,
      // //     bill.lastPaymentId,
      // //     bill.lastPaymentcomment,
      // //     bill.assignedTo,
      // //     bill.assignedToName,
      // //     bill.autoRenewal,
      // //     bill.isLatest,
      // //     bill.resale,
      // //     itemList
      // //   );
      // //   return invoice
      // // }
      return await this.orderService.create(createObj, userData);
    } catch (error) {
      console.log("eroor", error);
      throw error;
    }
  }
}

export default accountService;
