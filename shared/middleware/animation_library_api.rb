require 'aws-sdk-s3'
require 'cdo/rack/request'
require 'sinatra/base'
require 'cdo/sinatra'
require 'cdo/aws/s3'

ANIMATION_LIBRARY_BUCKET = 'cdo-animation-library'.freeze
SPRITELAB_ANIMATION_LIBRARY_BUCKET = 'cdo-spritelab-animation-library'.freeze

#
# Provides limited access to the cdo-animation-library S3 bucket, which contains
# Code.org-curated content, not user content.  For user content see the
# v3/animations api (part of FilesApi).
#
# See also the Animation Library Tech Spec (requires login):
# https://docs.google.com/document/d/18-LVuvKd0jKTUiGo5GYReUWM5oFWCyKRyEQURJ5HCOM/edit#
#
class AnimationLibraryApi < Sinatra::Base
  helpers do
    load(CDO.dir('shared', 'middleware', 'helpers', 'core.rb'))
  end

  #
  # GET /api/v1/animation-library/<version-id>/<filename>
  #
  # Retrieve a file from the animation library
  #
  get %r{/api/v1/(spritelab-)?animation-library/([^/]+)/(.+)} do |endpoint, version_id, animation_name|
    not_found if version_id.empty? || animation_name.empty?
    bucket = (endpoint == 'spritelab-') ? SPRITELAB_ANIMATION_LIBRARY_BUCKET : ANIMATION_LIBRARY_BUCKET
    begin
      result = Aws::S3::Bucket.
        new(bucket, client: AWS::S3.create_client).
        object(animation_name).
        get(version_id: version_id)
      content_type result.content_type
      cache_for 3600
      result.body
    rescue
      not_found
    end
  end
end
