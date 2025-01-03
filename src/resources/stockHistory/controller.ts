import { Router, Response, Request, NextFunction } from "express";
import Controller from "../../utils/interface/controller.interface";
import { queryMiddleware } from "@/middleware/queryMiddleware";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import tableService from "@/utils/gobalServices/table.service";
import HttpException from "@/utils/http.exception";
import { errorResponse } from "@/utils/helpers";

class StockHistoryController implements Controller {
  public path = "/stockHistory";
  public router = Router();
  private tableService = new tableService();

  constructor() {
    this.initializeRoutes();
  }

  /**
   * Initializes the routes for the product controller.
   * */
  private initializeRoutes(): void {
    this.router.post(
      `${this.path}/list`,
      authenticatedMiddleware,
      queryMiddleware,
      this.fetchStockHistory
    );
  }

  private fetchStockHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tableData = await this.tableService.chooseTable(
        req.body?.page,
        req
      );
      res.status(200).json({ payload: tableData });
    } catch (error: any) {
      errorResponse(res, error);
    }
  };
}

export default StockHistoryController;
