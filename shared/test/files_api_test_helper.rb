#
# Helper for generating API requests against the files API.
# When you create it, give it the Rack::Test session you want to make requests
# as.  If you do a new session, you'll have to create a new helper.
#
# Example:
#   api = FilesApiTestHelper.new(current_session, 'sources', channel_id)
#   api.get_object('myfile.txt')
#   with_session(:other_guy) do
#     # current_session returns a different session in this block
#     other_api = FilesApiTestHelper.new(current_session, 'sources', channel_id)
#     other_api.get_object('myfile.txt')
#   end
#
class FilesApiTestHelper
  include Rack::Test::Methods

  def initialize(session, endpoint, channel_id)
    @session = session
    @endpoint = endpoint
    @channel_id = channel_id
  end

  def current_session
    @session
  end

  def list_objects
    get "/v3/#{@endpoint}/#{@channel_id}"
    JSON.parse(last_response.body)
  end

  def get_object(filename, body = '', headers = {})
    get "/v3/#{@endpoint}/#{@channel_id}/#{filename}", body, headers
    last_response.body
  end

  def put_object(filename, body = '', headers = {})
    put "/v3/#{@endpoint}/#{@channel_id}/#{filename}", body, headers
    last_response.body
  end

  def post_object(filename, body = '', headers = {})
    post "/v3/#{@endpoint}/#{@channel_id}/#{filename}", body, headers
    last_response.body
  end

  def post_file(filename, file_contents, content_type)
    body = { files: [create_uploaded_file(filename, file_contents, content_type)] }
    headers = { 'CONTENT_TYPE' => content_type }
    post_object filename, body, headers
  end

  def copy_object(source_filename, dest_filename)
    put "/v3/#{@endpoint}/#{@channel_id}/#{dest_filename}?src=#{CGI.escape(source_filename)}"
    last_response.body
  end

  def delete_object(filename)
    delete "/v3/#{@endpoint}/#{@channel_id}/#{filename}"
  end

  def list_object_versions(filename)
    get "/v3/#{@endpoint}/#{@channel_id}/#{filename}/versions"
    JSON.parse(last_response.body)
  end

  def get_object_version(filename, version_id, body = '', headers = {})
    get "/v3/#{@endpoint}/#{@channel_id}/#{filename}?version=#{version_id}", body, headers
    last_response.body
  end

  def put_object_version(filename, version_id, body = '', headers = {})
    put "/v3/#{@endpoint}/#{@channel_id}/#{filename}?version=#{version_id}", body, headers
    last_response.body
  end

  def post_object_version(filename, version_id, body = '', headers = {})
    post "/v3/#{@endpoint}/#{@channel_id}/#{filename}?version=#{version_id}", body, headers
    last_response.body
  end

  def post_file_version(filename, version_id, file_contents, content_type)
    body = { files: [create_uploaded_file(filename, file_contents, content_type)] }
    headers = { 'CONTENT_TYPE' => content_type }
    post_object_version filename, version_id, body, headers
  end

  def create_uploaded_file(filename, file_contents, content_type)
    Dir.mktmpdir do |dir|
      file_path = "#{dir}/#{filename}"
      File.open(file_path, 'w') do |file|
        file.write(file_contents)
        file.rewind
      end
      Rack::Test::UploadedFile.new(file_path, content_type)
    end
  end

  def ensure_aws_credentials
    list_objects
    credentials_missing = !last_response.successful? &&
        last_response.body.index('Aws::Errors::MissingCredentialsError')
    credentials_msg = <<-TEXT.gsub(/^\s+/, '').chomp
      Aws::Errors::MissingCredentialsError: if you are running these tests locally,
      follow these instructions to configure your AWS credentials and try again:
      http://docs.aws.amazon.com/AWSEC2/latest/CommandLineReference/set-up-ec2-cli-linux.html
    TEXT
  rescue Aws::S3::Errors::InvalidAccessKeyId
    credentials_missing = true
    credentials_msg = <<-TEXT.gsub(/^\s+/, '').chomp
      Aws::S3::Errors::InvalidAccessKeyId: Make sure your AWS credentials are set in your locals.yml.
      If you don't have AWS credentials, follow these instructions to configure your AWS credentials and try again:
      http://docs.aws.amazon.com/AWSEC2/latest/CommandLineReference/set-up-ec2-cli-linux.html
    TEXT
  ensure
    flunk credentials_msg if credentials_missing
  end

end
