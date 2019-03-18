[aws-sdk](https://github.com/aws/aws-sdk-js) based kinda high level s3 uploader for **AWS** and **Digital Ocean**. It wraps [upload](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property) method of aws-sdk. For file upload, `ContentType` automatically added. Also, it can remove uploaded file from the file system, after upload completed successfully.

  

## Install

  

```sh
$ npm install
```


## Test

  

Rename `secret.example.json` to `secret.json` with valid credentials and bucket-name. Then, run test via ;
  
```sh
$ npm run test
```
  

## Requirements

  

* Node.js 6+

  

## Initialize

  

```javascript

const  Forklift = require("/path/forklift");



// Initialize;

const  forklift = new  Forklift({

cloud:	"<CLOUD_NAME>" // do or aws

accessKey:  "<YOUR_ACCESS_KEY>",

secretKey:  "<YOUR_SECRET_KEY>",

bucket:  "<BUCKET_NAME>",

region:  "<REGION>"

s3params: {ACL:  "bucket-owner-read"} // optional, default: {ACL: "public-read"}

});

```

  

## Upload

  

*  `source` should be string (file path) or readable stream.

*  `s3RemotePath` s3 path.

*  `options` are optional. Besides the all the options of original [AWS upload](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property), [Digital Ocean upload](https://www.digitalocean.com/docs/spaces/how-to/upload-and-delete-files/) you can pass `{remove: true}` to remove the source if the source is a file after upload completed successfully.

  

```javascript

const  url = await  forklift.upload(source, s3RemotePath, /*options*/);

// region + bucket merged to get url as absolute

// like; https://s3.amazonaws.com/bucket_name/file_path
// like; https://digitaloceanspaces.com/bucket_name/file_path

  

```

## What should I do with the version change? ###

* Format is should be  ( Major . Minor . Fix ) (1.0.0)
* If the change is bug fix, [Fix] version should be increased (1.0.1)
* If changes is made in prerequisite, requires testing, requires changes to the test documentation, add new endpoint or edit existing endpoint [Minor] version should be increased (1.1.0)
* If the usage is changed, added new features or big changes [Major] version should be increased (2.0.0)

 
## Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines 
 

## Example

  

```javascript

// To upload file

// ContentType automatically retrieved from file name and passed to S3.upload

// if you want to override it, you should pass {ContentType:"<CONTENT_TYPE>"} as options.

  

const  url = await  forklift.upload("test.jpg", "test/test.jpg");

  

// example for version 1.0.0

// To upload and then remove the file with callback

forklift.upload("test.jpg", "test/test.jpg", {remove:  true}, (error, url) => {

});

  

// To upload a stream without ContentType

const  url = await  forklift.upload(fs.createReadStream("test.jpg"), "test/test.jpg");

  

// To upload a stream with ContentType

const  url = await  forklift.upload(fs.createReadStream("test.jpg"), "test/test.jpg", {ContentType:"image/jpeg"});

```
