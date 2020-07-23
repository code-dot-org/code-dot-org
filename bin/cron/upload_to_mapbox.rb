# Util file for uploading tilesets to Mapbox
# Tilesets should be generated using Tippecanoe.
# Tilesets are uploaded to Mapbox's servers using the process documented at
# https://docs.mapbox.com/api/maps/#uploads.
#
# Before using these functions, be sure to provide the following CDO attribute:
#  CDO.mapbox_upload_token: (the auth token for uploading tiles to Mapbox's servers)

require 'aws-sdk-s3'
require 'rest-client'

def create_upload_credentials
  CDO.log.info "Creating credentials"
  response = RestClient.post("https://api.mapbox.com/uploads/v1/codeorg/credentials?access_token=#{CDO.mapbox_upload_token}", {})
  JSON.parse(response.body)
end

# Returns response code
def create_upload(config)
  CDO.log.info "Creating upload"
  RestClient.post("https://api.mapbox.com/uploads/v1/codeorg?access_token=#{CDO.mapbox_upload_token}", config.to_json, {content_type: :json, accept: :json}).code
end

# Return true if upload was successful
def put_file_on_s3(tileset_path, credentials)
  CDO.log.info "Putting file on s3"
  s3_client = Aws::S3::Resource.new(
    access_key_id: credentials['accessKeyId'],
    secret_access_key: credentials['secretAccessKey'],
    session_token: credentials['sessionToken'],
    region: 'us-east-1'
  )
  obj = s3_client.bucket(credentials['bucket']).object(credentials['key'])
  obj.upload_file(tileset_path)
end

# Return true if the upload completed without errors
def upload_maptiles(tileset_path, tileset_name)
  credentials = create_upload_credentials
  return false unless put_file_on_s3(tileset_path, credentials)
  response_code = create_upload(
    {
      url: credentials['url'],
      tileset: "codeorg.#{tileset_name}",
      name: "codeorg.#{tileset_name}"
    }
  )
  return response_code == 200 || response_code == 201
end
