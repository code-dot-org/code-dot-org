require 'cdo/github'
require 'cdo/test_server_status'

post '/api/dev/set-last-dtt-green' do
  forbidden! unless rack_env == :test
  dont_cache
  forbidden! unless params[:token] == CDO.slack_set_last_dtt_green_token
  TestServerStatus.mark_green GitHub.sha('test')
end
