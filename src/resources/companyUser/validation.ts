import Joi from 'joi';

const create = Joi.object({
    firstName: Joi.string().max(30).required(),
    emailId: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phoneNo: Joi.string().min(10).max(10).required(),

});

const update = Joi.object({
    firstName: Joi.string().max(30),
    emailId: Joi.string().email(),
    password: Joi.string().min(6),
    phoneNo: Joi.string().min(10).max(10),

});

const login = Joi.object({
    emailId: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});


export default { create, update, login };
