import Joi from 'joi';
const create = Joi.object({
    name: Joi.string().required(),
    phoneNo: Joi.string().required().min(10).max(10),
    companyLogo: Joi.string(),
    emailId: Joi.string().email(),
    companyInvoiceNo: Joi.string(),
    website: Joi.string(),
    defaultAddress: Joi.object(),
    gstNumber: Joi.string(),
    taxPercentage: Joi.number(),
    cgst: Joi.number(),
    sgst: Joi.number(),
    igst: Joi.number(),
    roles: Joi.array(),
    lastEmployeNo: Joi.number(),
    lastOrderNo: Joi.number(),
    lastInvoiceNo: Joi.number()
});

const update = Joi.object({
    name: Joi.string().trim().lowercase(),
    phoneNo: Joi.string().alphanum().min(10).max(10),
    emailId: Joi.string().email(),
    companyLogo: Joi.string(),
    companyInvoiceNo: Joi.string(),
    website: Joi.string(),
    defaultAddress: Joi.object(),
    gstNumber: Joi.string(),
    taxPercentage: Joi.number(),
    cgst: Joi.number(),
    sgst: Joi.number(),
    igst: Joi.number(),
    roles: Joi.array(),
    lastEmployeNo: Joi.number(),
    lastOrderNo: Joi.number(),
    lastInvoiceNo: Joi.number()
});

export default { create, update };
