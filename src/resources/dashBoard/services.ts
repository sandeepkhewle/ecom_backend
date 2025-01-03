/** @format */

import fs from "fs";
import doc from "pdfkit"; /** @format */
import moment from "moment";
import companyService from "@/resources/company/service";
import orderService from "@/resources/order/service";
import billingService from "@/resources/Billing/services";
import companyUserService from "@/resources/companyUser/services";
import salesUserService from "@/resources/salesUser/service";
import productsService from "@/resources/product/services";
import categoryService from "@/resources/category/services";

import companyModel from "@/resources/company/model";
import orderModel from "@/resources/order/model";
import billingModel from "@/resources/Billing/model";
import companyUserModel from "@/resources/companyUser/model";
import salesUserModel from "@/resources/salesUser/model";
import Products from "@/resources/product/model";

import RedisCache from '@/utils/Redis/Redis'
class Dashboard {
  private companyService = new companyService();
  private orderService = new orderService();
  private billingService = new billingService();
  private companyUserService = new companyUserService();
  private salesUserService = new salesUserService()
  private productsService = new productsService()
  private categoryService = new categoryService()


  private RedisCache = new RedisCache()


  // public async fetchbrifData(): Promise<any> {
  //   try {
  //     let brifInfo: any = {};

  //     const totalVendors = await salesUserModel.aggregate(
  //       [
  //         {
  //           $match: { role: 'vendor' }
  //         }
  //         ,
  //         {
  //           $group: {
  //             _id: null,
  //             total: { $sum: 1 }
  //           }

  //         }
  //       ]
  //     )
  //     const totalProducts = await Products.aggregate(
  //       [
  //         {
  //           $group: {
  //             _id: null,
  //             total: { $sum: 1 }
  //           }

  //         }
  //       ]
  //     )
  //     const totalOrders = await orderModel.aggregate(
  //       [
  //         {
  //           $group: {
  //             _id: null,
  //             total: { $sum: 1 }
  //           }

  //         }
  //       ]
  //     )
  //     const totalEarnings = await orderModel.aggregate(
  //       [
  //         {
  //           $group: {
  //             _id: null,
  //             total: { $sum: '$actualAmount' }
  //           }

  //         }
  //       ]
  //     )

  //     brifInfo.totalEarnings = totalEarnings[0].total;
  //     brifInfo.totalProducts = totalProducts[0].total;
  //     brifInfo.totalOrders = totalOrders[0].total;
  //     brifInfo.totalVendors = totalVendors[0].total;
  //     console.log(brifInfo);
  //     return brifInfo

  //   } catch (error) {
  //     console.log("error", error);
  //     throw error;
  //   }
  // }


  // public async fetchOrderCharts(): Promise<any> {
  //   try {
  //     let chartInfo: any = {};


  //     const totalOrders = await orderModel.aggregate(
  //       [
  //         {
  //           $group: {
  //             _id: null,
  //             total: { $sum: 1 }
  //           }

  //         }
  //       ]
  //     )
  //     chartInfo.latestOrders = await this.orderService.latestOrders();
  //     chartInfo.totalOrders = totalOrders[0].total;


  //     let thisYearOrdersStart = moment(new Date()).subtract(0, 'years').startOf('year').format('YYYY-MM-DD');
  //     let thisYearOrdersEnd = moment(new Date()).subtract(0, 'years').endOf('year').format('YYYY-MM-DD');

  //     const data = await orderModel.find({ createdAt : {$gte : thisYearOrdersStart}})



  //     console.log("thisYearOrdersStart", thisYearOrdersStart, thisYearOrdersEnd, data);

  //     // chart format
  //     const lineData = {
  //       labels: ["Jan", "Feb", "March", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"],
  //       datasets: [
  //         {
  //           data: [2.5, 3, 3, 0.9, 1.3, 1.8, 3.8, 1.5],
  //           borderColor: "#ff8084",
  //           backgroundColor: "#ff8084",
  //           borderWidth: 2,
  //           barPercentage: 0.7,
  //           categoryPercentage: 0.4,
  //         },
  //         {
  //           data: [3.8, 1.8, 4.3, 2.3, 3.6, 2.8, 2.8, 2.8],
  //           borderColor: "#a5a5a5",
  //           backgroundColor: "#a5a5a5",
  //           borderWidth: 2,
  //           barPercentage: 0.7,
  //           categoryPercentage: 0.4,
  //         },
  //       ],
  //     };

  //     // console.log(chartInfo);
  //     return chartInfo

  //   } catch (error) {
  //     console.log("error", error);
  //     throw error;
  //   }
  // }

  public async clearCacheData(timeFlag:any,body:any,service:any,action:any,clearDataName:string):Promise<any>{
    try {
      
      if (timeFlag) {
        console.log(clearDataName,);
        this.RedisCache.clearData(clearDataName)
        const result = await service[action](body?.timeFlag ? timeFlag : body);
        await this.RedisCache.setData(clearDataName, result)
        return result
      } else {
        const chData = await this.RedisCache.getData(clearDataName)
        if (chData?.length) {
          // console.log(clearDataName, chData);
          return chData
        }
        const result = await service[action](body)
        await this.RedisCache.setData(clearDataName, result)
        return result
      }
    } catch (error) {
      console.log("clearCacheData",error);
      
    }
  }


  public async getTotalSales(body: any): Promise<any> {
    try {
      const chData = await this.RedisCache.getData("totalSales")
      if (chData?.length) {
        console.log("totalSales", chData);
        return chData
      }
      const totalSales = await this.orderService.getTotalSales(body)
      await this.RedisCache.setData('totalSales', totalSales)

      return totalSales 
    } catch (error) {
      console.log("getTotalSales", error);

    }
  }
  public async getSalesTrend(body: any): Promise<any> {
    try {
      return await this.clearCacheData(body?.timeFlag,body,this.orderService,'salesTrend',"salesTrend");
    } catch (error) {
      console.log("getSalesTrend", error);

    }
  }
  public async getPopulareProducts(body: any): Promise<any> {
    try {
      let timeFlag = (body?.endDate && body?.startDate) ? 1 : 0;
      return await this.clearCacheData(timeFlag,body,this.orderService,'getMostPopularProducts',"mostPopularProducts");
     
    } catch (error) {
      console.log("getPopulareProducts", error);
    }
  }
  public async getSalesPerProductsCategory(body: any): Promise<any> {
    try {
      let timeFlag = (body?.endDate && body?.startDate) ? 1 : 0;
      return await this.clearCacheData(timeFlag,body,this.orderService,'salesPerProductsCategory',"salesPerProductsCategory");
    } catch (error) {
      console.log("getSalesPerProductsCategory", error);

    }
  }
  public async getAverageOrderFinalAmount(body: any): Promise<any> {
    try {
      let timeFlag = (body?.endDate && body?.startDate) ? 1 : 0;
      return await this.clearCacheData(timeFlag,body,this.orderService,'averageOrderFinalAmount',"averageOrderFinalAmount");
    } catch (error) {
      console.log("getAverageOrderFinalAmount", error);

    }
  }
  public async getRepeatAndNewOrders(body: any): Promise<any> {
    try {
      let timeFlag = (body?.endDate && body?.startDate) ? 1 : 0;
      return await this.clearCacheData(timeFlag,body,this.orderService,'repeatAndNewOrders',"repeatAndNewOrders");
    } catch (error) {
      console.log("getRepeatAndNewOrders", error);

    }
  }
  public async getOrderStatus(body: any): Promise<any> {
    try {
      let timeFlag = (body?.endDate && body?.startDate) ? 1 : 0;
      return await this.clearCacheData(timeFlag,body,this.orderService,'orderStatus',"orderStatus");
    } catch (error) {
      console.log("getOrderStatus", error);

    }
  }
  public async getProductsStocks(body: any): Promise<any> {
    try {
      let timeFlag = (body?.endDate && body?.startDate) ? 1 : 0;
      return await this.clearCacheData(timeFlag,body,this.productsService,'getProductsStocks',"productsStocks");
      // const productsStocks = await this.productsService.getProductsStocks();

      // return productsStocks
    } catch (error) {
      console.log("getProductsStocks", error);

    }
  }
  public async getLowStockProducts(body: any): Promise<any> {
    try {
      let timeFlag = (body?.endDate && body?.startDate) ? 1 : 0;
      return await this.clearCacheData(timeFlag,body,this.productsService,'lowStockProducts',"lowStockProducts");
      // const lowStockProducts = await this.productsService.lowStockProducts();

      // return lowStockProducts
    } catch (error) {
      console.log("getLowStockProducts", error);

    }
  }
  public async getProductPerformance(body: any): Promise<any> {
    try {
      let timeFlag = (body?.endDate && body?.startDate) ? 1 : 0;
      return await this.clearCacheData(timeFlag,body,this.orderService,'productPerformance',"productPerformance");
      // const productPerformance = await this.orderService.productPerformance(body);
      // return productPerformance
    } catch (error) {
      console.log("getProductPerformance", error);

    }
  }
  public async getRevenueByChannel(body: any): Promise<any> {
    try {
      let timeFlag = (body?.endDate && body?.startDate) ? 1 : 0;
      return await this.clearCacheData(timeFlag,body,this.orderService,'revenueByChannel',"revenueByChannel");
      // const revenueByChannel = await this.orderService.revenueByChannel();
      // return revenueByChannel
    } catch (error) {
      console.log("getRevenueByChannel", error);

    }
  }
}

export default Dashboard;
