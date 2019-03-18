const Joi = require('joi');

module.exports = Joi.object().keys({
    cloud: Joi.string().valid('aws', 'do').required(),
    accessKey: Joi.string().min(15).max(30).required(),
    secretKey: Joi.string().required(),
    region: Joi.string().required(),
    bucket: Joi.string().required(),
    s3params: Joi.any().default({ ACL: "public-read" }),
    default: Joi.any()
});