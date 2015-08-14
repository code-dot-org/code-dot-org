require 'aws-sdk'

module AWS
  module S3

    # Region for storing S3 buckets. TODO: Move this CDO configuration.
    S3_REGION = 'us-east-1'

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
      s3_params = {access_key_id: CDO.s3_access_key_id,
                   secret_access_key: CDO.s3_secret_access_key,
                   region: S3_REGION}
      Aws::S3::Client.new(s3_params)
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
    # @param [Hash] options
    # @return [String] The key of the new value, derived from filename.
    def self.upload_to_bucket(bucket, filename, data, options={})
      filename = "#{SecureRandom.hex}-#{filename}" unless options[:no_random]
      create_client.put_object(bucket: bucket, key: filename, body: data)
      filename
    end
  end
end
