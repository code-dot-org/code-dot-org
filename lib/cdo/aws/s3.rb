require 'aws-sdk-s3'
require 'tempfile'
require 'active_support/core_ext/module/attribute_accessors'
require 'active_support/core_ext/hash/slice'
require 'honeybadger/ruby'
require 'dynamic_config/dcdo'

module AWS
  module S3
    mattr_accessor :s3

    # AWS SDK client plugin to log 'slow' (as defined by :notify_timeout) S3 responses to Honeybadger,
    # recording the request headers in the error context for further investigation.
    class SlowAwsResponseNotifier < Seahorse::Client::Plugin
      option(:notify_timeout, 5) # seconds

      class Handler < Seahorse::Client::Handler
        def call(context)
          start_time = Time.now
          response = @handler.call(context)
          duration = Time.now - start_time
          if duration > context.config.notify_timeout
            Honeybadger.notify(
              error_class: "SlowAWSResponse",
              error_message: "Slow AWS response",
              context: response.context.
                http_response.headers.to_h.
                slice('x-amz-request-id', 'x-amz-id-2').
                merge(duration: duration)
            )
          end
          response
        end
      end
      handler(Handler)
      Aws::S3::Client.add_plugin(self)
    end

    # An exception class used to wrap the underlying Amazon NoSuchKey exception.
    class NoSuchKey < RuntimeError
      def initialize(message = nil)
        super(message)
      end
    end

    # Creates an S3 client using the the official AWS SDK for Ruby v2 and
    # the credentials specified in the CDO config.
    # @return [Aws::S3::Client]
    def self.connect_v2!
      self.s3 ||= Aws::S3::Client.new

      # Adjust s3_timeout using a dynamic variable,
      # updating the S3 client if the variable changes.
      timeout = DCDO.get('s3_timeout', 15)
      if timeout != s3.config.http_open_timeout
        s3.config.http_open_timeout = timeout
        s3.config.http_read_timeout = timeout
        s3.config.http_idle_timeout = timeout / 2
      end

      notify_timeout = DCDO.get('s3_slow_request', timeout)
      s3.config.notify_timeout = notify_timeout if s3.config.notify_timeout != notify_timeout

      s3
    end

    # A simpler name for connect_v2!
    def self.create_client
      connect_v2!
    end

    # Returns the value of the specified S3 key in bucket.
    # @param [String] bucket
    # @param [String] key
    # @return [String]
    def self.download_from_bucket(bucket, key, options={})
      create_client.get_object(bucket: bucket, key: key).body.read.force_encoding(Encoding::BINARY)
    rescue Aws::S3::Errors::NoSuchKey
      raise NoSuchKey.new("No such key `#{key}'")
    end

    # Returns true iff the specified S3 key exists in bucket
    # @param [String] bucket
    # @param [String] key
    # @return [Boolean]
    def self.exists_in_bucket(bucket, key)
      create_client.head_object(bucket: bucket, key: key)
      return true
    rescue Aws::S3::Errors::NotFound, Aws::S3::Errors::Forbidden
      return false
    end

    # Returns true iff the specified S3 key exists in the bucket
    #
    # Will query all objects in the bucket up front and cache that result. Note
    # this cache will not expire, so this method is not recommended for use in
    # production. The create and delete operations defined in this module do
    # attempt to keep this cache up-to-date, but other operations could easily
    # modify the bucket contents and render this method unreliable.
    #
    # Note also that we are not using the Rails cache framework for this. We
    # rely on this method for the text-to-speech update; specifically the
    # translation-aware tts update we do as part of the i18n sync, which
    # happens in a development environment for which the Rails cache is
    # disabled.
    #
    # @param [String] bucket
    # @param [String] key
    # @return [Boolean]
    def self.cached_exists_in_bucket?(bucket, key)
      @cached_bucket_contents ||= {}

      unless @cached_bucket_contents.key? bucket
        cache = Set[]
        # list_objects_v2 returns at most 1,000 items from the bucket, so we
        # need to repeatedly call it with a continuation token in order to
        # retrieve all items in the bucket.
        result = create_client.list_objects_v2({bucket: bucket})
        while result.is_truncated
          cache.merge(result.contents.collect(&:key))
          token = result.next_continuation_token
          result = create_client.list_objects_v2({bucket: bucket, continuation_token: token})
        end
        cache.merge(result.contents.collect(&:key))
        @cached_bucket_contents[bucket] = cache
      end

      @cached_bucket_contents[bucket].include? key
    end

    # Sets the value of a key in the given S3 bucket.
    # The key name is derived from 'filename', prepending a random prefix
    # unless options[:no_random] is set.
    # @param [String] bucket S3 bucket name.
    # @param [String] filename Suffix of the key to fetch
    # @param [String] data The data set.
    # @param [Hash] options Aws::S3::Client#put_object options as documented at
    # http://docs.aws.amazon.com/sdkforruby/api/Aws/S3/Client.html#put_object-instance_method.
    # @return [String] The key of the new value, derived from filename.
    def self.upload_to_bucket(bucket, filename, data, options={})
      no_random = options.delete(:no_random)
      filename = "#{random}-#{filename}" unless no_random
      create_client.put_object(options.merge(bucket: bucket, key: filename, body: data))

      # add key to local cache used by cached_exists_in_bucket?
      if @cached_bucket_contents && @cached_bucket_contents[bucket]
        @cached_bucket_contents[bucket].add(filename)
      end
      filename
    end

    # Attempts to delete a specified file from the given s3 bucket.
    # @param [String] bucket The s3 bucket name.
    # @param [String] filename The filename to delete.
    # @return [Boolean] If the file was successfully deleted.
    def self.delete_from_bucket(bucket, filename)
      response = create_client.delete_object({bucket: bucket, key: filename})

      # remove key from local cache used by cached_exists_in_bucket?
      if @cached_bucket_contents && @cached_bucket_contents[bucket]
        @cached_bucket_contents[bucket].delete(filename)
      end

      response.delete_marker
    rescue Aws::S3::Errors::NoSuchKey
      false
    end

    # Allow the RNG to be stubbed in tests
    def self.random
      SecureRandom.hex
    end

    def self.public_url(bucket, filename)
      Aws::S3::Object.new(
        bucket,
        filename,
        client: create_client,
        region: CDO.aws_region
      ).public_url
    end

    # Downloads a file in an S3 bucket to a specified location.
    # @param bucket [String] The S3 bucket name.
    # @param key [String] The S3 key.
    # @param filename [String] The filename to write to.
    # @return [String] The filename written to.
    def self.download_to_file(bucket, key, filename)
      open(filename, 'wb') do |file|
        create_client.get_object(bucket: bucket, key: key) do |chunk|
          file.write(chunk)
        end
      end
      return filename
    end

    # Processes an S3 file, requires a block to be executed after the data has
    # been downloaded to the temporary file (passed as argument to the block).
    # @param bucket [String] The S3 bucket name.
    # @param key [String] The S3 key.
    def self.process_file(bucket, key)
      CDO.log.debug "Processing #{key} from #{bucket}..."
      temp_file = Tempfile.new(["#{File.basename(key)}."])
      begin
        yield download_to_file(bucket, key, temp_file.path)
      ensure
        temp_file.close
        temp_file.unlink
      end
    end

    # Finds all objects with a given extension in the given bucket
    # @param bucket [String] The S3 bucket name.
    # @param ext [String] An extension to search for.
    # @param prefix [String] An optional prefix to filter objects by.
    def self.find_objects_with_ext(bucket, ext, prefix)
      object_keys = []
      # list_objects is paginated and each response is up to 1000 objects
      create_client.list_objects_v2(bucket: bucket, prefix: prefix).each do |response|
        object_keys.concat(
          response.contents.map(&:key).
            filter {|key| key.ends_with?(ext)}
        )
      end
      object_keys
    end

    # Processes an S3 file, requires a block to be executed after the data has
    # been downloaded to the temporary file (passed as argument to the block).
    # The block will not be called if the exact version of the S3 object has
    # been processed before. After processing, the bucket, key, and etag of the
    # object are written to the database to prevent processing again.
    # The entire execution is wrapped in a transaction.
    # @param bucket [String] The S3 bucket name.
    # @param key [String] The S3 key.
    # @param dry_run [Boolean] If true, do not update seeded object tracking.
    def self.seed_from_file(bucket, key, dry_run = false)
      etag = create_client.head_object({bucket: bucket, key: key}).etag
      unless SeededS3Object.exists?(bucket: bucket, key: key, etag: etag)
        AWS::S3.process_file(bucket, key) do |filename|
          ActiveRecord::Base.transaction do
            yield filename
            unless dry_run
              SeededS3Object.create!(
                bucket: bucket,
                key: key,
                etag: etag,
              )
            end
          end
        end
      end
    end

    # Generate and return a presigned URL that allows a file upload.
    # @raise [ArgumentError] Raised if `:expires_in` exceeds one week (604800 seconds).
    # @return [String]
    def self.presigned_upload_url(bucket, key, params = {})
      presigned_url(:put_object, bucket, key, params)
    end

    # Generate and return a presigned URL that allows a file download.
    # @raise [ArgumentError] Raised if `:expires_in` exceeds one week (604800 seconds).
    # @return [String]
    def self.presigned_download_url(bucket, key, params = {})
      presigned_url(:get_object, bucket, key, params)
    end

    # Generate and return a presigned URL that allows a file to be deleted.
    # @raise [ArgumentError] Raised if `:expires_in` exceeds one week (604800 seconds).
    # @return [String]
    def self.presigned_delete_url(bucket, key, params = {})
      presigned_url(:delete_object, bucket, key, params)
    end

    def self.presigned_url(method, bucket, key, params = {})
      params = params.merge(
        bucket: bucket,
        key: key
      )
      Aws::S3::Presigner.new(client: create_client).presigned_url(method, params)
    end

    class LogUploader
      # A LogUploader is constructed with some preconfigured settings that will
      # apply to all log uploads - presumably you may be uploading many similar
      # logs.
      # @param [String] bucket name on S3
      # @param [String] prefix to prepend to all log keys/filenames
      # @param [Bool] make_public will cause the uploaded files to be given
      #        public_read permission, and public URLs to be returned.  Otherwise,
      #        files will be private and short-term presigned URLs will be returned.
      def initialize(bucket, prefix, make_public=false)
        @bucket = bucket
        @prefix = prefix
        @make_public = make_public
      end

      # Uploads a log to S3 at the given key (appended to the configured prefix),
      # returning a URL to the uploaded file.
      # @param [String] name where the log will be placed under the configured prefix
      # @param [String] body of the log to be uploaded
      # @param [Hash] options
      # @return [String] public URL of uploaded log
      # @raise [Exception] if the S3 upload fails
      # @see http://docs.aws.amazon.com/sdkforruby/api/Aws/S3/Client.html#put_object-instance_method for supported options
      def upload_log(name, body, options={})
        key = "#{@prefix}/#{name}"

        options[:acl] = 'public-read' if @make_public
        result = AWS::S3.create_client.put_object(
          options.merge(
            bucket: @bucket,
            key: key,
            body: body
          )
        )
        if @make_public
          log_url = AWS::S3.public_url(@bucket, key)
          log_url += "?versionId=#{result[:version_id]}" unless result[:version_id].nil?
          log_url
        else
          # Expire link in 72 hours
          options = {bucket: @bucket, key: key, expires_in: 259200}
          options[:version_id] = result[:version_id] unless result[:version_id].nil?
          Aws::S3::Presigner.new.presigned_url(:get_object, options)
        end
      end

      # Uploads the given file to S3, returning a URL to the uploaded file.
      # Files are kept flat within the LogUploader's prefix - only the file's
      # basename is used for its S3 key.
      # @param [String] filename to upload to S3
      # @param [Hash] options
      # @return [String] public URL of uploaded file
      # @raise [Exception] if the file cannot be opened or the S3 upload fails
      # @see http://docs.aws.amazon.com/sdkforruby/api/Aws/S3/Client.html#put_object-instance_method for supported options
      def upload_file(filename, options={})
        File.open(filename, 'rb') do |file|
          return upload_log(File.basename(filename), file, options)
        end
      end
    end
  end
end
