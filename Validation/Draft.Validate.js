const joi = require('joi');

const DraftValidate = (data) => {
    const Schema = joi.object({
        email: joi.string().email().required(),
        notes: joi.array().items(joi.string()).required(),
    });
    return Schema.validateAsync(data);
};

module.exports = {
    DraftValidate
};
