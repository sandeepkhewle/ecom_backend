import { iOrderWithPaymentLink } from "@/resources/order/model";
import constants from "../constants";
import { validateParams } from "../helpers";
import axios from "axios";
import orderModel from "../../resources/order/model";
import { encode } from "node-encoder";
import iConsumer from "@/resources/consumer/interface";

export interface IPaymentGatewayInput {
  orderId: String;
  amount: Number;
  customer: iConsumer;
}

class PaymentGatewayService {
  input: IPaymentGatewayInput | undefined;

  constructor() {}

  buildSessionPayload() {
    if (!this.input) throw new Error("Payment Gateway input is required");

    validateParams(this.input, ["orderId", "amount", "customer"]);
    const referenceId = `REF${Date.now()}`; // Custom reference ID for the transaction
    return {
      order_id: this.input.orderId,
      amount: this.input.amount,
      currency: "INR",
      customer_email: this.input.customer.emailId,
      customer_phone: this.input.customer.phoneNo,
      // customer_id: this.input.customer._id.toString(),
      payment_page_client_id: "hdfcmaster", // for sandbox
      action: "paymentPage",
      // return_url: "https://themixxo.com", // ideally order confirmation page
      return_url: "https://themixxo.com/order/"+this.input.orderId+"/confirmation", // ideally order confirmation page
      description: "Complete your payment",
      first_name: this.input.customer.firstName,
      last_name: this.input.customer.lastName,
      // "metadata.JUSPAY:gateway_reference_id": referenceId,
      payment_options: ["credit_card", "debit_card", "net_banking", "upi"],
    };
  }

  basicAuthorization() {
    const apikey = encode(constants.PG_API_KEY);
    return `Basic ${apikey}`;
  }

  async callSessionApi(params: IPaymentGatewayInput) {
    try {
      this.input = params;
      const payload = this.buildSessionPayload();

      // Send request to HDFC Payment Gateway
      const response = await axios.post(
        `${constants.PG_BASE_URL}/session`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: this.basicAuthorization(),
            "x-merchantid": constants.PG_MERCHANT_ID, 
            "x-customerid": "", // TODO: get customer id
          },
        }
      );
      return response.data; // Payment session data
    } catch (error) {
      console.error("Error creating payment session:", error);
      throw error;
    }
  }

  async fetchOrderStatus(orderId: String) {
    try {
      const response = await axios.get(
        `${constants.PG_BASE_URL}/orders/${orderId}`,
        {
          headers: {
            Authorization: this.basicAuthorization(), // base_64_encoded_api_key
            version: "2023-06-30",
            "Content-Type": "application/x-www-form-urlencoded",
            "x-merchantid": constants.PG_MERCHANT_ID,
            "x-customerid": "",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching order status:", error);
      throw error;
    }
  }
}

export default PaymentGatewayService;
