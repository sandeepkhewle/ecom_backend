
import { Request } from "express";
import moment from 'moment'
import mongoose from "mongoose";
import sideBarData from '@/utils/JsonData/SideBar.json'

//Import Services
// import structureService from "@/resources/structure/services";
// import orderService from "@/resources/order/service"
// import salesUserService from "@/resources/salesUser/service"
// import companyService from "@/resources/company/service"
// import companyUserService from "@/resources/companyUser/services"
// import billService from "@/resources/Billing/services"

class SideBarService {
    // private structureService = new structureService();
    // private orderService = new orderService();
    // private salesUserService = new salesUserService();
    // private companyService = new companyService();
    // private companyUserService = new companyUserService();
    // private billService = new billService();

    // choose which table data need to fetched
    // public async chooseForm(form: string) {

    // switch (form) { 
    //     case 'vendor':
    //         return this.getformData(form);
    //     case 'admin':
    //         return this.getformData(form);
    //     case 'ceo':
    //         return this.getformData(form);

    //     default:
    //         break;
    // }
    // }
    getSideBarData = async (sideBar: string) => {
        try {
            const sideBarJson = JSON.parse(JSON.stringify(sideBarData));
            console.log(sideBarJson);
            return sideBarJson;
        } catch (error) {
            throw error
        }
    }


}


export default SideBarService;