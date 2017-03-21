require 'aws-sdk'
require 'cdo/rack/request'
require 'sinatra/base'
require 'cdo/sinatra'

SOUND_LIBRARY_BUCKET = 'cdo-sound-library'.freeze

#
# Provides limited access to the cdo-sound-library S3 bucket, which contains
# Code.org-curated content, not user content.  For user content see the
# v3/assets api.
#
# See also the Sound Library Tech Spec (requires login):
# https://docs.google.com/document/d/1Oj--H-xwrK3u4A0L5ML73n8XDutsH5n2i8caGRc3NL8/edit
#
class SoundLibraryApi < Sinatra::Base
  #
  # GET /api/v1/sound-library/<filename>
  #
  # Retrieve a file from the sound library
  #
  get %r{/api/v1/sound-library/(.+)} do |sound_name|
    not_found if sound_name.empty?

    begin
      result = Aws::S3::Bucket.
        new(SOUND_LIBRARY_BUCKET).
        object(sound_name).
        get
      content_type result.content_type
      cache_for 3600
      result.body
    rescue
      not_found
    end
  end
end
