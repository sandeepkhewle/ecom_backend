import OrderService from "@/resources/order/service";
import OrderModel from "@/resources/order/model";

const checkOrderPaymentStatus = async () => {
  const orders = await OrderModel.find({
    paymentStatus: "pending",
  }).select("orderNo");

  const orderService = new OrderService();

  orders.forEach(async (order) => {
    try {
      await orderService.fetchandUpdateOrderStatus(String(order.orderNo));
    } catch (error) {
      console.error(order.orderNo, error);
    }
  });
};

const CronService = {
  checkOrderPaymentStatus,
};

export default CronService;
