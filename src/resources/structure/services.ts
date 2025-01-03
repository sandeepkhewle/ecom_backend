import viewData from '@/utils/JsonData/viewData.json'
import filter from '@/utils/JsonData/filter.json'
import moment from 'moment';
import tableService from '@/utils/gobalServices/table.service';
import companyService from '@/resources/company/service';

class structureService {
    private viewDateJson = viewData;
    private companyService = new companyService();
    private filters = filter;
    private TAG = 'structure Service'

    public async getViewData(page: string, role: string) {
        try {
            const vDataJson = JSON.parse(JSON.stringify(this.viewDateJson));
            return vDataJson[page].attributes;
        } catch (error) {
            throw error;
        }
    }

    public async getFilters(page: string, role: string) {
        try {
           
            const filterData = JSON.parse(JSON.stringify(this.filters));
            let pageFilter = filterData[page] ? filterData[page] : null;
            if(page === "billslist"){
                let companyObjList = await this.companyService.findAllCompany();
                let companyList : any = [];
                if (companyObjList instanceof Array) {
                    companyObjList.map((val:any) => companyList.push({name : val?.name , value : val?._id}));
                }
                
                pageFilter = pageFilter?.map((val:any) => {
                    if(val?.name === "Client names"){
                       return  {...val , options : companyList}
                        
                    }else{
                        return val;
                    }
                } )
            }
            
            console.log("pageFilter",page,pageFilter);
            return pageFilter;
        } catch (error) {
            throw error;
        }
    }


  
}

export default structureService;