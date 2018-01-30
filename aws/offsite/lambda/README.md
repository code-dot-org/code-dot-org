To deploy node.js code to the secondary/offsite AWS account:

1) Install each package locally within the Lambda Function's directory:
    npm install packageName
 
2) Zip the Lambda Function's directory:
    zip -r lambdaFunc.zip .
    
NOTE:
The zip command must be issued while in the Lambda function's directory.
Zip the contents of the directory, not the directory itself.

3) Upload the zip file to S3, replacing the existing zip file for that function


