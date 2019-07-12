require 'aws-sdk-s3'
require 'rest-client'

def create_upload_credentials
  puts "Creating credentials"
  response = RestClient.post("https://api.mapbox.com/uploads/v1/bethanycodeorg/credentials?access_token=#{CDO.mapbox_upload_token}", {})
  JSON.parse(response.body)
end

def create_upload(config)
  puts "Creating upload"
  RestClient.post("https://api.mapbox.com/uploads/v1/bethanycodeorg?access_token=#{CDO.mapbox_upload_token}", config.to_json, {content_type: :json, accept: :json})
end

def put_file_on_s3(tileset_path, credentials)
  puts "Putting file on s3"
  s3_client = Aws::S3::Resource.new(
    access_key_id: credentials['accessKeyId'],
    secret_access_key: credentials['secretAccessKey'],
    session_token: credentials['sessionToken'],
    region: 'us-east-1'
  )
  obj = s3_client.bucket(credentials['bucket']).object(credentials['key'])
  obj.upload_file(tileset_path)
end

def upload_maptiles(tileset_path, tileset_name)
  credentials = create_upload_credentials
  put_file_on_s3(tileset_path, credentials)
  create_upload(
    {
      url: credentials['url'],
      tileset: "bethanycodeorg.#{tileset_name}",
      name: "bethanycodeorg.#{tileset_name}"
    }
  )
end
