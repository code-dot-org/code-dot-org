#!/usr/bin/env ruby
require '../../lib/cdo/aws/cloudfront'
require 'google/apis/admin_directory_v1'
require 'google/apis/people_v1'
puts "Hello"
GOOGLE_AUTH_SCOPES = [
  #  Google::Apis::AdminDirectoryV1::AUTH_ADMIN_DIRECTORY_USER_READONLY,
  Google::Apis::PeopleV1::AUTH_USERINFO_EMAIL
].freeze
def query_google
  at = access_token
  client = Signet::OAuth2::Client.new(
    authorization_uri: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_credential_uri:  'https://www.googleapis.com/oauth2/v3/token',
    #    client_id: '254945981659-ja8778g59gel8tqgfhbhsjo5afsn63nm.apps.googleusercontent.com',
    client_id: '254945981659-vt4e8n3if87iu9qgc4kar921lhnp3pad.apps.googleusercontent.com',
    client_secret: '3q1SUWFlvahXZVittWASeNdH',
    refresh_token: 'test',
    access_token: at,
    #expires_at: tokens[:oauth_token_expiration],
    scope: GOOGLE_AUTH_SCOPES,
    additional_parameters: {
      "access_type" => "offline",
      "include_granted_scopes" => "true"
    }
  )
  #service = Google::Apis::AdminDirectoryV1::DirectoryService.new
  service = Google::Apis::PeopleV1::PeopleServiceService.new
  service.authorization = client
  begin
    yield service
  rescue Google::Apis::ClientError, Google::Apis::AuthorizationError => error
    puts "WTF"
    puts error.to_json
  end
end

def access_token
  url = "https://oauth2.googleapis.com/token".freeze
  # p.s. TOKEN_CREDENTIAL_URI = 'https://www.googleapis.com/oauth2/v4/token'
  _, response = Request.post(
    url,
    payload: {
      "client_id": '254945981659-vt4e8n3if87iu9qgc4kar921lhnp3pad.apps.googleusercontent.com',
      "client_secret": '3q1SUWFlvahXZVittWASeNdH',
      "refresh_token": 'test',
      "grant_type": "refresh_token"
    }
  )
  response['access_token']
end

def main
  query_google do |service|
    response = service.get_people
    puts response.to_json
    render json: response.to_h
  end
end
main
