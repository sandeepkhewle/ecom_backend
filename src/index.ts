import 'dotenv/config'
import 'module-alias/register'
import vaildateEnv from '@/utils/validaterEnv'
import cron from "node-cron";
import App from "./app";
import companyController from "@/resources/company/controller";
import consumerController from "@/resources/consumer/controller";
import companyUserController from "@/resources/companyUser/controller";
import productController from "@/resources/product/controller";
import orderController from "@/resources/order/controller";
import notificationController from "@/resources/notification/controller";
import structureController from "./resources/structure/controller";
import salesUserController from "@/resources/salesUser/controller";
import categoryController from "@/resources/category/controller";
import BillController from "@/resources/Billing/controller";
import cartController from "@/resources/cart/controller";
import dashBoardController from "@/resources/dashBoard/controller";
import subCategoryController from "./resources/subCategory/controller";
import tamplateController from "./resources/Templates/controller";
import paymentSystemController from "./resources/paymentSysteam/controller";
import StockHistoryController from "./resources/stockHistory/controller";
import ShipRocketController from './resources/ShipRocket/controller';

vaildateEnv();
console.log("process.env.SECUREPORT", process.env.SECUREPORT);
console.log("process.env.PORT", process.env.PORT);
const app = new App(
  [
    new companyController(),
    new consumerController(),
    new companyUserController(),
    new productController(),
    new orderController(),
    new notificationController(),
    new structureController(),
    new salesUserController(),
    new categoryController(),
    new subCategoryController(),
    new BillController(),
    new cartController(),
    new dashBoardController(),
    new paymentSystemController(),
    new StockHistoryController(),
    new tamplateController(),
    new ShipRocketController(),
  ],
  Number(process.env.PORT),
  Number(process.env.SECUREPORT)
);

app.listen();

// Schedule the task to run every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  console.log("running a task every 15 minutes");
  const cronService = (await import("./utils/gobalServices/cron.service"))
    .default;
  cronService.checkOrderPaymentStatus();
});