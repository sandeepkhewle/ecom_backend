import { Router, Response, Request } from "express";
import { NextFunction } from "express-serve-static-core";
import iController from "@/utils/interface/controller.interface"
import structureService from "./services";
import tableService from "@/utils/gobalServices/table.service";
import FormService from "@/utils/gobalServices/form.services";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import aclMiddleware from "@/middleware/aclMiddleware";
import SideBarService from "@/utils/gobalServices/sideBar";
import reportsService from "@/utils/gobalServices/reportService";
import path from 'path'

import fs from 'fs'

class structureController implements iController {
    public path = '/structure';
    public router = Router();
    private structureService = new structureService();
    private ReportsService = new reportsService();
    private tableService = new tableService();
    private formService = new FormService();
    private SideBarService = new SideBarService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.post(
          `${this.path}/list`,
          authenticatedMiddleware,
          this.getTableData
        );
        // non secure forms
        this.router.post(
            `${this.path}/form`, this.getFormData
        );
        this.router.post(
            `${this.path}/sidebar`, this.getSideBarData
        );
        this.router.post(
          `${this.path}/filters`,
          authenticatedMiddleware,
          this.getfilters
        );
        this.router.post(
            `${this.path}/reports`, this.reports
        );
    }

    private getTableData = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            // throw new Error('jack')
            const tableData = await this.tableService.chooseTable(req.body?.page, req);
            res.status(201).json({
                payload: tableData
            })
        } catch (error: Error | any) {
            console.log(error);

            res.json({
                status: 400,
                error: error.message
            })
        }
    }

    private getFormData = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        const formData = await this.formService.chooseForm(req.body?.form);
        res.status(201).json({
            payload: formData
        })
    }

    private getSideBarData = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        const formData = await this.SideBarService.getSideBarData(req.body?.form);
        res.status(201).json({
            payload: formData
        })
    }

    private getfilters = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        const filterData = await this.structureService.getFilters(req.body?.page, req.user?.role);
        res.status(201).json({
            payload: filterData
        })
    }

    private reports = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
       try {
        await this.ReportsService.getReports(req.body?.page, req, res);

        var file = fs.readFileSync('./public/excel/file.xlsx', 'base64');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=file.xlsx`);
        res.writeHead(201)
        res.end(file);
        fs.unlinkSync('./public/excel/file.xlsx')


       } catch (error:any) {
        res.status(error.status).send(error.message)
       }
        
        // res.status(201).json({
        //     payload: file
        // })
    }



}
export default structureController;