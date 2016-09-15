require 'aws-sdk'
require 'cdo/rack/request'
require 'sinatra/base'
require 'cdo/sinatra'

ANIMATION_LIBRARY_BUCKET = 'cdo-animation-library'

#
# Provides limited access to the cdo-animation-library S3 bucket, which contains
# Code.org-curated content, not user content.  For user content see the
# v3/animations api (part of FilesApi).
#
# See also the Animation Library Tech Spec (requires login):
# https://docs.google.com/document/d/18-LVuvKd0jKTUiGo5GYReUWM5oFWCyKRyEQURJ5HCOM/edit#
#
class AnimationLibraryApi < Sinatra::Base
  #
  # GET /api/v1/animation-library/<version-id>/<filename>
  #
  # Retrieve a file from the animation library
  #
  get %r{/api/v1/animation-library/([^/]+)/([^/]+)} do |version_id, animation_name|
    not_found if version_id.empty? || animation_name.empty?

    begin
      result = Aws::S3::Bucket.
        new(ANIMATION_LIBRARY_BUCKET).
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
