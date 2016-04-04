# For a Sinatra or a Rails 3 app:
require 'oauth/request_proxy/rack_request'

# You also need to explicitly enable OAuth 1 support in the environment.rb
# or an initializer:
OAUTH_10_SUPPORT = true
