import mongoose, { Document } from "mongoose";

export interface iOrderItem {
  itemId: String;
  productId: String;
  product_id: String;
  productName: String;
  productCatogry: String;
  productCatogryId: String;
  custmaizedImage: Array<String>;
  orderQty: {
    type: Number;
    required: true;
  };
  orderPrice: Number;
  actualProductPrice: Number;
  discount: Number;
  cgst: Number;
  sgst: Number;
  igst: Number;
  gstTotal: Number;
  gstChargedOn: String;
  taxPercentage: Number;
  gstRateInPercentage: String;
  coupon?: {
    discount: Number;
  };
}
export interface iShipRocketOrder {
  status: Number,
  payload: {
    pickup_location_added?: Number,
    order_created?: Number,
    awb_generated?: Number,
    label_generated?: Number,
    pickup_generated?: Number,
    manifest_generated?: Number,
    pickup_scheduled_date?: Number,
    pickup_booked_date?: String,
    order_id?: Number,
    shipment_id?: Number,
    awb_code?: Number,
    courier_company_id?: Number,
    courier_name?: String,
    assigned_date_time: {
      date?: String,
      timezone_type?: Number,
      timezone?: String
    },
    applied_weight?: Number,
    cod?: Number,
    label_url?: Number,
    manifest_url?: Number,
    routing_code?: Number,
    rto_routing_codeNumber?: String,
    pickup_token_number?: String
    action?: String,
    error_message?: String
  }
  message?: String,
  errors: {
    order_id?: [
      String
    ]
  },
  status_code?: Number
}

export interface iShipRocketOrderStatus {
  awb: String
  courier_name: String
  current_status: String
  current_status_id: Number
  shipment_status: String
  shipment_status_id: Number
  current_timestamp: String
  order_id: String
  sr_order_id: Number
  awb_assigned_date: String
  pickup_scheduled_date: String
  etd: String
  // scans: [
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     date: String,
  //     status: String,
  //     activity: String,
  //     location: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   },
  //   {
  //     location: String,
  //     date: String,
  //     activity: String,
  //     status: String,
  //     srStatus: String,
  //     srStatusLabel: String,
  //   }
  // ]
  scans:Array<any>,
  is_return: Number
  channel_id: Number
  pod_status: String
  pod: String
}
export default interface iOrder extends Document {
  orderNo: String;
  shipmentOrderId: String;
  invoiceNo: String;
  shippingCharges: Number;
  orderStatus: String;
  status: String;
  fullName: String;
  phoneNo: String;
  emailId: String;
  orderPlaced: {
    address: String;
    date: Date;
    note: String;
  };
  orderAccepted: {
    orderedAcceptedBy: String;
    date: Date;
    status: String;
    note: String;
  };
  orderCancelled: {
    orderedCancelledBy: String;
    date: Date;
    status: String;
    note: String;
  };
  orderRejected: {
    orderedRejectedBy: String;
    date: Date;
    status: String;
    note: String;
  };
  sentForPrint: {
    address: String;
    date: Date;
    note: String;
  };
  handedOverToLogisticPartners: {
    address: String;
    date: Date;
    note: String;
  };
  assignVendor: {
    vendorId: String;
    role: String;
    fullName: String;
    status: String;
    date: Date;
    note: String;
    assignBy: String;
  };
  packed: {
    address: String;
    date: Date;
    note: String;
  };
  dispatch: {
    address: String;
    date: Date;
    note: String;
  };
  delivered: {
    address: String;
    date: Date;
    note: String;
  };
  expectedDateOfDelivery: {
    address: String;
    date: Date;
    note: String;
    status: String;
  };
  itemList: Array<iOrderItem>;
  shippingAddress: {
    address: String;
    city: String;
    locality: String;
    state: String;
    pincode: String;
  };
  billingAddress: {
    address: String;
    city: String;
    locality: String;
    state: String;
    pincode: String;
  };
  cgst: Number;
  sgst: Number;
  igst: Number;
  gstTotal: Number;
  total: Number;
  finalAmount: Number;
  totalProductsPrice: Number;
  actualAmount: Number;
  discountAmount: Number;
  discount: Number;
  assignToVendorByName: String;
  courier_company_id: Number;
  orderedByName: String;
  createdBy: String;
  createdByName: String;
  updatedBy: String;
  companyName: String;
  assignToVendor: String;
  company: String;
  consumer: String;
  bill: String;
  orderedBy: String;
  orderComeFrom: String;
  reportingTo: String;
  paymentStatus: String;
  shipRocketOrder: Array<iShipRocketOrder>
  shipRocketOrderStatus: iShipRocketOrderStatus
}
