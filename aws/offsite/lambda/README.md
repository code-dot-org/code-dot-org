AWS Lambda functions for the offsite AWS account are not built and deployed automatically.  Use the following manual
steps:

1) Install each required package locally within the Lambda Function's directory (except aws-sdk, which AWS Lambda preloads):

    `npm install packageName`
 
2) Zip the **contents** of the Lambda Function's directory (not the directory itself):

    `zip -r ../lambda-function-name.zip .`
    
3) Upload the zip file to the offsite S3 bucket `cdo-secondary-dist`, replacing the existing zip file for that function

4) In the AWS offsite account Console, **Edit** the Function

    * set Code Entry Type = 'Upload a File from S3'
    * set S3 Link URL = S3 link to uploaded zip file (example: `https://s3.amazonaws.com/cdo-secondary-dist/function.zip`)

5) **Save** the AWS Lambda Function in the offsite AWS Console for the function code to be reloaded from the S3 zip file


