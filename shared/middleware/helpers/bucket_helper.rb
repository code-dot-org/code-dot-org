require 'addressable'
require 'active_support/core_ext/object/try'
require 'active_support/core_ext/module/attribute_accessors'
require 'cdo/aws/s3'
require 'honeybadger'
require 'cdo/firehose'

#
# BucketHelper
#
class BucketHelper
  cattr_accessor :s3

  def initialize(bucket, base_dir)
    @bucket = bucket
    @base_dir = base_dir

    self.s3 ||= AWS::S3.create_client
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
    elsif ['.doc', '.docx'].include? extension
      'doc'
    else
      mime_type.try(:split, '/').try(:first)
    end
  end

  # How long an object retrieved from this bucket should be cached
  def cache_duration_seconds
    0
  end

  def app_size(encrypted_channel_id)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    prefix = s3_path owner_id, channel_id
    s3.list_objects(bucket: @bucket, prefix: prefix).contents.map(&:size).reduce(:+).to_i
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

    objects = s3.list_objects(bucket: @bucket, prefix: app_prefix).contents
    target_object = objects.find {|x| x.key == target_object_prefix}

    app_size = objects.map(&:size).reduce(:+).to_i
    object_size = target_object.nil? ? nil : target_object.size.to_i

    [object_size, app_size]
  end

  def list(encrypted_channel_id)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    prefix = s3_path owner_id, channel_id
    s3.list_objects(bucket: @bucket, prefix: prefix).contents.map do |fileinfo|
      filename = %r{#{prefix}(.+)$}.match(fileinfo.key)[1]
      category = category_from_file_type(File.extname(filename))

      {filename: filename, category: category, size: fileinfo.size}
    end
  end

  def get(encrypted_channel_id, filename, if_modified_since = nil, version = nil)
    begin
      owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return {status: 'NOT_FOUND'}
    end
    key = s3_path owner_id, channel_id, filename
    begin
      s3_object = s3_get_object(key, if_modified_since, version)
      {status: 'FOUND', body: s3_object.body, version_id: s3_object.version_id, last_modified: s3_object.last_modified, metadata: s3_object.metadata}
    rescue Aws::S3::Errors::NotModified
      {status: 'NOT_MODIFIED'}
    rescue Aws::S3::Errors::NoSuchKey
      {status: 'NOT_FOUND'}
    rescue Aws::S3::Errors::NoSuchVersion
      {status: 'NOT_FOUND'}
    rescue Aws::S3::Errors::InvalidArgument
      # Can happen when passed an invalid S3 version id
      {status: 'NOT_FOUND'}
    end
  end

  def get_abuse_score(encrypted_channel_id, filename, version = nil)
    response = get(encrypted_channel_id, filename, nil, version)
    if response.nil? || response[:status] == 'NOT_FOUND'
      0
    else
      metadata = response[:metadata]
      [metadata['abuse_score'].to_i, metadata['abuse-score'].to_i].max
    end
  end

  def copy_files(src_channel, dest_channel, options={})
    src_owner_id, src_channel_id = storage_decrypt_channel_id(src_channel)
    dest_owner_id, dest_channel_id = storage_decrypt_channel_id(dest_channel)

    src_prefix = s3_path src_owner_id, src_channel_id
    result = s3.list_objects(bucket: @bucket, prefix: src_prefix).contents.map do |fileinfo|
      filename = %r{#{src_prefix}(.+)$}.match(fileinfo.key)[1]
      next unless (!options[:filenames] && (!options[:exclude_filenames] || !options[:exclude_filenames].include?(filename))) || options[:filenames].try(:include?, filename)
      mime_type = Sinatra::Base.mime_type(File.extname(filename))
      category = mime_type.split('/').first  # e.g. 'image' or 'audio'

      src = "#{@bucket}/#{src_prefix}#{filename}"
      dest = s3_path dest_owner_id, dest_channel_id, filename

      # Temporary: Add additional context to exceptions reported here, to help
      # diagnose a recurring issue where we pass a bad copy_source to the S3
      # API on remix.
      # https://app.honeybadger.io/projects/3240/faults/35329035/8aba7532-c087-11e7-8280-13b5745130ae
      Honeybadger.context(
        {
          copy_source: URI.encode(src),
          copy_dest_bucket: @bucket,
          copy_dest_key: dest
        }
      )
      response = s3.copy_object(bucket: @bucket, key: dest, copy_source: URI.encode(src), metadata_directive: 'REPLACE')

      {filename: filename, category: category, size: fileinfo.size, versionId: response.version_id}
    end
    result.compact
  end

  def restore_file_version(encrypted_channel_id, filename, version)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename

    s3.copy_object(bucket: @bucket, copy_source: URI.encode("#{@bucket}/#{key}?versionId=#{version}"), key: key, metadata_directive: 'REPLACE')
  end

  def replace_abuse_score(encrypted_channel_id, filename, abuse_score)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename

    s3.copy_object(bucket: @bucket, copy_source: URI.encode("#{@bucket}/#{key}"), key: key, metadata: {abuse_score: abuse_score.to_s}, metadata_directive: 'REPLACE')
  end

  def create_or_replace(encrypted_channel_id, filename, body, version = nil, abuse_score = 0)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)

    key = s3_path owner_id, channel_id, filename
    response = s3.put_object(bucket: @bucket, key: key, body: body, metadata: {abuse_score: abuse_score.to_s})

    # Delete the old version, if doing an in-place replace
    s3.delete_object(bucket: @bucket, key: key, version_id: version) if version

    response
  end

  def check_current_version(encrypted_channel_id, filename, version_to_replace, timestamp, tab_id, user_id)
    return unless filename == 'main.json' && @bucket == CDO.sources_s3_bucket && version_to_replace

    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename

    # check current version id without pulling down the whole object.
    current_version = s3.get_object_tagging(bucket: @bucket, key: key).version_id

    return if version_to_replace == current_version

    FirehoseClient.instance.put_record(
      study: 'project-data-integrity',
      study_group: 'v3',
      event: 'replace-non-current-main-json',

      project_id: encrypted_channel_id,
      user_id: user_id,

      data_json: {
        replacedVersionId: version_to_replace,
        currentVersionId: current_version,
        tabId: tab_id,
        key: key,

        # Server timestamp indicating when the first version of main.json was saved by the browser
        # tab making this request. This is for diagnosing problems with writes from multiple browser
        # tabs.
        firstSaveTimestamp: timestamp
      }.to_json
    )
  rescue Aws::S3::Errors::NoSuchKey
    # Because create and update operations are both handled as PUT OBJECT,
    # we sometimes call this helper when we're creating a new object and there's
    # no existing object to check against.  In such a case we can be confident
    # that we're not replacing a non-current version so no logging needs to
    # occur - we can ignore this exception.
  end

  #
  # Copy an object within a channel, creating a new object in the channel.
  #
  # @param [String] encrypted_channel_id - App-identifying token
  # @param [String] filename - Destination name for new object
  # @param [String] source_filename - Name of object to be copied
  # @param [String] version - Version of destination object to replace
  # @return [Hash] S3 response from copy operation
  def copy(encrypted_channel_id, filename, source_filename, version = nil)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)

    key = s3_path owner_id, channel_id, filename
    copy_source = @bucket + '/' + s3_path(owner_id, channel_id, source_filename)
    response = s3.copy_object(bucket: @bucket, key: key, copy_source: copy_source)

    # TODO: (bbuchanan) Handle abuse_score metadata for animations.
    # When copying an object, should also copy its abuse_score metadata.
    # https://www.pivotaltracker.com/story/show/117949241

    # Delete the old version, if doing an in-place replace
    s3.delete_object(bucket: @bucket, key: key, version_id: version) if version

    response
  end

  def delete(encrypted_channel_id, filename)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename

    s3.delete_object(bucket: @bucket, key: key)
  end

  def delete_multiple(encrypted_channel_id, filenames)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    objects = filenames.map {|filename| {key: s3_path(owner_id, channel_id, filename)}}

    s3.delete_objects(bucket: @bucket, delete: {objects: objects, quiet: true})
  end

  def list_versions(encrypted_channel_id, filename)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename

    s3.list_object_versions(bucket: @bucket, prefix: key).versions.map do |version|
      {
        versionId: version.version_id,
        lastModified: version.last_modified,
        isLatest: version.is_latest
      }
    end
  end

  # Copies the given version of the file to make it the current revision.
  # (All intermediate versions are preserved.)
  def restore_previous_version(encrypted_channel_id, filename, version_id, user_id)
    owner_id, channel_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, channel_id, filename

    version_restored = false

    unless version_id.nil? || version_id.empty?
      begin
        response = s3.copy_object(
          bucket: @bucket,
          key: key,
          copy_source: "#{@bucket}/#{key}?versionId=#{version_id}"
        )
        version_restored = true
      rescue Aws::S3::Errors::NoSuchVersion
        # Do nothing - we'll attempt the fallback below.
      rescue Aws::S3::Errors::InvalidArgument => err
        # On invalid version, try the fallback - otherwise reraise.
        raise unless invalid_version_id?(err)
      end
    end

    # Try restoring the latest version
    unless version_restored
      if object_exists?(key)
        response = s3.copy_object(
          bucket: @bucket,
          key: key,
          copy_source: "#{@bucket}/#{key}",
          metadata_directive: 'REPLACE',
          metadata: {
            abuse_score: get_abuse_score(encrypted_channel_id, filename).to_s,
            failed_restore_at: Time.now.to_s,
            failed_restore_from_version: version_id || ''
          }
        )
        version_restored = true
        Honeybadger.notify(
          error_class: "#{self.class.name}Warning",
          error_message: "Restore at Specified Version Failed. Restored most recent.",
          context: {
            source: "#{@bucket}/#{key}?versionId=#{version_id}"
          }
        )
      else
        # Couldn't restore specific version and didn't find a latest version either.
        # It is probably deleted.
        # In this case, we want to do nothing.
        response = {status: 'NOT_MODIFIED'}
        Honeybadger.notify(
          error_class: "#{self.class.name}Warning",
          error_message: "Restore at Specified Version Failed on deleted object. No action taken.",
          context: {
            source: "#{@bucket}/#{key}?versionId=#{version_id}"
          }
        )
      end
    end

    if version_restored
      # If we get this far, the restore request has succeeded.
      log_restored_file(
        project_id: encrypted_channel_id,
        user_id: user_id,
        filename: filename,
        source_version_id: version_id,
        new_version_id: response.version_id
      )
    end

    response.to_h
  end

  protected

  #
  # Check if the given error indicates a badly-formatted version ID was passed.
  # @param [Exception] err
  # @return [Boolean] true if err was caused by an invalid version ID
  #
  def invalid_version_id?(err)
    # S3 returns an InvalidArgument exception with a particular message for this case.
    err.is_a?(Aws::S3::Errors::InvalidArgument) && err.message =~ %r{Invalid version id specified}
  end

  def log_restored_file(project_id:, user_id:, filename:, source_version_id:, new_version_id:)
    owner_id, channel_id = storage_decrypt_channel_id(project_id)
    key = s3_path owner_id, channel_id, filename
    FirehoseClient.instance.put_record(
      study: 'project-data-integrity',
      study_group: 'v3',
      event: 'version-restored',

      # Make it easy to limit our search to restores in the sources bucket for a certain project.
      project_id: project_id,
      data_string: @bucket,

      user_id: user_id,
      data_json: {
        restoredVersionId: source_version_id,
        newVersionId: new_version_id,
        bucket: @bucket,
        key: key,
        filename: filename,
      }.to_json
    )
  end

  def object_exists?(key)
    response = s3.get_object(bucket: @bucket, key: key)
    response && !response[:delete_marker]
  rescue Aws::S3::Errors::NoSuchKey
    false
  end

  def s3_path(owner_id, channel_id, filename = nil)
    "#{@base_dir}/#{owner_id}/#{channel_id}/#{Addressable::URI.unencode(filename)}"
  end

  # Extracted so we can override with special behavior in AnimationBucket.
  def s3_get_object(key, if_modified_since, version)
    s3.get_object(bucket: @bucket, key: key, if_modified_since: if_modified_since, version_id: version)
  end
end
