import { Request } from "express";
import stateList from '@/utils/JsonData/states-and-districts.json'

class statesListService {
    private states = stateList



    public async getStatesList(state: string|any) {
        try {
     
                let sList :any = []
                this.states.states.map(item =>{
                    if(item.state.toLowerCase().includes(state.toLowerCase())){
                            sList.push(item.state)
                    }else if(state === ''){
                        sList.push(item.state)
                    }
                });
                
                return sList
        } catch (error) {
            throw error;
        }
    }

    public async getDistrictsList(district: string|any) {
        try {
     console.log(district);
     
                let dList :any = []
                this.states.states.map(item =>{
                    item.districts.forEach(city =>{
                        if(city.toLowerCase().includes(district.toLowerCase())){
                            dList.push(city)
                        }else if(district === ''){
                            dList.push(city)
                        }
                    })
                })
                return dList
        } catch (error) {
            throw error;
        }
    }



}

export default statesListService;