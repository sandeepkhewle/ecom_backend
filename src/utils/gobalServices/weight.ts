const calWeight = (products:any) =>{
    const totalWeight:number = products.reduce((acc:number, item:any, index:number) => {
        console.log("item",item);
        
        let finalProductWeightInGrams = item?.productId?.productWeightInGrams ? item?.productId?.productWeightInGrams : item?.productWeightInGrams
        let finalQty = item?.quantity ? item?.quantity : item?.orderQty
        console.log("finalProduct",finalProductWeightInGrams);
        
        return acc + (Number(finalQty) * finalProductWeightInGrams)
    }, 0)
    
    const totalWightInKg = totalWeight / 1000
      return totalWightInKg
}

export default calWeight;