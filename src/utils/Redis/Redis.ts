import redis from 'ioredis';

class RedisCache{
    private redis= new redis();

    private exTime = 900;
    
    public async getData(key:string):Promise<any>{
        try {
            let data =  await this.redis.get(key);
            
            if(data &&  Array.isArray(JSON.parse(data))){
                return JSON.parse(data)
            }
        } catch (error) {
            console.log("redisService error",error);
            
        }
    }
    public async setData(key:string,newData:any,isFilter?:string):Promise<any>{
        try {
            if(key){
                    await this.redis.set(key,JSON.stringify(newData),'EX',this.exTime)
            }
        } catch (error) {
            console.log("redisService error",error);
            
        }
    }

    public async clearData(key:string):Promise<any>{
        try {
            if(key){
                    return await this.redis.del(key);
            }
        } catch (error) {
            console.log("redisService error",error);
            
        }
    }

    public async clearAllData():Promise<any>{
        try {
          await this.redis.flushdb();
        } catch (error) {
            console.log("redisService error",error);
            
        }
    }
}

export default RedisCache