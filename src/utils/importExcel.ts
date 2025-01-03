import excelToJson from 'convert-excel-to-json'
import catchAsync from './catchAsync';
// import pLimit from 'p-limit'
import companyUserService from "@/resources/companyUser/services";
import iCompanyUser from "@/resources/companyUser/interface";
const companyUserServices = new companyUserService()

// const createUserByExcel = catchAsync(async (companyId: String, uData: iCompanyUser) => {
//     try {
//         uData.company_id = companyId;
//         await companyUserServices.register(uData)
//     } catch (error) {
//         console.log('err-----------------', error);
//         Promise.reject(error)
//     }
// })

const importMemberExcel = catchAsync(async (companyId: String, excelFile: any): Promise<any> => {
    try {
        let excelData = await excelToJson({
            sourceFile: excelFile.buffer,
            columnToKey: {
                '*': '{{columnHeader}}'
            }
        })
        let newArray = JSON.parse(JSON.stringify(excelData.companyUser));
        console.log("newArray", newArray);

        return;
        // const limit = pLimit(1);
        // return Promise.all(
        //     newArray.map((uData: any) => limit(() => createUserByExcel(companyId, uData)))
        // )
    } catch (error) {
        console.log('err--------2', error);
        throw new Error("Excel formating is wrong...")
    }
})

export default { importMemberExcel };
