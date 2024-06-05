require 'active_support/core_ext/numeric/bytes'

module Cdo::CloudFormation
  # Helper functions related to use of Lambda functions in CloudFormation stacks.
  module Lambda
    # S3 bucket containing uploaded Lambda zip packages.
    S3_LAMBDA_BUCKET = 'cdo-dist'.freeze

    # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-zipfile
    ZIPFILE_MAX = 4.kilobytes
    FUNCTION_MAX = 10.kilobytes

    # Inline a single javascript file into a CloudFormation template for a Lambda function resource.
    # Raises an error if the minified file is too large.
    # Use UglifyJS to compress code if `uglify` parameter is set.
    def js(filename, uglify: true, max: ZIPFILE_MAX)
      str =
        if uglify
          RakeUtils.yarn_install
          `npx uglifyjs --compress --mangle -- #{filename}`
        else
          File.read(filename)
        end
      if str.bytesize > max
        raise "Length of JavaScript file '#{filename}' (#{str.length}) cannot exceed #{max} bytes."
      end
      str.to_json
    end

    def js_erb(filename, **args)
      Tempfile.open do |tmp|
        File.write(tmp, erb_file(filename))
        js(tmp.path, **args)
      end
    end

    # Prepare (package) a Lambda that uses node runtime to be deployed by CloudFormation
    # by installing dependencies, zipping the Lambda directory, uploading to S3, and returning the S3 URI to
    # populate the `AWS::Lambda::Function` `Code` Property.
    # Assumes Lambdas are in `/aws/cloudformation/lambdas/`.
    def package_node_lambda(relative_directory)
      install_node_dependencies(relative_directory)
      return zip_directory(relative_directory)
    end

    # Install npm packages used by a lambda to prepare the directory the lambda is in for being zipped and uploaded.
    # Assumes Lambdas are in `/aws/cloudformation/lambdas/`.
    def install_node_dependencies(relative_directory)
      absolute_directory = aws_dir('cloudformation/lambdas' + '//' + relative_directory)
      Dir.chdir(absolute_directory) do
        # Use the `ci` parameter to only install the versions identified in the lock file.
        # Use `--only=prod` to skip dev dependencies.
        RakeUtils.npm_install 'ci --only=prod'
      end
    end

    # Zip a directory containing a Lambda's source code and dependencies, upload to S3, and return the S3 location
    # to assist in populating the `Code` Property of a CloudFormation template `AWS::Lambda::Function` Resource.
    # Assumes Lambdas are in `/aws/cloudformation/lambdas/`.
    # @param relative_directory [String] Name of Lambda directory relative to `/aws/cloudformation/lambdas`.
    # @param key_prefix [String] String to prefix on zip package filename (object key) before uploading to S3.
    # @return [String] JSON Deployment package https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html
    def zip_directory(relative_directory, key_prefix: 'lambda')
      absolute_directory = aws_dir('cloudformation/lambdas' + '//' + relative_directory)
      raise "#{absolute_directory} is not a file system directory." unless File.directory?(absolute_directory)

      Dir.chdir(absolute_directory) do
        # Zip files contain non-deterministic timestamps, so calculate a deterministic hash based on file contents.
        globs = absolute_directory + '/**/*'
        hash = Digest::MD5.hexdigest(
          Dir[*globs].
            select {|file_name| File.file?(file_name)}.
            sort.
            map {|file_name| Digest::MD5.file(file_name)}.
            join
        )
        code_zip = `zip -qr - .`
        key = "#{key_prefix}-#{hash}.zip"
        s3_client = Aws::S3::Client.new(http_read_timeout: 30)
        object_exists = begin
          s3_client.head_object(bucket: S3_LAMBDA_BUCKET, key: key)
        rescue
          nil
        end
        unless object_exists
          CDO.log.info("Uploading Lambda zip package to S3 (#{code_zip.length} bytes)...")
          s3_client.put_object({bucket: S3_LAMBDA_BUCKET, key: key, body: code_zip})
        end
        {
          S3Bucket: S3_LAMBDA_BUCKET,
          S3Key: key
        }.to_json
      end
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
          select {|filename| File.file?(filename)}.
          sort.
          map {|filename| Digest::MD5.file(filename)}.
          join
      )
      code_zip = `zip -qr - #{files.join(' ')}`
      key = "#{key_prefix}-#{hash}.zip"
      s3_client = Aws::S3::Client.new(http_read_timeout: 30)
      object_exists = begin
        s3_client.head_object(bucket: S3_LAMBDA_BUCKET, key: key)
      rescue
        nil
      end
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
        RakeUtils.yarn_install '--production'
      end
      lambda_zip(*files, 'node_modules', key_prefix: 'lambdajs')
    end

    # Helper function to call a Lambda-function-based AWS::CloudFormation::CustomResource.
    # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cfn-customresource.html
    def lambda_fn(function_name, properties = {})
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
