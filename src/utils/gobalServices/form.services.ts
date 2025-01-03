
import { Request } from "express";
import moment from 'moment'
import mongoose from "mongoose";
import formData from '@/utils/JsonData/FormData.json'

//Import Services
// import structureService from "@/resources/structure/services";
// import orderService from "@/resources/order/service"
// import salesUserService from "@/resources/salesUser/service"
// import companyService from "@/resources/company/service"
// import companyUserService from "@/resources/companyUser/services"
// import billService from "@/resources/Billing/services"

class FormService {
    // private structureService = new structureService();
    // private orderService = new orderService();
    // private salesUserService = new salesUserService();
    // private companyService = new companyService();
    // private companyUserService = new companyUserService();
    // private billService = new billService();

    // choose which table data need to fetched
    public async chooseForm(form: string) {

        // use switch in future in case multiple methods used to extract the data
        // switch (form) {
        //     case 'vendor':
        //         return this.getformData(form);
        //     case 'vendorLink':
        //         return this.getformData(form);
        //     case 'categoryEdit':
        //         return this.getformData(form);

        //     default:
        //         break;
        // }

        return this.getformData(form);
    }

    getformData = async (form: string) => {
        try {
            const fromsJson = JSON.parse(JSON.stringify(formData))
            return fromsJson[form];
        } catch (error) {
            throw error
        }
    }


}


export default FormService;