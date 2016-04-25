#
# BucketHelper
#
class BucketHelper

  def initialize(bucket, base_dir)
    @bucket = bucket
    @base_dir = base_dir

    @s3 = Aws::S3::Client.new
  end

  def allowed_file_type?(extension)
    allowed_file_types.include? extension.downcase
  end

  def allowed_file_types
    []
  end

  # Ignore client-specified mime type. Infer it from file extension when serving
  # assets.
  def category_from_file_type(extension)
    mime_type = Sinatra::Base.mime_type(extension)
    if mime_type == 'application/pdf'
      'pdf'
    else
      mime_type.split('/').first
    end
  end

  # How long an object retrieved from this bucket should be cached
  def cache_duration_seconds
    0
  end

  def app_size(encrypted_channel_id)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    prefix = s3_path owner_id, channel_id
    @s3.list_objects(bucket: @bucket, prefix: prefix).contents.map(&:size).reduce(:+).to_i
  end

  #
  # Retrieve the total asset size of an app and the size of an individual object
  # within that app with a single S3 request.
  #
  # @param [String] encrypted_channel_id - Token identifying app channel to read.
  # @param [String] target_object - S3 key relative to channel of the single
  #                 object whose size we should return.
  # @return [[Int, Int]] size of target_object and size of entire app
  def object_and_app_size(encrypted_channel_id, target_object)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)

    app_prefix = s3_path owner_id, channel_id
    target_object_prefix = s3_path owner_id, channel_id, target_object

    objects = @s3.list_objects(bucket: @bucket, prefix: app_prefix).contents
    target_object = objects.find { |x| x.key == target_object_prefix }

    app_size = objects.map(&:size).reduce(:+).to_i
    object_size = target_object.nil? ? nil : target_object.size.to_i

    [object_size, app_size]
  end

  def list(encrypted_channel_id)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    prefix = s3_path owner_id, channel_id
    @s3.list_objects(bucket: @bucket, prefix: prefix).contents.map do |fileinfo|
      filename = %r{#{prefix}(.+)$}.match(fileinfo.key)[1]
      category = category_from_file_type(File.extname(filename))

      {filename: filename, category: category, size: fileinfo.size}
    end
  end

  def get(encrypted_channel_id, filename, if_modified_since = nil, version = nil)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename
    begin
      s3_object = @s3.get_object(bucket: @bucket, key: key, if_modified_since: if_modified_since, version_id: version)
      {status: 'FOUND', body: s3_object.body, last_modified: s3_object.last_modified, metadata: s3_object.metadata}
    rescue Aws::S3::Errors::NotModified
      {status: 'NOT_MODIFIED'}
    rescue Aws::S3::Errors::NoSuchKey
      {status: 'NOT_FOUND'}
    end
  end

  def get_abuse_score(encrypted_channel_id, filename, version = nil)
    response = get(encrypted_channel_id, filename, nil, version)
    if response.nil?
      0
    else
      metadata = response[:metadata]
      [metadata['abuse_score'].to_i, metadata['abuse-score'].to_i].max
    end
  end

  def copy_files(src_channel, dest_channel)
    src_owner_id, src_channel_id = storage_decrypt_channel_id(src_channel)
    dest_owner_id, dest_channel_id = storage_decrypt_channel_id(dest_channel)

    src_prefix = s3_path src_owner_id, src_channel_id
    @s3.list_objects(bucket: @bucket, prefix: src_prefix).contents.map do |fileinfo|
      filename = %r{#{src_prefix}(.+)$}.match(fileinfo.key)[1]
      mime_type = Sinatra::Base.mime_type(File.extname(filename))
      category = mime_type.split('/').first  # e.g. 'image' or 'audio'

      src = "#{@bucket}/#{src_prefix}#{filename}"
      dest = s3_path dest_owner_id, dest_channel_id, filename
      @s3.copy_object(bucket: @bucket, key: dest, copy_source: URI.encode(src), metadata_directive: 'REPLACE')

      {filename: filename, category: category, size: fileinfo.size}
    end
  end

  def replace_abuse_score(encrypted_channel_id, filename, abuse_score)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename

    @s3.copy_object(bucket: @bucket, copy_source: URI.encode("#{@bucket}/#{key}"), key: key, metadata: { abuse_score: abuse_score.to_s}, metadata_directive: 'REPLACE')
  end

  def create_or_replace(encrypted_channel_id, filename, body, version = nil, abuse_score = 0)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)

    key = s3_path owner_id, channel_id, filename
    response = @s3.put_object(bucket: @bucket, key: key, body: body, metadata: { abuse_score: abuse_score.to_s})

    # Delete the old version, if doing an in-place replace
    @s3.delete_object(bucket: @bucket, key: key, version_id: version) if version

    response
  end

  #
  # Copy an object within a channel, creating a new object in the channel.
  #
  # @param [String] encrypted_channel_id - App-identifying token
  # @param [String] filename - Destination name for new object
  # @param [String] source_filename - Name of object to be copied
  # @param [Hash] S3 response from copy operation
  def copy(encrypted_channel_id, filename, source_filename)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)

    key = s3_path owner_id, channel_id, filename
    copy_source = @bucket + '/' + s3_path(owner_id, channel_id, source_filename)
    @s3.copy_object(bucket: @bucket, key: key, copy_source: copy_source)

    # TODO: (bbuchanan) Handle abuse_score metadata for animations.
    # When copying an object, should also copy its abuse_score metadata.
    # https://www.pivotaltracker.com/story/show/117949241
  end

  def delete(encrypted_channel_id, filename)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename

    @s3.delete_object(bucket: @bucket, key: key)
  end

  def list_versions(encrypted_channel_id, filename)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename

    @s3.list_object_versions(bucket: @bucket, prefix: key).versions.map do |version|
      {
        versionId: version.version_id,
        lastModified: version.last_modified,
        isLatest: version.is_latest
      }
    end
  end

  # Copies the given version of the file to make it the current revision.
  # (All intermediate versions are preserved.)
  def restore_previous_version(encrypted_channel_id, filename, version_id)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename

    @s3.copy_object(bucket: @bucket, key: key, copy_source: "#{@bucket}/#{key}?versionId=#{version_id}")
  end

  protected

  def s3_path(owner_id, channel_id, filename = nil)
    "#{@base_dir}/#{owner_id}/#{channel_id}/#{filename}"
  end
end
