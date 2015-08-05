require 'aws-sdk'

module AWS
  module S3

    # Creates an S3 client using the the official AWS SDK for Ruby v2 and
    # the credentials specified in the CDO config.
    # @return [Aws::S3::Client]
    def self.create_client
      s3_params = {access_key_id: CDO.s3_access_key_id,
                   secret_access_key: CDO.s3_secret_access_key,
                   region: 'us-east-1'}
      Aws::S3::Client.new(s3_params)
    end

    # Returns the value of the specified S3 key in bucket.
    # @param [String] bucket
    # @param [String] key
    # @return [String]
    def self.download_from_bucket(bucket, key, options={})
      create_client.get_object(bucket: bucket, key: name).body
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
