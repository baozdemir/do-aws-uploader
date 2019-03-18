"use strict";

const Fs = require("fs");
const IsStream = require("is-stream");
const AWS = require("aws-sdk");
const Mimos = require("mimos");
const Async = require("async");
const Joi = require("joi");
const optionValidation = require("./option_validation");
const endpointCreator = require("./endpoint_creator");

AWS.config.update({
  signatureVersion: "v4"
});

class Forklift {
  /**
   * Initialize Uploader
   * @param {{ cloud: string, accessKey: string, secretKey: string, region: string, bucket: string, }} options
   */
  constructor(options) {
    const result = Joi.validate(options, optionValidation);

    if (result.error) {
      throw result.error;
    }

    this.options = result.value;
    this.mimos = new Mimos();

    const { remoteUrl, endpoint } = endpointCreator(
      this.options.cloud,
      this.options.region,
      this.options.bucket
    );

    this.remoteUrl = remoteUrl;
    this.endpoint = endpoint;

    const s3ptions = {
      params: {
        Bucket: this.options.bucket,
        ACL: this.options.s3params.ACL
      },
      credentials: new AWS.Credentials({
        accessKeyId: this.options.accessKey,
        secretAccessKey: this.options.secretKey
      })
    };

    if (this.options.cloud === "do") s3ptions.endpoint = this.endpoint;

    this.s3 = new AWS.S3(s3ptions);
  }

  /**
   * @callback UploadCallback
   * @param {Error} error
   * @param {string} [url]
   */

  /**
   * Upload file to S3
   * @param {string} source
   * @param {string} s3RemotePath
   * @param {object} [options]
   */

  async upload(source, s3RemotePath, options = {}) {
    return new Promise((resolve, reject) => {
      if (!options.hasOwnProperty("remove")) {
        options.remove = true;
      }

      if (!options.hasOwnProperty("timestamp")) {
        options.timestamp = true;
      }

      if (!source) {
        return reject(new Error("Source should be exist."));
      }

      const isSourceStream = IsStream.readable(source);
      const isSourceString =
        typeof source === "string" || source instanceof String;
      const isSourceBuffer = source instanceof Buffer;

      if (!isSourceStream && !isSourceString && !isSourceBuffer) {
        return reject(
          new Error("Source should be stream or path to existing file.")
        );
      }

      if (
        !s3RemotePath ||
        !(typeof s3RemotePath === "string" || s3RemotePath instanceof String)
      ) {
        return reject(new Error("s3RemotePath should be exist"));
      }

      const params = Object.assign(options, {
        Body:
          isSourceStream || isSourceBuffer
            ? source
            : Fs.createReadStream(source),
        Key: s3RemotePath
      });

      Async.auto(
        {
          uploadFile: autoCallback => {
            if (!params.ContentType && isSourceString) {
              const mime = this.mimos.path(source);
              if (mime && mime.type) {
                params.ContentType = mime.type;
              }
            }

            this.s3.upload(params, error => {
              if (error) {
                console.log(error);
                return autoCallback(error);
              }

              let url = this.remoteUrl + s3RemotePath;
              if (options.timestamp) {
                url = `${url}?${Date.now()}`;
              }
              console.log(url);
              return autoCallback(null, url);
            });
          },
          removeFile: [
            "uploadFile",
            (result, autoCallback) => {
              if (!options.remove || !isSourceString) {
                return autoCallback();
              }

              // Fs.unlink(source, autoCallback);
            }
          ]
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          const url = result.uploadFile;
          return resolve(url);
        }
      );
    });
  }
}

module.exports = Forklift;
