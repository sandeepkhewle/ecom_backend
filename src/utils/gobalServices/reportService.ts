import { Request } from "express";
import moment from 'moment'
import fs from 'fs';
import writeXlsxFile from 'write-excel-file/node'

//Import Services
import tableService from "./table.service";
import awsService from '@/utils/gobalServices/aws.service'
import HttpException from "../http.exception";

class reportsService {
    private tableService = new tableService();
    private awsService = new awsService();



    public async getReports(page: string, req: any, res: any) {
        try {
            let schema: any = [];
            const tData: any = await this.tableService.chooseTable(page, req);
            console.log("6+++++++++++++++",tData?.data?.length);


            let newData: any = []


            if (tData?.data?.length) {
                tData?.data.forEach((item: any) => {
                    let Obj: any = {}
                    Object.keys(item).forEach((it: any) => {
                        if (it == 'createdAt' || it == 'updatedAt') {
                            Obj[it] = moment(new Date(item[it])).format('DD/MM/YYYY');
                        } else {
                            if (it != 'otpTime' && it != '__v' && it != '_id' && it != 'password' && it != 'access' && it != 'sessionVerified' && it != 'otpVerified' && it != 'itemList')
                                Obj[it] = item[it].toString()
                        }
                    })
                    newData.push(Obj)
                });
            }else{
                throw new HttpException(500,'did not find data between this date');
            }


            const checkTypeFun = (typDate: any) => {
                if (typeof (typDate) === "string") {
                    return String
                } else if (typeof (typDate) === "boolean") {
                    return Boolean
                } else if (typeof (typDate) === "number") {
                    return Number
                }

            }

            if(newData.length){
                Object.keys(newData[newData.length - 1]).forEach((item: any) => {
                let Obj: any = {}
                if (item !== '_id' && item !== 'access' && item !== 'password' && item !== '__v' && item !== 'itemList') {
                    Obj['column'] = item
                    Obj['type'] = checkTypeFun(newData[0][item])
                    Obj['value'] = (user: string) => user[item]
                    Obj['width'] = 15
                    schema.push(Obj)
                }
            });
            
            const file: any = await writeXlsxFile(newData, {
                schema,
                filePath: './public/excel/file.xlsx'
            });
        }

        } catch (error) {
            throw error;
        }
    }



}

export default reportsService;