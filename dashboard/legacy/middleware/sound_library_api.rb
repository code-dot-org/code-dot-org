require 'aws-sdk-s3'
require 'cdo/rack/request'
require 'sinatra/base'
require 'cdo/sinatra'
require 'cdo/aws/s3'

SOUND_LIBRARY_BUCKET = 'cdo-sound-library'.freeze
RESTRICTED_BUCKET = 'cdo-restricted'.freeze

#
# Provides limited access to the cdo-sound-library S3 bucket, which contains
# Code.org-curated content, not user content.  For user content see the
# v3/assets api.
#
# See also the Sound Library Tech Spec (requires login):
# https://docs.google.com/document/d/1Oj--H-xwrK3u4A0L5ML73n8XDutsH5n2i8caGRc3NL8/edit
#
class SoundLibraryApi < Sinatra::Base
  helpers do
    load(CDO.dir('shared', 'middleware', 'helpers', 'core.rb'))
  end

  #
  # GET /api/v1/sound-library/<filename>
  #
  # Retrieve a file from the sound library
  #
  get %r{/api/v1/sound-library/(.+)} do |sound_name|
    not_found if sound_name.empty?

    begin
      result = Aws::S3::Bucket.
        new(SOUND_LIBRARY_BUCKET, client: AWS::S3.create_client).
        object_versions(prefix: sound_name).
        find {|version| !version.head.delete_marker}.
        get
      content_type result.content_type
      cache_for 3600
      result.body
    rescue
      not_found
    end
  end

  #
  # GET /restricted/<filename>
  #
  # Retrieve a file from the restricted sound library, but only in development
  # or CI test environments. Requester must have a signed cloudfront cookie.
  #
  get %r{/restricted/(.+)} do |sound_name|
    not_found if sound_name.empty?

    unless rack_env?(:development) || (rack_env?(:test) && ENV.fetch('CI', nil))
      raise "unexpected access to /restricted/ route in non-dev, non-CI environment"
    end

    forbidden unless has_signed_cookie?

    begin
      s3 = AWS::S3.create_client
      result = s3.get_object(
        bucket: RESTRICTED_BUCKET,
        key: "restricted/#{sound_name}"
      )
      content_type result.content_type
      cache_for 3600
      result.body
    rescue
      not_found
    end
  end

  # Return whether cloudfront policy cookie is present and has not yet expired.
  # This cookie is set in api_controller#sign_cookies. For more background, see:
  # https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-setting-signed-cookie-custom-policy.html
  def has_signed_cookie?
    encoded_policy = request.cookies['CloudFront-Policy'].to_s
    return false unless encoded_policy && !encoded_policy.empty?
    policy_json = Base64.decode64(encoded_policy.tr('-_~', '+=/'))
    return false unless policy_json
    policy = JSON.parse(policy_json)
    expiration_time = policy['Statement'][0]['Condition']['DateLessThan']['AWS:EpochTime']
    return Time.now.tv_sec < expiration_time
  end
end
