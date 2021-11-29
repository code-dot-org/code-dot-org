require 'cdo/aws/s3'

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
  end

  def copy_sources
    src = "#{CDO.sources_s3_bucket}/#{CDO.sources_s3_directory}/#{@storage_id}/#{@storage_app_id}/main.json"
    dest = "#{@session_id}/sources/main.json"
    copy_object src, dest
  end

  def copy_assets
    src_prefix = "#{CDO.assets_s3_directory}/#{@storage_id}/#{@storage_app_id}/"
    s3.list_objects(bucket: CDO.assets_s3_bucket, prefix: src_prefix).contents.map do |fileinfo|
      filename = %r{#{src_prefix}(.+)$}.match(fileinfo.key)[1]
      src = "#{CDO.assets_s3_bucket}/#{src_prefix}#{filename}"
      dest = "#{@session_id}/assets/#{filename}"
      copy_object src, dest
    end
  end

  def copy_starter_assets
    (@level&.project_template_level&.starter_assets || @level.starter_assets || []).map do |friendly_name, uuid_name|
      src = "#{CDO.assets_s3_bucket}/starter_assets/#{uuid_name}"
      dest = "#{@session_id}/assets/#{friendly_name}"
      copy_object src, dest
    end
  end

  def copy_maze
    serialized_maze = @level.try(:get_serialized_maze)
    return unless serialized_maze
    key = "#{@session_id}/sources/grid.txt"
    puts "\nUploading object to Javabuilder\n"
    p key
    response = s3.put_object(bucket: "cdo-dev-javabuilder-sanchit-output", acl: "bucket-owner-read", key: key, body: serialized_maze.to_json)
    p response
  rescue StandardError => e
    puts "Error: #{e.message}"
  end

  def copy_object(src, dest)
    puts "\nCopying object to Javabuilder\n"
    p src
    p dest
    response = s3.copy_object(bucket: "cdo-dev-javabuilder-sanchit-output", acl: "bucket-owner-read", key: dest, copy_source: src, metadata_directive: 'REPLACE')
    p response
  rescue StandardError => e
    puts "Error: #{e.message}"
  end
end
