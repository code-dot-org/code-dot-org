require 'aws/s3'
require 'aws-sdk'

module AWS
  module S3
    # Connects to the official AWS SDK for Ruby v2
    def self.connect_v2!
      s3_params = {access_key_id: CDO.s3_access_key_id, secret_access_key: CDO.s3_secret_access_key, region: 'us-east-1'}
      Aws::S3::Client.new(s3_params)
    end

    def self.connect!()
      AWS::S3::Base.establish_connection! access_key_id:CDO.s3_access_key_id, secret_access_key:CDO.s3_secret_access_key
    end

    def self.download_from_bucket(bucket, name, options={})
      connect!
      AWS::S3::S3Object.find(name, bucket).value
    end

    def self.upload_to_bucket(bucket, filename, data, options={})
      filename = "#{SecureRandom.hex}-#{filename}" unless options[:no_random]
      filename.tap do |name|
        connect!
        AWS::S3::S3Object.store(name, data, bucket, options)
      end
    end
  end
end
