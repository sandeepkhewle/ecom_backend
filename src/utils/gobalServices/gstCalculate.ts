const finalGSTCal = (cart: any, gstNumber?: string): any => {
    let gstObj: any = {}
    if (gstNumber && gstNumber.slice(0, 2) === "27") {
        gstObj['igst'] = igstCal(cart)
        const products = calPerProduct(cart, true)
        return { ...gstObj, products }
    } else {
        const { cgst, sgst } = stateGst(cart)
        const products = calPerProduct(cart, false)
        gstObj = { cgst, sgst }
        return { ...gstObj, products }
    }
}

const calPerProduct = (cart: any, flag: boolean) => {
    const newProduct = cart.products?.map((product: any) => {
        return {
            ...product?._doc,
            igst: flag ? Number(gstCal(product?.totalPrice, product?.gstRateInPercentage)) : 0,
            cgst: flag ? 0 : Number(gstCal(product?.totalPrice, product?.gstRateInPercentage)) / 2,
            sgst: flag ? 0 : Number(gstCal(product?.totalPrice, product?.gstRateInPercentage)) / 2,
            gstTotal: (Number((gstCal(product?.totalPrice, product?.gstRateInPercentage)) / 2) + Number((gstCal(product?.totalPrice, product?.gstRateInPercentage)) / 2)),
            orderPrice: Number(product?.totalPrice) + (Number((gstCal(product?.totalPrice, product?.gstRateInPercentage)) / 2) + Number((gstCal(product?.totalPrice, product?.gstRateInPercentage)) / 2)),
        }
    })
    return newProduct
}

const igstCal = (cart: any) => {
    return cart?.products?.length && cart?.products?.reduce((acc: number, product: any, index: number) => {
        return acc = acc + gstCal(product?.totalPrice, product?.gstRateInPercentage)
    }, 0)
}

const gstCal = (totalPrice: number, gstRateInPercentage: string): number => {
    return (totalPrice * Number(gstRateInPercentage)) / 100
}

const stateGst = (cart: any): any => {
    let totalGst: number = igstCal(cart);
    let cgst: number = totalGst / 2;
    let sgst: number = totalGst / 2;
    return { cgst, sgst }
}


export { igstCal, stateGst, finalGSTCal };