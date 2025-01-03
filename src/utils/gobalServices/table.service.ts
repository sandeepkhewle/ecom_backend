import { Request } from "express";
import moment from "moment";
import mongoose from "mongoose";

//Import Services
import structureService from "@/resources/structure/services";
import orderService from "@/resources/order/service";
import salesUserService from "@/resources/salesUser/service";
import companyService from "@/resources/company/service";
import companyUserService from "@/resources/companyUser/services";
import billService from "@/resources/Billing/services";
import categoryService from "@/resources/category/services";
import productService from "@/resources/product/services";
import tamplateService from "@/resources/Templates/services";
import paymentService from "@/resources/paymentSysteam/service";
import consumerService from "@/resources/consumer/services";
import stockHistoryService from "@/resources/stockHistory/services";

class tableService {
  private structureService = new structureService();
  private orderService = new orderService();
  private salesUserService = new salesUserService();
  private companyService = new companyService();
  private companyUserService = new companyUserService();
  private billService = new billService();
  private categoryService = new categoryService();
  private productService = new productService();
  private tamplateService = new tamplateService();
  private paymentService = new paymentService();
  private consumerService = new consumerService();
  private stockHistoryService = new stockHistoryService();

  // choose which table data need to fetched
  public async chooseTable(page: string, req: Request) {
    switch (page) {
      case "companyUser":
        return this.getCompanyUserList(req);
      case "orders":
        return this.getOrderList(req);
      case "consumerOrder":
        return this.getConsumerOrderList(req);
      case "orderApproval":
        return this.getPendingForApprovalList(req);
      case "ordersForSalesUser":
        return this.getOrderListForSalesUser(req);
      case "particularUserOrder":
        return this.particularUserOrder(req);
      case "salesUser":
        return this.getSalesUserList(req);
      case "companylist":
        return this.getCompanyList(req);
      case "billslist":
        return this.getBillsList(req);
      case "vendor":
        return this.getVendorList(req);
      case "category":
        return this.getCategoryList(req);
      case "products":
        return this.getProductsList(req);
      case "paymentHistory":
        return this.getPaymentHistorys(req);
      case "stockHistory":
        return this.getStockHistory(req);
      case "consumer":
        return this.getConsumerList(req);
      default:
        break;
    }
  }

  private async getConsumerList(req: Request) {
    try {
      const consumerList = await this.consumerService.fetchAllUsers();
      return consumerList;
    } catch (error) {
      throw error;
    }
  }

  //orders list function
  private async getOrderList(req: Request) {
    try {
      console.log("getOrderList-----------", req.body);
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createdAt";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters;
      const company = req.body.company
        ? req.body?.company
        : req.user?.company_id;
      let matchObj: any = { company: company, approvalStatus: { $ne: "deny" } };
      if (search) {
        matchObj["$or"] = [
          { $text: { $search: search } },
          { invoiceNo: { $regex: search, $options: "i" } },
          { orderNo: { $regex: search, $options: "i" } },
        ];
      }

      // filter on plan end date
      if (filters && (filters.createdAtStartDate || filters.createdAtEndDate)) {
        matchObj["createdAt"] = {};
        if (filters.createdAtStartDate)
          matchObj["createdAt"]["$gte"] = new Date(filters.createdAtStartDate);
        if (filters.createdAtEndDate)
          matchObj["createdAt"]["$lte"] = moment(filters.createdAtEndDate).add(
            1,
            "day"
          );
      }

      Object.keys(filters).forEach((element) => {
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          filters[element].length > 0
        ) {
          matchObj[element] = { $in: filters[element] };
        }
      });

      query.push({ $match: matchObj });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      console.log("matchObj", matchObj);

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });
      await this.orderService
        .tableQuery(query, countQuery)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });
      return sendObj;
    } catch (error) {
      throw error;
    }
  }

  // get order list of consumer
  private async getConsumerOrderList(req: Request) {
    try {
      console.log("getConsumerOrderList-----------", req.user);
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createdAt";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters;
      // const company = req.body.company ? req.body?.company : req.user?.company;
      let matchObj: any = {};

      // if (req.user?.role === 'vendor') {
      //     matchObj = { 'assignVendor.vendorId': req.user.id }
      // }
      let user;

      user = req.user?.id;

      if (!user) {
        throw new Error("please provide user Id");
      } else {
        matchObj = {
          orderedBy: new mongoose.Types.ObjectId(req.user.id),
        };
      }

      if (search) {
        matchObj["$or"] = [
          { $text: { $search: search } },
          { invoiceNo: { $regex: search, $options: "i" } },
          { orderNo: { $regex: search, $options: "i" } },
        ];
      }

      // filter on plan end date
      if (filters && (filters.createdAtStartDate || filters.createdAtEndDate)) {
        let newEndDate: any = moment(filters.createdAtEndDate).add(1, "day");
        matchObj["createdAt"] = {};
        if (filters.createdAtStartDate)
          matchObj["createdAt"]["$gte"] = new Date(filters.createdAtStartDate);
        if (filters.createdAtEndDate)
          matchObj["createdAt"]["$lte"] = new Date(newEndDate);
      }

      Object.keys(filters).forEach((element) => {
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          mongoose.Types.ObjectId.isValid(filters[element][0])
        ) {
          let newElemArray: any[] = [];
          filters[element].forEach((innerIlement: any) => {
            newElemArray.push(new mongoose.Types.ObjectId(innerIlement));
          });
          matchObj[element] = { $in: newElemArray };
        }
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          (!mongoose.Types.ObjectId.isValid(filters[element][0]) ||
            filters[element][0] === "Trainer Plan")
        ) {
          matchObj[element] = { $in: filters[element] };
        }
      });

      query.push({ $match: matchObj });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      console.log("matchObj", matchObj);

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });
      await this.orderService
        .tableQuery(query, countQuery)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });
      return sendObj;
    } catch (error) {
      throw error;
    }
  }
  // get order list for sales panel
  private async getOrderListForSalesUser(req: Request) {
    try {
      console.log("getOrderListForSalesUser-----------", req.user);
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createdAt";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters;
      // const company = req.body.company ? req.body?.company : req.user?.company;
      let matchObj: any = {};

      // if (req.user?.role === 'vendor') {
      //     matchObj = { 'assignVendor.vendorId': req.user.id }
      // }
      if (search) {
        matchObj["$or"] = [
          { $text: { $search: search } },
          { invoiceNo: { $regex: search, $options: "i" } },
          { orderNo: { $regex: search, $options: "i" } },
        ];
      }

      // filter on plan end date
      if (filters && (filters.createdAtStartDate || filters.createdAtEndDate)) {
        let newEndDate: any = moment(filters.createdAtEndDate).add(1, "day");
        matchObj["createdAt"] = {};
        if (filters.createdAtStartDate)
          matchObj["createdAt"]["$gte"] = new Date(filters.createdAtStartDate);
        if (filters.createdAtEndDate)
          matchObj["createdAt"]["$lte"] = new Date(newEndDate);
      }

      Object.keys(filters).forEach((element) => {
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          mongoose.Types.ObjectId.isValid(filters[element][0])
        ) {
          let newElemArray: any[] = [];
          filters[element].forEach((innerIlement: any) => {
            newElemArray.push(new mongoose.Types.ObjectId(innerIlement));
          });
          matchObj[element] = { $in: newElemArray };
        }
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          (!mongoose.Types.ObjectId.isValid(filters[element][0]) ||
            filters[element][0] === "Trainer Plan")
        ) {
          matchObj[element] = { $in: filters[element] };
        }
      });

      query.push({ $match: matchObj });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      console.log("matchObj", matchObj);

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });
      await this.orderService
        .tableQuery(query, countQuery)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });
      return sendObj;
    } catch (error) {
      throw error;
    }
  }
  // get order list for particular User
  private async particularUserOrder(req: Request) {
    try {
      console.log("particularUserOrder-----------", req.user);
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createdAt";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters;
      // const company = req.body.company ? req.body?.company : req.user?.company;
      let matchObj: any = {};

      // if (req.user?.role === 'vendor') {
      //     matchObj = { 'assignVendor.vendorId': req.user.id }
      // }
      let user;
      if (req.body.user) {
        user = req?.body?.user;
      } else {
        user = req.user?.id;
      }
      if (!user) {
        throw new Error("please provide user Id");
      } else {
        matchObj = {
          orderedBy: new mongoose.Types.ObjectId(req.user.id),
        };
      }

      if (search) {
        matchObj["$or"] = [
          { $text: { $search: search } },
          { invoiceNo: { $regex: search, $options: "i" } },
          { orderNo: { $regex: search, $options: "i" } },
        ];
      }

      // filter on plan end date
      if (filters && (filters.createdAtStartDate || filters.createdAtEndDate)) {
        let newEndDate: any = moment(filters.createdAtEndDate).add(1, "day");
        matchObj["createdAt"] = {};
        if (filters.createdAtStartDate)
          matchObj["createdAt"]["$gte"] = new Date(filters.createdAtStartDate);
        if (filters.createdAtEndDate)
          matchObj["createdAt"]["$lte"] = new Date(newEndDate);
      }

      Object.keys(filters).forEach((element) => {
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          mongoose.Types.ObjectId.isValid(filters[element][0])
        ) {
          let newElemArray: any[] = [];
          filters[element].forEach((innerIlement: any) => {
            newElemArray.push(new mongoose.Types.ObjectId(innerIlement));
          });
          matchObj[element] = { $in: newElemArray };
        }
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          (!mongoose.Types.ObjectId.isValid(filters[element][0]) ||
            filters[element][0] === "Trainer Plan")
        ) {
          matchObj[element] = { $in: filters[element] };
        }
      });

      query.push({ $match: matchObj });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      console.log("matchObj", matchObj);

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });
      await this.orderService
        .tableQuery(query, countQuery)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });
      return sendObj;
    } catch (error) {
      throw error;
    }
  }
  // get Category List
  private async getCategoryList(req: Request) {
    try {
      console.log("getCategoryList-----------", req.body);
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createdAt";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters;
      // const company = req.body.company ? req.body?.company : req.user?.company;
      let matchObj: any = {};
      if (search) {
        matchObj["$or"] = [
          { $text: { $search: search } },
          { invoiceNo: { $regex: search, $options: "i" } },
          { orderNo: { $regex: search, $options: "i" } },
        ];
      }

      // filter on plan end date
      if (filters && (filters.createdAtStartDate || filters.createdAtEndDate)) {
        matchObj["createdAt"] = {};
        if (filters.createdAtStartDate)
          matchObj["createdAt"]["$gte"] = new Date(filters.createdAtStartDate);
        if (filters.createdAtEndDate)
          matchObj["createdAt"]["$lte"] = moment(filters.createdAtEndDate).add(
            1,
            "day"
          );
      }

      Object.keys(filters).forEach((element) => {
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          mongoose.Types.ObjectId.isValid(filters[element][0])
        ) {
          let newElemArray: any[] = [];
          filters[element].forEach((innerIlement: any) => {
            newElemArray.push(new mongoose.Types.ObjectId(innerIlement));
          });
          matchObj[element] = { $in: newElemArray };
        }
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          (!mongoose.Types.ObjectId.isValid(filters[element][0]) ||
            filters[element][0] === "Trainer Plan")
        ) {
          matchObj[element] = { $in: filters[element] };
        }
      });

      query.push({ $match: matchObj });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      console.log("matchObj", matchObj);

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });
      await this.categoryService
        .tableQuery(query, countQuery)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });
      return sendObj;
    } catch (error) {
      throw error;
    }
  }

  private async getSalesUserList(req: Request) {
    try {
      // console.log('getSalesUserList-----------', req.body);
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createdAt";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters;
      // const company = req.body.company ? req.body?.company : req.user?.company;
      let matchObj: any = { role: { $ne: "vendor" } };
      if (search) {
        matchObj["$or"] = [
          { $text: { $search: search } },
          { dob: { $regex: search, $options: "i" } },
          { fullname: { $regex: search, $options: "i" } },
        ];
      }
      // filter on plan end date
      if (filters && (filters.createdAtStartDate || filters.createdAtEndDate)) {
        let newEndDate: any = moment(filters.createdAtEndDate).add(1, "day");
        matchObj["createdAt"] = {};
        if (filters.createdAtStartDate)
          matchObj["createdAt"]["$gte"] = new Date(filters.createdAtStartDate);
        if (filters.createdAtEndDate)
          matchObj["createdAt"]["$lte"] = new Date(newEndDate);
      }

      Object.keys(filters).forEach((element) => {
        console.log("filters", filters);
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0
        ) {
          matchObj[element] = { $in: filters[element] };
        }
      });
      // console.log(matchObj);

      query.push({ $match: matchObj });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      console.log("matchObj", matchObj);

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });
      await this.salesUserService
        .tableQuery(query, countQuery)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });
      return sendObj;
    } catch (error) {
      throw error;
    }
  }
  private async getVendorList(req: Request) {
    try {
      // console.log('getSalesUserList-----------', req.body);
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createdAt";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters;
      // const company = req.body.company ? req.body?.company : req.user?.company;
      let matchObj: any = { role: "vendor" };
      if (search) {
        matchObj["$or"] = [
          { $text: { $search: search } },
          { dob: { $regex: search, $options: "i" } },
          { fullname: { $regex: search, $options: "i" } },
        ];
      }

      // filter on plan end date
      if (filters && (filters.createdAtStartDate || filters.createdAtEndDate)) {
        matchObj["createdAt"] = {};
        if (filters.createdAtStartDate)
          matchObj["createdAt"]["$gte"] = new Date(filters.createdAtStartDate);
        if (filters.createdAtEndDate)
          matchObj["createdAt"]["$lte"] = moment(filters.createdAtEndDate).add(
            1,
            "day"
          );
      }

      Object.keys(filters).forEach((element) => {
        console.log("filters", filters);
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0
        ) {
          matchObj[element] = { $in: filters[element] };
        }
      });

      query.push({ $match: matchObj });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      console.log("matchObj", matchObj);

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });
      await this.salesUserService
        .tableQuery(query, countQuery)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });
      return sendObj;
    } catch (error) {
      throw error;
    }
  }

  private async getCompanyList(req: Request) {
    try {
      // console.log('getSalesUserList-----------', req.body);
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createdAt";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters;
      // const company = req.body.company ? req.body?.company : req.user?.company;
      let matchObj: any = {};
      if (search) {
        matchObj["$or"] = [
          { $text: { $search: search } },
          { dob: { $regex: search, $options: "i" } },
          { fullname: { $regex: search, $options: "i" } },
        ];
      }

      // filter on plan end date
      if (filters && (filters.createdAtStartDate || filters.createdAtEndDate)) {
        matchObj["createdAt"] = {};
        if (filters.createdAtStartDate)
          matchObj["createdAt"]["$gte"] = new Date(filters.createdAtStartDate);
        if (filters.createdAtEndDate)
          matchObj["createdAt"]["$lte"] = moment(filters.createdAtEndDate).add(
            1,
            "day"
          );
      }

      Object.keys(filters).forEach((element) => {
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          mongoose.Types.ObjectId.isValid(filters[element][0])
        ) {
          let newElemArray: any[] = [];
          filters[element].forEach((innerIlement: any) => {
            newElemArray.push(new mongoose.Types.ObjectId(innerIlement));
          });
          matchObj[element] = { $in: newElemArray };
        }
      });

      query.push({ $match: matchObj });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      console.log("matchObj", matchObj);

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });
      await this.companyService
        .tableQuery(query, countQuery)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });
      return sendObj;
    } catch (error) {
      throw error;
    }
  }

  //orders list function
  private async getPendingForApprovalList(req: Request) {
    try {
      console.log("getOrderList-----------", req.body);
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createdAt";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters;
      const company = req.body.company ? req.body?.company : req.user?.company;
      let matchObj: any = { company: company };
      if (search) {
        matchObj["$or"] = [
          { $text: { $search: search } },
          { invoiceNo: { $regex: search, $options: "i" } },
          { orderNo: { $regex: search, $options: "i" } },
        ];
      }

      // filter on plan end date
      if (filters && (filters.createdAtStartDate || filters.createdAtEndDate)) {
        matchObj["createdAt"] = {};
        if (filters.createdAtStartDate)
          matchObj["createdAt"]["$gte"] = new Date(filters.createdAtStartDate);
        if (filters.createdAtEndDate)
          matchObj["createdAt"]["$lte"] = moment(filters.createdAtEndDate).add(
            1,
            "day"
          );
      }

      Object.keys(filters).forEach((element) => {
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          mongoose.Types.ObjectId.isValid(filters[element][0])
        ) {
          let newElemArray: any[] = [];
          filters[element].forEach((innerIlement: any) => {
            newElemArray.push(new mongoose.Types.ObjectId(innerIlement));
          });
          matchObj[element] = { $in: newElemArray };
        }
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          (!mongoose.Types.ObjectId.isValid(filters[element][0]) ||
            filters[element][0] === "Trainer Plan")
        ) {
          matchObj[element] = { $in: filters[element] };
        }
      });

      query.push({ $match: matchObj });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      console.log("matchObj", matchObj);

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });
      await this.orderService
        .tableQuery(query, countQuery)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });
      return sendObj;
    } catch (error) {
      throw error;
    }
  }

  private async getCompanyUserList(req: Request) {
    try {
      console.log("getSalesUserList-----------", req.body);
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createdAt";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters;
      const companyId = req.body.company
        ? req.body?.company
        : req.user?.company_id;
      let matchObj: any = { company_id: companyId };
      if (search) {
        matchObj["$or"] = [
          { $text: { $search: search } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { emailId: { $regex: search, $options: "i" } },
          { phoneNo: { $regex: search, $options: "i" } },
        ];
      }

      // filter on plan end date
      if (filters && (filters.createdAtStartDate || filters.createdAtEndDate)) {
        let newEndDate: any = moment(filters.createdAtEndDate).add(1, "day");
        matchObj["createdAt"] = {};
        if (filters.createdAtStartDate)
          matchObj["createdAt"]["$gte"] = new Date(filters.createdAtStartDate);
        if (filters.createdAtEndDate)
          matchObj["createdAt"]["$lte"] = new Date(newEndDate);
      }

      Object.keys(filters).forEach((element) => {
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0
        ) {
          // let newElemArray: any[] = [];
          // filters[element].forEach((innerIlement: any) => {
          //     newElemArray.push(new mongoose.Types.ObjectId(innerIlement))
          // });
          matchObj[element] = { $in: filters[element] };
        }
      });

      query.push({ $match: matchObj });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      // console.log("matchObj", matchObj);

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });
      await this.companyUserService
        .tableQuery(query, countQuery)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });
      return sendObj;
    } catch (error) {
      throw error;
    }
  }
  private async getBillsList(req: Request) {
    try {
      console.log("getBillsList-----------", req.body);
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
        monthBill: "",
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createDate";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters ? req.body.filters : {};
      const companyId = req.user?.company_id
        ? req.user?.company_id
        : req.body?.company_id;
      let matchObj: any = {};
      if (companyId) matchObj = { company_id: companyId };

      if (search) {
        matchObj["$or"] = [
          { $text: { $search: search } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { emailId: { $regex: search, $options: "i" } },
          { phoneNo: { $regex: search, $options: "i" } },
        ];
      }

      // filter on plan end date
      if (filters && (filters.createdAtStartDate || filters.createdAtEndDate)) {
        matchObj["createDate"] = {};
        let endDate: any = moment(filters.createdAtEndDate).add(1, "day");
        if (filters.createdAtStartDate)
          matchObj["createDate"]["$gte"] = new Date(filters.createdAtStartDate);
        if (filters.createdAtEndDate)
          matchObj["createDate"]["$lte"] = new Date(endDate);
      }

      Object.keys(filters).forEach((element) => {
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0
        ) {
          let newElemArray: any[] = [];
          filters[element].forEach((innerIlement: any) => {
            newElemArray.push(new mongoose.Types.ObjectId(innerIlement));
          });
          matchObj[element] = { $in: newElemArray };
        }
        const startDate = new Date(
          new Date().setFullYear(filters.year, filters.month, 1)
        );
        const endDate = new Date(
          moment(startDate).endOf("month").toISOString()
        );
        matchObj["createDate"] = { $gte: startDate, $lte: endDate };
      });

      Object.keys(filters).forEach((element) => {
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          filters[element].length > 0
        ) {
          matchObj[element] = { $in: filters[element] };
        }
      });

      query.push({ $match: matchObj });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      console.log("matchObj", JSON.stringify(query));
      // console.log("matchObj-------------", matchObj);

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });
      await this.billService
        .tableQuery(query, countQuery, filters.month, filters.year)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          sendObj.monthBill = data.monthBill;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });

      return sendObj;
    } catch (error) {
      throw error;
    }
  }

  // get products List
  private async getProductsList(req: Request) {
    try {
      console.log("getProductsList-----------", req.body);
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createdAt";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters;
      let category = req.body.category ? req.body.category : "";
      const company_id = req.body.company_id
        ? req.body?.company_id
        : req.user?.company_id;
      // console.log("company_id",req.user);

      let matchObj: any = category
        ? { category: new mongoose.Types.ObjectId(category) }
        : {};
      if (!req.body.isSalesPanel) matchObj = { ...matchObj, active: true };
      if (search) {
        //matchObj["$text"] = { $search: search, $caseSensitive: false }; // full-text search
        matchObj["$and"] = [
          { productName: { $regex: new RegExp(search, "i") } }, // substring search // 'i' makes it case-insensitive
        ];
      }

      // filter on plan end date
      if (filters && (filters.createdAtStartDate || filters.createdAtEndDate)) {
        matchObj["createdAt"] = {};
        if (filters.createdAtStartDate)
          matchObj["createdAt"]["$gte"] = new Date(filters.createdAtStartDate);
        if (filters.createdAtEndDate)
          matchObj["createdAt"]["$lte"] = moment(filters.createdAtEndDate).add(
            1,
            "day"
          );
      }

      Object.keys(filters).forEach((element) => {
        if (filters[element]) {
          if (this.isValidArray(filters[element])) {
            if (mongoose.Types.ObjectId.isValid(filters[element][0])) {
              let newElemArray: any[] = [];
              filters[element].forEach((innerIlement: any) => {
                newElemArray.push(new mongoose.Types.ObjectId(innerIlement));
              });
              matchObj[element] = { $in: newElemArray };
            } else if (filters[element][0] === "Trainer Plan") {
              matchObj[element] = { $in: filters[element] };
            }
          } else if (this.isValidObject(filters[element])) {
            if (this.isValidRange(filters[element])) {
              matchObj[element] = {};
              matchObj[element].$gte = isNaN(filters[element].min)
                ? filters[element].min
                : parseFloat(filters[element].min);
              matchObj[element].$lte = isNaN(filters[element].max)
                ? filters[element].max
                : parseFloat(filters[element].max);
            }
          } else if (mongoose.Types.ObjectId.isValid(filters[element])) {
            matchObj[element] = new mongoose.Types.ObjectId(filters[element]);
          } else {
            matchObj[element] = filters[element];
          }
        }
      });

      query.push({ $match: matchObj });
      query.push({
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      });
      query.push({
        $unwind: "$category", // Deconstructs the category array, outputting one document for each category
      });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      console.log("matchObj", JSON.stringify(query));

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });
      await this.productService
        .tableQuery(query, countQuery)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });
      return sendObj;
    } catch (error) {
      throw error;
    }
  }

  private isValidObject(value: any) {
    return (
      value !== null &&
      typeof value === "object" &&
      Object.getPrototypeOf(value) === Object.prototype
    );
  }

  private isValidArray(value: any) {
    return Array.isArray(value) && value.length > 0;
  }

  private isValidRange(value: any) {
    return value.hasOwnProperty("min") && value.hasOwnProperty("max");
  }

  private async getPaymentHistorys(req: Request) {
    try {
      console.log("getCompanyMapTemplates-----------", req.body);
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createdAt";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters;
      let category = req.body.catogeryId ? req.body.catogeryId : "";
      const company_id = req.body.company_id
        ? req.body?.company_id
        : req.user?.company_id;
      let matchObj: any = category ? {} : {};
      if (company_id) matchObj = { ...matchObj, company_id: company_id };
      if (search) {
        matchObj["$or"] = [
          { $text: { $search: search } },
          { invoiceNo: { $regex: search, $options: "i" } },
          { orderNo: { $regex: search, $options: "i" } },
        ];
      }

      // filter on plan end date
      if (filters && (filters.createdAtStartDate || filters.createdAtEndDate)) {
        matchObj["createdAt"] = {};
        if (filters.createdAtStartDate)
          matchObj["createdAt"]["$gte"] = new Date(filters.createdAtStartDate);
        if (filters.createdAtEndDate)
          matchObj["createdAt"]["$lte"] = moment(filters.createdAtEndDate).add(
            1,
            "day"
          );
      }

      Object.keys(filters).forEach((element) => {
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          mongoose.Types.ObjectId.isValid(filters[element][0])
        ) {
          let newElemArray: any[] = [];
          filters[element].forEach((innerIlement: any) => {
            newElemArray.push(new mongoose.Types.ObjectId(innerIlement));
          });
          matchObj[element] = { $in: newElemArray };
        }
        if (
          filters[element] &&
          Array.isArray(filters[element]) &&
          filters[element].length > 0 &&
          (!mongoose.Types.ObjectId.isValid(filters[element][0]) ||
            filters[element][0] === "Trainer Plan")
        ) {
          matchObj[element] = { $in: filters[element] };
        }
      });

      query.push({ $match: matchObj });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      console.log("matchObj", matchObj);

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });
      await this.paymentService
        .showCreditStatementQuery(query, countQuery)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });
      return sendObj;
    } catch (error) {
      throw error;
    }
  }

  private async getStockHistory(req: Request) {
    try {
      let sendObj = {
        data: {},
        count: 0,
        attributeList: [],
      };
      let query = [];
      let countQuery = [];
      let page = req.body.page;
      let limit = req.body.limit ? req.body.limit : 10;
      let skip = req.body.skip ? req.body.skip : 0;
      let orderby = req.body.orderby ? req.body.orderby : "createdAt";
      let orderin = 1;
      if (req.body.orderin === "desc") orderin = -1;
      let sort: any = {};
      sort[orderby] = orderin;
      let search = req.body.search;
      let filters = req.body.filters || {};

      let matchObj: any = {};

      Object.keys(filters).forEach((element) => {
        if (filters[element]) {
          if (this.isValidArray(filters[element])) {
            if (mongoose.Types.ObjectId.isValid(filters[element][0])) {
              let newElemArray: any[] = [];
              filters[element].forEach((innerIlement: any) => {
                newElemArray.push(new mongoose.Types.ObjectId(innerIlement));
              });
              matchObj[element] = { $in: newElemArray };
            } else {
              matchObj[element] = { $in: filters[element] };
            }
          } else if (this.isValidObject(filters[element])) {
            if (this.isValidRange(filters[element])) {
              matchObj[element] = {};
              matchObj[element].$gte = isNaN(filters[element].min)
                ? filters[element].min
                : parseFloat(filters[element].min);
              matchObj[element].$lte = isNaN(filters[element].max)
                ? filters[element].max
                : parseFloat(filters[element].max);
            }
          } else if (mongoose.Types.ObjectId.isValid(filters[element])) {
            matchObj[element] = new mongoose.Types.ObjectId(filters[element]);
          } else {
            matchObj[element] = filters[element];
          }
        }
      });

      query.push({ $match: matchObj });
      query.push({ $sort: sort });
      query.push({ $skip: skip });
      query.push({ $limit: limit });
      query.push({
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      });
      query.push({
        $unwind: "$productId", // Deconstructs the category array, outputting one document for each category
      });
      query.push({
        $lookup: {
          from: "Users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      });

      query.push({
        $unwind: "$userId", // Deconstructs the category array, outputting one document for each category
      });
      console.log("matchObj", matchObj);

      countQuery.push({ $match: matchObj });
      countQuery.push({ $count: "count" });

      await this.stockHistoryService
        .getStockHistoryQuery(query, countQuery)
        .then((data: any) => {
          sendObj.data = data.queryData;
          sendObj.count = data.count;
          this.structureService.getViewData(page, "").then((aData) => {
            sendObj.attributeList = aData;
          });
        });
      return sendObj;
    } catch (error) {
      throw error;
    }
  }
}

export default tableService;
