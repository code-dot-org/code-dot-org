# This script is used to batch upload non-EN videos, with the assumption that
# we will frequently get these in batches. They will be uploaded to YouTube
# and S3 as well as added to videos.csv.

require 'google/apis'
require 'google/apis/youtube_v3'
require 'google/api_client/client_secrets.rb'
require 'googleauth'
require 'googleauth/stores/file_token_store'
require 'csv'
require 'fileutils'
require 'rubygems'
require 'csv'

require_relative '../../dashboard/config/environment'

# The directory where the files are in. There can be multiple folders in this folder,
# but those must be noted in the map file below
VIDEO_FILE_DIRECTORY = '../test-videos/'
# CSV that maps video keys to their title and filename
# Must have columns titled 'Folder', 'Partner filename', 'Key', and 'Video Title'
MAP_FILE = 'test.csv'
# Switch this to false when ready to run
DRY_RUN = true
LOCALE = 'fr-FR'

APPLICATION_NAME = 'Dubbed Video Batch Upload'

# REPLACE WITH NAME/LOCATION OF YOUR client_secrets.json FILE
CLIENT_SECRETS_PATH = ''

# This is the URI so that we can authorize from a browser. Don't change this.
REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'

SCOPE = Google::Apis::YoutubeV3::AUTH_YOUTUBE_UPLOAD

# Let's get a set of the videos we're going to upload
def parse_video_file_paths(map_file)
  videos = CSV.read(map_file, headers: true).map do |row|
    {key: row['Key'], file_path: File.join(VIDEO_FILE_DIRECTORY, row['Folder'], row['Partner filename']), title: row['Video Title']}
  end
  videos
end

def upload_to_s3(filename)
  if !DRY_RUN
    File.open(filename, 'rb') do |file|
      s3_filename = File.basename(filename).parameterize + '.mp4'
      AWS::S3.upload_to_bucket(
        'videos.code.org',
        "levelbuilder/#{s3_filename}",
        file,
        acl: 'public-read',
        no_random: true
      )
    end
  else
    "test-file.mp4"
  end
end

def authorize
  client_secrets = Google::APIClient::ClientSecrets.load(CLIENT_SECRETS_PATH)
  auth_client = client_secrets.to_authorization
  auth_client.update!(
    scope: SCOPE,
    redirect_uri: REDIRECT_URI
  )

  auth_uri = auth_client.authorization_uri.to_s
  puts auth_uri

  puts 'Paste the code from the auth response page:'
  auth_client.code = gets
  auth_client.fetch_access_token!
  auth_client
end

def initialize_youtube
  service = Google::Apis::YoutubeV3::YouTubeService.new
  service.client_options.application_name = APPLICATION_NAME
  service.authorization = authorize
  service
end

# Returns the YouTube code
def upload_to_youtube(service, filename, title)
  if DRY_RUN
    'youtube_code'
  else
    properties = {'snippet': {'category_id': '22',
                          'tags[]': '',
                          'title': title,
                          'embeddable': 'true'},
              'status': {'privacy_status': 'unlisted'}}
    params = {'upload_source': filename, 'content_type': 'video/mp4'}
    part = 'snippet,status'
    response = service.insert_video(part, properties, params)
    response.id
  end
end

def validate_key(key, locale)
  return false unless Video.exists?(key: key, locale: I18n.default_locale)
  return true unless Video.exists?(key: key, locale: locale)
end

videos = parse_video_file_paths(MAP_FILE)
service = initialize_youtube
uploaded_videos = 0
videos.each do |video|
  if validate_key(video[:key], LOCALE)
    puts "uploading " + video[:key]
    download = upload_to_s3(File.open(video[:file_path]))
    youtube_code = upload_to_youtube(service, video[:file_path], video[:title])
    Video.merge_and_write_attributes(video[:key], youtube_code, download, LOCALE, 'dashboard/config/videos.csv')
    uploaded_videos += 1
  else
    puts "Failed to validate " + video[:key]
  end
end
puts "uploaded #{uploaded_videos} videos"
