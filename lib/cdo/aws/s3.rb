require 'aws-sdk'

module AWS
  module S3
    # An exception class used to wrap the underlying Amazon NoSuchKey exception.
    class NoSuchKey < Exception
      def initialize(message = nil)
        super(message)
      end
    end

    # Creates an S3 client using the the official AWS SDK for Ruby v2 and
    # the credentials specified in the CDO config.
    # @return [Aws::S3::Client]
    def self.connect_v2!
      Aws::S3::Client.new
    end

    # A simpler name for connect_v2!
    def self.create_client
      self.connect_v2!
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
      filename = "#{SecureRandom.hex}-#{filename}" unless no_random
      create_client.put_object(options.merge(bucket: bucket, key: filename, body: data))
      filename
    end

    def self.public_url(bucket, filename)
      Aws::S3::Object.new(bucket, filename, region: CDO.aws_region).public_url
    end
  end
end
