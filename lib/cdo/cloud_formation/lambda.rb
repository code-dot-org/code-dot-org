module Cdo::CloudFormation
  # Helper functions related to use of Lambda functions in CloudFormation stacks.
  module Lambda
    # S3 bucket containing uploaded Lambda zip packages.
    S3_LAMBDA_BUCKET = 'cdo-dist'.freeze

    # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-zipfile
    ZIPFILE_MAX = 4096

    # Inline a single javascript file into a CloudFormation template for a Lambda function resource.
    # Raises an error if the minified file is too large.
    # Use UglifyJS to compress code if `uglify` parameter is set.
    def js(filename, uglify=true)
      str =
        if uglify
          RakeUtils.npm_install
          `$(npm bin)/uglifyjs --compress --mangle -- #{filename}`
        else
          File.read(filename)
        end
      if str.length > ZIPFILE_MAX
        raise "Length of JavaScript file '#{filename}' (#{str.length}) cannot exceed #{ZIPFILE_MAX} characters."
      end
      str.to_json
    end

    # Zip a Lambda package of files and upload to S3.
    def lambda_zip(*files, key_prefix: 'lambda')
      # Zip files contain non-deterministic timestamps, so calculate a deterministic hash based on file contents.
      globs = files.map do |file|
        file += '/**/*' if File.directory?(file)
        file
      end
      hash = Digest::MD5.hexdigest(
        Dir[*globs].
          select(&File.method(:file?)).
          sort.
          map(&Digest::MD5.method(:file)).
          join
      )
      code_zip = `zip -qr - #{files.join(' ')}`
      key = "#{key_prefix}-#{hash}.zip"
      s3_client = Aws::S3::Client.new(http_read_timeout: 30)
      object_exists = s3_client.head_object(bucket: S3_LAMBDA_BUCKET, key: key) rescue nil
      unless object_exists
        CDO.log.info("Uploading Lambda zip package to S3 (#{code_zip.length} bytes)...")
        s3_client.put_object({bucket: S3_LAMBDA_BUCKET, key: key, body: code_zip})
      end
      {
        S3Bucket: S3_LAMBDA_BUCKET,
        S3Key: key
      }.to_json
    end

    # Zip an array of JS files (along with the `node_modules` folder), and upload to S3.
    def js_zip(files)
      Dir.chdir(aws_dir('cloudformation')) do
        RakeUtils.npm_install '--production'
      end
      lambda_zip(*files, 'node_modules', key_prefix: 'lambdajs')
    end

    def ruby_zip(name)
      dir = aws_dir('lambda', name)
      Dir.chdir(dir) do
        RakeUtils.bundle_install '--deployment'
        lambda_zip("#{name}.rb", 'vendor', key_prefix: 'lambdarb')
      end
    end

    # Helper function to call a Lambda-function-based AWS::CloudFormation::CustomResource.
    # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cfn-customresource.html
    def lambda_fn(function_name, properties={})
      custom_type = properties.delete(:CustomType)
      depends_on = properties.delete(:DependsOn)
      custom_resource = {
        Type: properties.delete('Type') || "Custom::#{custom_type || function_name}",
        Properties: {
          ServiceToken: {'Fn::Join' => [':', [
            'arn:aws:lambda',
            {Ref: 'AWS::Region'},
            {Ref: 'AWS::AccountId'},
            'function',
            function_name
          ]]}
        }.merge(properties)
      }
      custom_resource['DependsOn'] = depends_on if depends_on
      custom_resource.to_json
    end
  end
end
