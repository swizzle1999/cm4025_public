const router = require("express").Router();
const config = require("config");
const AWS = require("aws-sdk");

const BUCKET_NAME = "cm4025";
const IAM_USER_KEY = config.get("IAMUserAccessKeyID");
const IAM_USER_SECRET = config.get("IAMUserSecretAccessKey");

//Route used to upload images to an AWS S3 bucket
//This is needed when adding a new pack so that the images can automatically be uploaded
module.exports = {
    uploadToS3: function(fileName, fileContent){
        return new Promise(function(resolve, reject) {
            let s3bucket = new AWS.S3({
                accessKeyId: IAM_USER_KEY,
                secretAccessKey: IAM_USER_SECRET,
                Bucket: BUCKET_NAME
            });
            s3bucket.createBucket(function() {
                var params = {
                    Bucket: BUCKET_NAME,
                    Key: fileName,
                    Body: fileContent,
                };
                s3bucket.upload(params, function (err, data){
                    if (err){
                        reject(err);
                    }
                    resolve(data)
                })
            })
        })
        
    }
}

// router.post("/", (req, res) => {
    
// });

// module.exports = router;