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

  def get_object(filename, body = '', headers = {})
    get "/v3/#{@endpoint}/#{@channel_id}/#{filename}", body, headers
    last_response.body
  end

end
