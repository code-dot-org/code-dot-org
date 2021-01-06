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
require 'optparse'

APPLICATION_NAME = 'Dubbed Video Batch Upload'

# This is the URI so that we can authorize from a browser. Don't change this.
REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'

SCOPE = Google::Apis::YoutubeV3::AUTH_YOUTUBE_UPLOAD

def parse_options(args)
  options = {}
  opt_parser = OptionParser.new do |opts|
    opts.banner = "Usage: upload_non_en_videos [options]"

    opts.on("-c", "--client_secrets CLIENT_SECRETS_PATH", "Location of client_secrets.json file") do |client_secrets_path|
      options[:client_secrets_path] = client_secrets_path
    end

    opts.on("-m", "--map_file MAP_CSV", "Location of csv file mapping filenames to video keys. Must have columns titled 'Folder', 'Filename', 'Key' (the video key on levelbuilder), and 'Video Title'. Capitalization must match.") do |map_path|
      options[:map_path] = map_path
    end

    opts.on("-l", "--locale LOCALE", "Locale for the videos, ie fr-FR") do |locale|
      options[:locale] = locale
    end

    opts.on("-v", "--video_directory VIDEO_DIRECTORY", "Directory of the video files") do |video_directory|
      options[:video_directory] = video_directory
    end

    opts.on("-r", "--run", "Actually upload the files to YouTube and S3") do |run|
      options[:run] = run
    end

    opts.on('-h', '--help', 'Show command line arguments') do
      puts opts
      exit
    end
  end
  opt_parser.parse!(args)
  options
end

# Let's get a set of the videos we're going to upload
def parse_video_file_paths(map_file, video_file_directory)
  videos = CSV.read(map_file, headers: true).map do |row|
    {key: row['Key'], file_path: File.join([video_file_directory, row['Folder'], row['Filename']].compact), title: row['Video Title']}
  end
  videos
end

def upload_to_s3(filename, upload_files)
  if upload_files
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

def authorize(client_secrets_path)
  client_secrets = Google::APIClient::ClientSecrets.load(client_secrets_path)
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

def initialize_youtube(client_secrets_path, upload_files)
  service = Google::Apis::YoutubeV3::YouTubeService.new
  service.client_options.application_name = APPLICATION_NAME
  service.authorization = authorize(client_secrets_path) if upload_files
  service
end

# Returns the YouTube code
def upload_to_youtube(service, filename, title, upload_files)
  if !upload_files
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

def main(options)
  videos = parse_video_file_paths(options[:map_path], options[:video_directory])
  service = initialize_youtube(options[:client_secrets_path], options[:run])
  uploaded_videos = 0
  videos.each do |video|
    if validate_key(video[:key], options[:locale])
      puts "uploading " + video[:key]
      download = upload_to_s3(File.open(video[:file_path]), options[:run])
      youtube_code = upload_to_youtube(service, video[:file_path], video[:title], options[:run])
      Video.merge_and_write_attributes(video[:key], youtube_code, download, options[:locale], 'dashboard/config/videos.csv')
      uploaded_videos += 1
    else
      puts "Failed to validate " + video[:key]
    end
  end
  puts "uploaded #{uploaded_videos} videos"
end

options = parse_options(ARGV)
# Move this after parse_options so that --help is fast
require_relative '../../dashboard/config/environment'
main(options)
