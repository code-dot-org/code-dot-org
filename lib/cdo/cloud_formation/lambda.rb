require 'active_support/core_ext/numeric/bytes'
require 'zip'
require 'stringio'

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
    def inline_js(filename, uglify: true, max: ZIPFILE_MAX)
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
        inline_js(tmp.path, **args)
      end
    end

    # Prepare (package) a Lambda that uses node runtime to be deployed by CloudFormation
    # by installing dependencies, zipping the Lambda directory, uploading to S3, and returning the S3 URI to
    # populate the `AWS::Lambda::Function` `Code` Property.
    # Assumes Lambdas are in `/aws/cloudformation/lambdas/`.
    def package_node_lambda(relative_directory, environment_variables: {})
      install_node_dependencies(relative_directory)
      return zip_directory(relative_directory, environment_variables: environment_variables)
    end

    # Install npm packages used by a lambda to prepare the directory the lambda is in for being zipped and uploaded.
    # Assumes Lambdas are in `/aws/cloudformation/lambdas/`.
    def install_node_dependencies(relative_directory)
      absolute_directory = aws_dir('cloudformation/lambdas' + '//' + relative_directory)

      CDO.log.info("Installing Node dependencies in #{absolute_directory}")

      # Use shell command with explicit directory change to ensure npm runs in correct location
      # The 'cd' and 'npm' commands run in the same shell, so npm will use the correct working directory
      RakeUtils.system("cd #{absolute_directory} && npm ci --only=prod")
    end

    # Zip a directory containing a Lambda's source code and dependencies, upload to S3, and return both the S3 location
    # and content hash to assist in populating CloudFormation template resources for AWS::Lambda::Function and AWS::Lambda::Version.
    # Assumes Lambdas are in `/aws/cloudformation/lambdas/`.
    # @param relative_directory [String] Name of Lambda directory relative to `/aws/cloudformation/lambdas`.
    # @param environment_variables [Hash] Environment variables to write to `env.json` in the zip package. This is intended
    # for use in Lambda@Edge functions greater than 4KB in size, which cannot be inlined and do not support Lambda environment variables.
    # @param key_prefix [String] String to prefix on zip package filename (object key) before uploading to S3.
    # @return [Hash] Hash containing:
    #   - :s3_location [Hash] S3 deployment package with :S3Bucket and :S3Key for CloudFormation Code property
    #   - :content_hash [String] MD5 hash of directory contents for Lambda version tracking
    # @example
    #   result = zip_directory('my-lambda', environment_variables: {API_URL: 'https://api.example.com'})
    #   # result[:s3_location] => {S3Bucket: 'cdo-dist', S3Key: 'lambda-my-lambda-abc123.zip'}
    #   # result[:content_hash] => 'abc123def456...'
    #
    #   # Usage in CloudFormation template:
    #   Code: <%= result[:s3_location].to_json %>
    #   Description: "Code hash: <%= result[:content_hash] %>"
    def zip_directory(relative_directory, environment_variables: {}, key_prefix: 'lambda')
      absolute_directory = aws_dir(File.join('cloudformation/lambdas', relative_directory))
      raise "#{absolute_directory} is not a file system directory." unless File.directory?(absolute_directory)

      env_json_path = File.join(absolute_directory, 'env.json')
      env_json_created = false
      debug_mode = ENV['RAKE_DEBUG'] == 'true' || ENV['DEBUG'] == 'true'

      begin
        # If environment variables are provided, write them to a file.
        if environment_variables.present?
          raise ArgumentError, 'Environment variable hash must be a Hash.' unless environment_variables.is_a?(Hash)
          File.open(env_json_path, 'w') do |file|
            file.write(environment_variables.to_json)
            CDO.log.info("Wrote lambda environment variables to #{env_json_path}")
          end
          env_json_created = true
        end

        # Zip files contain non-deterministic timestamps, so calculate a deterministic hash based on file contents.
        globs = absolute_directory + '/**/*'
        hash = Digest::MD5.hexdigest(
          Dir[*globs].
            select {|file_name| File.file?(file_name)}.
            sort.
            map {|file_name| Digest::MD5.file(file_name)}.
            join
        )

        # Create zip file in memory using Zip::OutputStream
        zip_buffer = Zip::OutputStream.write_buffer do |zip|
          Dir.glob(File.join(absolute_directory, '**', '*')).each do |file_path|
            next if File.directory?(file_path)

            # Calculate relative path within the zip (relative to absolute_directory)
            relative_path = Pathname.new(file_path).relative_path_from(Pathname.new(absolute_directory)).to_s

            zip.put_next_entry(relative_path)
            zip.write(File.read(file_path))
          end
        end

        code_zip = zip_buffer.string

        # Debug: Write zip to temporary file if debug mode is enabled
        if debug_mode
          debug_zip_path = "/tmp/lambda-debug-#{relative_directory}-#{hash}.zip"
          File.write(debug_zip_path, code_zip)
          CDO.log.info("DEBUG: Lambda zip written to #{debug_zip_path} (#{code_zip.length} bytes)")

          # Verify zip contents
          verify_zip_contents(debug_zip_path)
        end

        # Validate zip content
        if code_zip.empty?
          raise "Generated Lambda zip is empty! Directory: #{absolute_directory}"
        end

        # Include relative_directory in the S3 key for better debugging
        key = "#{key_prefix}-#{relative_directory}-#{hash}.zip"

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

        # Return both S3 location and hash of source code.
        {
          s3_location: {
            S3Bucket: S3_LAMBDA_BUCKET,
            S3Key: key
          },
          content_hash: hash
        }
      ensure
        # Clean up env.json file if we created it
        File.delete(env_json_path) if env_json_created && File.exist?(env_json_path)
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

    # Debug helper to verify zip contents
    private def verify_zip_contents(zip_path)
      Zip::File.open(zip_path) do |zipfile|
        CDO.log.info("DEBUG: Zip contains #{zipfile.size} files:")
        zipfile.each do |entry|
          CDO.log.info("  #{entry.name} (#{entry.size} bytes)")
        end
      end
    rescue => exception
      CDO.log.error("DEBUG: Failed to verify zip contents: #{exception.message}")
    end
  end
end
