require 'aws-sdk-s3'
require 'cdo/rack/request'
require 'sinatra/base'
require 'cdo/sinatra'
require 'cdo/aws/s3'
require 'cdo/png_utils'

ANIMATION_LIBRARY_BUCKET = 'cdo-animation-library'.freeze
ANIMATION_DEFAULT_MANIFEST_JSON_LEVELBUILDER = 'animation-manifests/manifests-levelbuilder/defaultSprites.json'.freeze
ANIMATION_DEFAULT_MANIFEST_JSON = 'animation-manifests/manifests/defaultSprites.json'.freeze

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
  # GET /api/v1/animation-library/level_animations/<version-id>/<filename>
  # Retrieve an animation that was uploaded by a levelbuilder (for use in level start_animations)
  #
  get %r{/api/v1/animation-library/level_animations/([^/]+)/(.+)} do |version_id, animation_name|
    not_found if version_id.empty? || animation_name.empty?

    begin
      result = Aws::S3::Bucket.
               new(ANIMATION_LIBRARY_BUCKET, client: AWS::S3.create_client).
               object("level_animations/#{animation_name}").
               get(version_id: version_id)
      content_type result.content_type
      cache_for 3600
      result.body
    rescue
      not_found
    end
  end

  #
  # GET /api/v1/animation-library/level_animations/<version-id>/<filename>
  # Retrieve an animation that was uploaded by a levelbuilder (for use in level start_animations)
  #
  get %r{/api/v1/animation-library/level_animations/(.+)} do |animation_name|
    not_found if animation_name.empty?

    begin
      result = Aws::S3::Bucket.
               new(ANIMATION_LIBRARY_BUCKET, client: AWS::S3.create_client).
               object("level_animations/#{animation_name}").
               get
      content_type result.content_type
      cache_for 3600
      result.body
    rescue
      not_found
    end
  end

  #
  # POST /api/v1/animation-library/level_animations/<filename>
  # Create Sprite in Level Animations folder
  #
  post %r{/api/v1/animation-library/level_animations/(.+)} do |animation_name|
    dont_cache
    if request.content_type == 'image/png' || request.content_type == 'application/json'
      body = request.body
      key = "level_animations/#{animation_name}"

      Aws::S3::Bucket.new(ANIMATION_LIBRARY_BUCKET).put_object(key: key, body: body, content_type: request.content_type)
    else
      bad_request
    end
  end

  #
  # POST /api/v1/animation-library/spritelab/<category>/<filename>
  # Create Sprite in SpriteLab animations folder in the specified category
  #
  post %r{/api/v1/animation-library/spritelab/([^/]+)/(.+)} do |category, animation_name|
    dont_cache
    if request.content_type == 'image/png' || request.content_type == 'application/json'
      body = request.body
      key = "spritelab/#{category}/#{animation_name}"

      Aws::S3::Bucket.new(ANIMATION_LIBRARY_BUCKET).put_object(key: key, body: body, content_type: request.content_type)
    else
      bad_request
    end
  end

  #
  # GET /api/v1/animation-library/(spritelab|gamelab)/<version-id>/<filename>
  #
  # Retrieve a file from the animation library for the given app type
  #
  get %r{/api/v1/animation-library/(spritelab|gamelab)/([^/]+)/(.+)} do |app_type, version_id, animation_name|
    not_found if version_id.empty? || animation_name.empty?

    begin
      result = Aws::S3::Bucket.
               new(ANIMATION_LIBRARY_BUCKET, client: AWS::S3.create_client).
               object("#{app_type}/#{animation_name}").
               get(version_id: version_id)
      content_type result.content_type
      cache_for 3600
      result.body
    rescue
      not_found
    end
  end

  #
  # GET /api/v1/animation-library/manifest/spritelab/<locale>
  #
  # Retrieve the manifest from S3. The locale should be in the form xx_xx
  get %r{/api/v1/animation-library/manifest/(spritelab|gamelab)/(.+)} do |app_type, locale|
    manifest_filename = (app_type == 'spritelab') ? 'spritelabCostumeLibrary' : 'gamelabAnimationLibrary'
    manifest_extension = (app_type == 'spritelab' && locale != 'en_us') ? "#{locale}.json" : 'json'
    result = Aws::S3::Bucket.
             new(ANIMATION_LIBRARY_BUCKET, client: AWS::S3.create_client).
             object("animation-manifests/manifests/#{manifest_filename}.#{manifest_extension}").
             get
    content_type result.content_type
    cache_for 3600
    result.body
  rescue
    not_found
  end

  #
  # GET /api/v1/animation-library/level-animations-files/
  #
  # Retrieve file objects from the level-animations bucket
  # File objects contains: key, last_modified, version_id, and source_size and
  # are accessed with animation_name and extension
  get %r{/api/v1/animation-library/level-animations-files} do
    animations_by_name = {}
    prefix = 'level_animations'
    bucket = Aws::S3::Bucket.new(ANIMATION_LIBRARY_BUCKET)
    bucket.objects({prefix: prefix}).each do |object_summary|
      animation_name = object_summary.key[/level_animations[^.]+/]
      extension = object_summary.key[/(?<=\.)\w+$/]
      next if extension.nil? # Skip 'directory' objects

      # Push into animations collection if unique
      animations_by_name[animation_name] ||= {}
      next unless animations_by_name[animation_name][extension].nil?
      # Populate sourceSize if not already present
      calculated_source_size = {}
      if extension == 'png'
        png_body = object_summary.object.get.body.read
        calculated_source_size = PngUtils.dimensions_from_png(png_body)
      end
      animations_by_name[animation_name][extension] = {key: object_summary.key, last_modified: object_summary.last_modified, version_id: object_summary.object.version_id, source_size: calculated_source_size}
    end
    animations_by_name.to_json
  end

  #
  # GET /api/v1/animation-library/default-spritelab-metadata/(levelbuilder|production)
  #
  # Retrieve the metadata for the default sprite list from S3
  get %r{/api/v1/animation-library/default-spritelab-metadata/(levelbuilder|production)} do |env|
    case env
    when 'production'
      env_path = ANIMATION_DEFAULT_MANIFEST_JSON
    when 'levelbuilder'
      env_path = ANIMATION_DEFAULT_MANIFEST_JSON_LEVELBUILDER
    else
      bad_request
    end

    result = Aws::S3::Bucket.
             new(ANIMATION_LIBRARY_BUCKET, client: AWS::S3.create_client).
             object(env_path).
             get
    content_type 'application/json'
    cache_for 3600
    result.body
  rescue
    not_found
  end

  #
  # POST /api/v1/animation-library/default-spritelab-metadata/(levelbuilder|production)
  #
  # Update default sprite JSON in S3 for the given environment
  post %r{/api/v1/animation-library/default-spritelab-metadata/(levelbuilder|production)} do |env|
    dont_cache
    if request.content_type == 'application/json'
      body = request.body.string
      case env
      when 'production'
        key = ANIMATION_DEFAULT_MANIFEST_JSON
      when 'levelbuilder'
        key = ANIMATION_DEFAULT_MANIFEST_JSON_LEVELBUILDER
      else
        bad_request
      end

      Aws::S3::Bucket.new(ANIMATION_LIBRARY_BUCKET).put_object(key: key, body: body, content_type: request.content_type)
    else
      bad_request
    end
  end

  #
  # Legacy animation API, but do not delete, because old Gamelab and Spritelab projects will still
  # have animations that use this api.
  # GET /api/v1/animation-library/<version-id>/<filename>
  #
  # Retrieve a file from the animation library
  #
  get %r{/api/v1/animation-library/([^/]+)/(.+)} do |version_id, animation_name|
    not_found if version_id.empty? || animation_name.empty?

    begin
      result = Aws::S3::Bucket.
               new(ANIMATION_LIBRARY_BUCKET, client: AWS::S3.create_client).
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
