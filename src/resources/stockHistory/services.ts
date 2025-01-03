import stockHistoryModel from "./model";
class StockHistoryService {
  private stockHistory = stockHistoryModel;
  public async getStockHistoryQuery(
    query: any[],
    countQuery: any[]
  ): Promise<object> {
    try {
      const queryData = await this.stockHistory.aggregate(query);
      const queryCount = await this.stockHistory.aggregate(countQuery);
      console.log(queryData);

      let count = 0;
      if (queryCount[0] && queryCount[0].count) count = queryCount[0].count;
      return { queryData: queryData, count: count };
    } catch (error) {
      throw error;
    }
  }
}

export default StockHistoryService;
