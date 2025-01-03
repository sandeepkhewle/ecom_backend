import mongoose, { Model, Schema, model, Document } from "mongoose";
import iOrder from "./interface";
import iStockHistory from "../stockHistory/interface";

type NonEmptyArray<T> = T[] & { 0: T };

export interface iOrderDocument extends iOrder, Document {
  calculate(lastInvoiceNo: Number): Promise<Error | Number>;
  validateStock(): Promise<iOrderDocument>;
}

export interface iOrderWithPaymentLink extends iOrderDocument {
  payment_links: {
    web: String;
    expiry: String;
  };
}

interface OrderModel extends Model<iOrderDocument> {
  createWithPaymentSession(body: any): Promise<iOrderWithPaymentLink>;
}

const orderSchema = new Schema<iOrderDocument>(
  {
    orderNo: { type: String, index: true },
    invoiceNo: { type: String, index: true },
    // orderStatus: { type: String, default: "pending" },
    orderPlaced: {
      orderedBy: String,
      date: { type: Date },
      note: String,
    },
    orderAccepted: {
      orderedAcceptedBy: String,
      date: { type: Date },
      status: String,
      note: String,
    },
    orderCancelled: {
      orderedCancelledBy: String,
      date: { type: Date },
      status: String,
      note: String,
    },
    orderRejected: {
      orderedRejectedBy: String,
      date: { type: Date },
      status: String,
      note: String,
    },
    handedOverToLogisticPartners: {
      logisticPartnerName: String,
      date: { type: Date },
      status: String,
      note: String,
    },
    assignVendor: {
      vendorId: String,
      role: String,
      fullName: String,
      status: String,
      date: { type: Date },
      note: String,
      assignBy: String,
    },
    packed: {
      salesId: String,
      role: String,
      fullName: String,
      status: String,
      date: { type: Date },
      note: String,
    },
    dispatch: {
      salesId: String,
      role: String,
      fullName: String,
      status: String,
      channelPartner: String,
      dispatchId: String,
      address: String,
      date: { type: Date },
      note: String,
    },
    delivered: {
      status: String,
      address: String,
      date: { type: Date },
      note: String,
    },
    expectedDateOfDelivery: {
      status: String,
      address: String,
      date: { type: Date },
      note: String,
    },
    fullName: String,
    phoneNo: String,
    emailId: String,
    shippingAddress: {
      address: String,
      city: String,
      locality: String,
      state: String,
      pincode: String,
      country: String,
    },
    billingAddress: {
      address: String,
      city: String,
      locality: String,
      state: String,
      pincode: String,
      country: String,
    },

    // approvalStatus: { type: String, default: "waitingForApproval", enum: ["approval", "deny", "waitingForApproval"] },
    orderStatus: {
      type: String,
      default: "ordered",
      enum: ["ordered", "accepted", "rejected", "cancelled"],
    },

    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "success", "failed"],
    },
    itemList: [
      {
        itemId: { type: mongoose.Schema.Types.String, auto: true },
        productId: String,
        productName: String,
        productCategory: String,
        productCategoryId: {type : mongoose.Types.ObjectId , ref : 'Categories'},
        productCode: String,
        hsnCode: String,
        orderQty: Number,
        custmaizedImage: [String],
        custmaizedMainImage: String,
        gstRateInPercentage: String,
        orderPrice: Number,
        actualProductPrice: Number,
        discount: Number,
        length: Number,
        breadth: Number,
        height: Number,
        productWeightInGrams: Number,
        cgst: { type: Number, default: 0 },
        sgst: { type: Number, default: 0 },
        igst: { type: Number, default: 0 },
        gstTotal: { type: Number, default: 0 },
        gstChargedOn: String,
        taxPercentage: Number,
        product: { type: mongoose.Types.ObjectId, ref: "Products" },
        // companyProductMaps: {type:  mongoose.Types.ObjectId , ref: 'companyProductMaps' },
        // templates: {type:  mongoose.Types.ObjectId , ref: "templates" },
      },
    ],
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    gstTotal: { type: Number, default: 0 },
    total: Number,
    finalAmount: Number,
    actualAmount: Number,
    shippingCharges: Number,
    discountAmount: Number,
    discount: Number,
    assignToVendorByName: String,
    orderedByName: String,
    // approvedByName: String,
    // approvedDate:{ type: Date },
    updatedBy: String,
    // relationshipManagerName: String,
    companyName: String,
    shipmentOrderId: String,
    courier_company_id: Number,
    shipRocketOrder: {
      status: Number,
      payload: {
        pickup_location_added: Number,
        order_created: Number,
        awb_generated: Number,
        label_generated: Number,
        pickup_generated: Number,
        manifest_generated: Number,
        pickup_scheduled_date: String,
        rate: Number,
        pickup_booked_date: String,
        order_id: Number,
        shipment_id: Number,
        awb_code: String,
        courier_company_id: Number,
        courier_name: String,
        assigned_date_time: {
          date: String,
          timezone_type: Number,
          timezone: String
        },
        applied_weight: Number,
        cod: Number,
        label_url: String,
        manifest_url: String,
        routing_code: String,
        rto_routing_codeNumber: String,
        pickup_token_number: String,
        action: String,
        error_message: String
      },
      message: String,
      errors: {
        order_id: [
          String
        ]
      },
      status_code: Number
    },
    shipRocketOrderStatus: {
      awb: String,
      courier_name: String,
      current_status: String,
      current_status_id: Number,
      shipment_status: String,
      shipment_status_id: Number,
      current_timestamp: String,
      order_id: String,
      sr_order_id: Number,
      awb_assigned_date: String,
      pickup_scheduled_date: String,
      etd: String,
      is_return: Number,
      channel_id: Number,
      pod_status: String,
      pod: String,
      scans: Array
    },
    orderComeFrom: String,
    assignToVendor: { type: mongoose.Schema.Types.ObjectId, ref: "salesUsers" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "companys" },
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: "consumers" },
    bill: { type: mongoose.Schema.Types.ObjectId, ref: "billings" },
    // reportingTo: { type: String , default :  mongoose.Types.ObjectId, ref: "companyUser" },
    orderedBy: {
      type: mongoose.Types.ObjectId,
      ref: "consumers",
    },
  },
  { timestamps: true }
);

// orderSchema.statics.calculate = function (lastInvoiceNo) {
//   let invoiceNo: number = lastInvoiceNo;
//   return invoiceNo;
// };

// orderSchema.pre("save", async function (next) {
//   const ProductModel = (await import("../product/model")).default;

//   const productIds = this.itemList.map((item) => item.productId);
//   const products = await ProductModel.find({ _id: { $in: productIds } });

//   const outofStockProducts: String[] = [];
//   products.forEach((product) => {
//     const item = this.itemList.find(
//       (item) => item.productId === product._id.toString()
//     );
//     if (item?.orderQty) {
//       if (product.stock - Number(item.orderQty) < 0) {
//         outofStockProducts.push(product.productName);
//       }
//     }
//   });

//   if (outofStockProducts.length)
//     throw new Error(
//       `Insufficient Stock for product(s): ${outofStockProducts.join(", ")}`
//     );
//   next();
// });

orderSchema.methods.validateStock = async function (): Promise<iOrderDocument> {
  const ProductModel = (await import("../product/model")).default;

  const order = this as iOrderDocument;

  const productIds = order.itemList.map((item) => item.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } });

  const outofStockProducts: String[] = [];
  const zeroStockProducts: String[] = [];
  products.forEach((product) => {
    const item = order.itemList.find(
      (item) => item.productId === product._id.toString()
    );
    if (item?.orderQty) {
      if (product.stock === 0) {
        zeroStockProducts.push(product._id.toString());
      } else if (product.stock - Number(item.orderQty) < 0) {
        outofStockProducts.push(product.productName);
      }
    }
  });

  if (zeroStockProducts.length) {
    const newItems =
      order.itemList.filter(
        (item) => !zeroStockProducts.includes(item.productId)
      ) || [];
    if (newItems.length > 0) {
      order.itemList = newItems;
    } else {
      throw new Error("All products are out of stock");
    }
  }

  if (outofStockProducts.length)
    throw new Error(
      `Insufficient Stock for product(s): ${outofStockProducts.join(", ")}`
    );
  return order;
};

// orderSchema.statics.createWithPaymentSession = async function (body: any) {
//   const session = await mongoose.startSession();
//   session.startTransaction(); // Start the transaction
//   let paymentOrder: iOrderWithPaymentLink | null = null;
//   try {
//     const order = await this.create(body);

//     const PaymentGatewayService = (
//       await import("../../utils/gobalServices/paymentGateway.service")
//     ).default;
//     const paymentGateway = new PaymentGatewayService();
//     const response = await paymentGateway.callSessionApi({
//       orderId: order.orderNo,
//       amount: Number(order.total),
//       customer_email: "sQO5O@example.com",
//       customer_phone: "1234567890",
//       customer_id: order?.orderedBy?.toString() || "admin",
//     });
//     if (!response?.payment_links) throw new Error("Payment Gateway Error");

//     // Commit the transaction
//     await session.commitTransaction();
//     console.log("Transaction committed successfully.");
//     paymentOrder = {
//       ...order,
//       payment_links: response?.payment_links,
//     } as iOrderWithPaymentLink;
//   } catch (error) {
//     // If an error occurs, abort the transaction
//     await session.abortTransaction();
//     console.error("Transaction aborted due to error:", error);
//     throw error;
//   } finally {
//     // End the session
//     session.endSession();
//   }
//   return paymentOrder;
// };

orderSchema.post("save", async function (order, next) {
  try {
    const ProductModel = (await import("../product/model")).default;

    const updateStockPromises: Promise<any>[] = [];
    order.itemList.forEach((item) => {
      updateStockPromises.push(
        ProductModel.updateStock({
          productId: String(item.productId),
          quantity: Number(item.orderQty),
          type: "deduct",
          note: "Order Placed",
          userId: String(order.orderedBy),
        } as iStockHistory)
      );
    });
    await Promise.all(updateStockPromises);
  } catch (error) {
    next(error as Error);
  }
});

orderSchema.index({ invoiceNo: "text", orderNo: "text" });

const Orders = model<iOrderDocument, OrderModel>("orders", orderSchema);

export default Orders;
