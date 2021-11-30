require 'cdo/aws/s3'
require "net/http"

#
# JavabuilderBucket
#
class JavabuilderBucket
  cattr_accessor :s3

  def initialize(storage_id, storage_app_id, level_id, session_id)
    @storage_id = storage_id
    @storage_app_id = storage_app_id
    @session_id = session_id
    @level = Level.find(level_id)

    self.s3 ||= AWS::S3.create_client
  end

  def copy_all_content
    copy_sources
    copy_assets
    copy_starter_assets
    copy_maze
  end

  def copy_sources
    src_bucket = CDO.sources_s3_bucket
    src_key = "#{CDO.sources_s3_directory}/#{@storage_id}/#{@storage_app_id}/main.json"
    dest = "#{@session_id}/sources/main.json"
    copy_object src_bucket, src_key, dest
  end

  def copy_assets
    src_prefix = "#{CDO.assets_s3_directory}/#{@storage_id}/#{@storage_app_id}/"
    s3.list_objects(bucket: CDO.assets_s3_bucket, prefix: src_prefix).contents.map do |fileinfo|
      filename = %r{#{src_prefix}(.+)$}.match(fileinfo.key)[1]
      src_bucket = CDO.assets_s3_bucket
      src_key = "#{src_prefix}#{filename}"
      dest = "#{@session_id}/assets/#{filename}"
      copy_object src_bucket, src_key, dest
    end
  end

  def copy_starter_assets
    (@level&.project_template_level&.starter_assets || @level.starter_assets || []).map do |friendly_name, uuid_name|
      src_bucket = CDO.assets_s3_bucket
      src_key = "starter_assets/#{uuid_name}"
      dest = "#{@session_id}/assets/#{friendly_name}"
      copy_object src_bucket, src_key, dest
    end
  end

  def copy_maze
    serialized_maze = @level.try(:get_serialized_maze)
    return unless serialized_maze
    dest = "#{@session_id}/sources/grid.txt"
    upload_object serialized_maze.to_json, dest
  end

  def copy_object(src_bucket, src_key, dest)
    puts "\nCopying object to Javabuilder\n"
    p src_bucket
    p src_key
    p dest

    if local?
      object = s3.get_object(bucket: src_bucket, key: src_key)
      upload_object object.body.read.to_json, dest

      # uri = URI.parse("http://localhost:8080/#{dest}")

      # request = Net::HTTP::Post.new(uri)
      # request.body = object.body.read.to_json

      # http = Net::HTTP.new(uri.host, uri.port)
      # response = http.request(request)

      # p response
    else
      src = "#{src_bucket}/#{src_key}"
      response = s3.copy_object(bucket: "cdo-dev-javabuilder-sanchit-output", acl: "bucket-owner-read", key: dest, copy_source: src, metadata_directive: 'REPLACE')
      p response
    end
  rescue StandardError => e
    puts "Error: #{e.message}"
  end

  def upload_object(body, dest)
    puts "\nUploading object to Javabuilder\n"
    p dest

    if local?
      uri = URI.parse("http://localhost:8080/javabuilderfiles/#{dest}")

      request = Net::HTTP::Post.new(uri)
      request.body = body

      http = Net::HTTP.new(uri.host, uri.port)
      response = http.request(request)

      p response
    else
      response = s3.put_object(bucket: "cdo-dev-javabuilder-sanchit-output", acl: "bucket-owner-read", key: dest, body: body)
      p response
    end
  rescue StandardError => e
    puts "Error: #{e.message}"
  end

  def local?
    return true
  end
end
