require 'cdo/aws/s3'
#require 'cdo/rack/request'
require 'sinatra/base'

class AssetsApi < Sinatra::Base

  helpers do
    [
      'core.rb',
      'storage_id.rb',
    ].each do |file|
      load(CDO.dir('shared', 'middleware', 'helpers', file))
    end
  end

  get %r{/v3/assets/([^/]+)/([^/]+)$} do |encrypted_channel_id, filename|
    dont_cache
    # storage_decrypt_channel_id('niR2mv8Utp9BOKv8sN2E8A') --> [1, 371]
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    ## infer content_type from filename extension
    content_type :gif
    s3 = Aws::S3::Client.new(region: 'us-east-1')
    key = "#{CDO.assets_s3_directory}/#{owner_id}/#{channel_id}/#{filename}"
    begin
      s3.get_object(bucket:CDO.assets_s3_bucket, key:key).body
    rescue Aws::S3::Errors::NoSuchKey
      not_found
    end
  end

end