require 'addressable'
require 'active_support/core_ext/object/try'
require 'active_support/core_ext/module/attribute_accessors'
require 'cdo/aws/s3'
require 'honeybadger/ruby'
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

  def allowed_file_name?(_filename)
    true
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
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    prefix = s3_path owner_id, storage_app_id
    track_list_operation 'BucketHelper.app_size'
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
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)

    app_prefix = s3_path owner_id, storage_app_id
    target_object_prefix = s3_path owner_id, storage_app_id, target_object

    track_list_operation 'BucketHelper.object_and_app_size'
    objects = s3.list_objects(bucket: @bucket, prefix: app_prefix).contents
    target_object = objects.find {|x| x.key == target_object_prefix}

    app_size = objects.map(&:size).reduce(:+).to_i
    object_size = target_object.nil? ? nil : target_object.size.to_i

    [object_size, app_size]
  end

  def list(encrypted_channel_id)
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    prefix = s3_path owner_id, storage_app_id
    track_list_operation 'BucketHelper.list'
    s3.list_objects(bucket: @bucket, prefix: prefix).contents.map do |fileinfo|
      filename = %r{#{prefix}(.+)$}.match(fileinfo.key)[1]
      category = category_from_file_type(File.extname(filename))

      {filename: filename, category: category, size: fileinfo.size, timestamp: fileinfo.last_modified}
    end
  end

  def get(encrypted_channel_id, filename, if_modified_since = nil, version = nil)
    if_modified_since = nil if if_modified_since == ''
    begin
      owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      return {status: 'NOT_FOUND'}
    end
    key = s3_path owner_id, storage_app_id, filename
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
    src_owner_id, src_storage_app_id = storage_decrypt_channel_id(src_channel)
    dest_owner_id, dest_storage_app_id = storage_decrypt_channel_id(dest_channel)

    src_prefix = s3_path src_owner_id, src_storage_app_id
    track_list_operation 'BucketHelper.copy_files'
    result = s3.list_objects(bucket: @bucket, prefix: src_prefix).contents.map do |fileinfo|
      filename = %r{#{src_prefix}(.+)$}.match(fileinfo.key)[1]
      next unless (!options[:filenames] && (!options[:exclude_filenames] || !options[:exclude_filenames].include?(filename))) || options[:filenames].try(:include?, filename)
      mime_type = Sinatra::Base.mime_type(File.extname(filename))
      category = mime_type.split('/').first  # e.g. 'image' or 'audio'

      src = "#{@bucket}/#{src_prefix}#{filename}"
      dest = s3_path dest_owner_id, dest_storage_app_id, filename

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
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, storage_app_id, filename

    s3.copy_object(bucket: @bucket, copy_source: URI.encode("#{@bucket}/#{key}?versionId=#{version}"), key: key, metadata_directive: 'REPLACE')
  end

  def replace_abuse_score(encrypted_channel_id, filename, abuse_score)
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, storage_app_id, filename

    s3.copy_object(bucket: @bucket, copy_source: URI.encode("#{@bucket}/#{key}"), key: key, metadata: {abuse_score: abuse_score.to_s}, metadata_directive: 'REPLACE')
  end

  def create_or_replace(encrypted_channel_id, filename, body, version = nil, abuse_score = 0)
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)

    key = s3_path owner_id, storage_app_id, filename
    response = s3.put_object(bucket: @bucket, key: key, body: body, metadata: {abuse_score: abuse_score.to_s})

    # Delete the old version, if doing an in-place replace
    s3.delete_object(bucket: @bucket, key: key, version_id: version) if version

    response
  end

  # When updating s3://cdo-v3-sources/.../main.json, checks that the
  # current_version from the client is the latest version on the server. If a
  # different client more recently wrote to this project, logs an event to
  # firehose and halts with 409 Conflict.
  #
  # In some cases, S3 replication lag could cause the current_version not to
  # even appear in the version list. In this case, do not log or halt.
  #
  # Clients displaying projects must obey the following rules:
  # (1) When loading a project, read its latest version.
  # (2) When saving a project for the first time, create a new version, but
  #     do not replace any previous versions.
  # (3) When saving a project subsequent times, create a new version, and
  #     replace the "current version" (i.e. last known version that client wrote).
  #
  # Therefore, a project will only ever replace a version that it created, and
  # we can say the client "owns" a particular version if that client created it.
  def check_current_version(encrypted_channel_id, filename, current_version, should_replace, timestamp, tab_id, user_id)
    return true unless filename == 'main.json' && @bucket == CDO.sources_s3_bucket && current_version

    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, storage_app_id, filename

    begin
      latest = s3.head_object(bucket: @bucket, key: key).version_id
      return true if current_version == latest
    rescue Aws::S3::Errors::NotFound
      # No main.json yet; fall through to fallback logic
    end

    # This is an Array of ObjectVersions, defined in:
    # https://docs.aws.amazon.com/sdkforruby/api/Aws/S3/Types/ObjectVersion.html
    track_list_operation 'BucketHelper.check_current_version'
    versions = s3.list_object_versions(bucket: @bucket, prefix: key).versions

    target_version_metadata = versions.find {|v| v.version_id == current_version}

    error_type =
      if should_replace
        # If we are replacing the target version, then we "own" it and don't have
        # to worry about other clients replacing it. We *do* have to worry about
        # the target version not being visible yet due to S3's read-after-write
        # eventual consistency though, so allow the target version to either be
        # (absent or (present and latest)).
        return true unless target_version_metadata && !target_version_metadata.is_latest
        'reject-replacing-older-main-json'
      else
        # Since we are not replacing the target version, we can conclude:
        # (1) the client just loaded the project for the first time, meaning
        #     the client recently successfully read this version, so we aren't
        #     too worried about S3 inconsistency.
        # (2) this version is owned by a different client, therefore another
        #     client may have already replaced it.
        # Guard against this scenario by requiring that the target version be
        # both present and latest, without worrying about S3 inconsistency.
        return true if target_version_metadata&.is_latest
        'reject-comparing-older-main-json'
      end

    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'project-data-integrity',
        study_group: 'v4',
        event: error_type,

        project_id: encrypted_channel_id,
        user_id: user_id,

        data_json: {
          currentVersionId: current_version,
          tabId: tab_id,
          key: key,

          # Server timestamp indicating when the first version of main.json was saved by the browser
          # tab making this request. This is for diagnosing problems with writes from multiple browser
          # tabs.
          firstSaveTimestamp: timestamp,

          versions: versions,
        }.to_json
      }
    )

    return false
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
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)

    key = s3_path owner_id, storage_app_id, filename
    copy_source = @bucket + '/' + s3_path(owner_id, storage_app_id, source_filename)
    response = s3.copy_object(bucket: @bucket, key: key, copy_source: copy_source)

    # Delete the old version, if doing an in-place replace
    s3.delete_object(bucket: @bucket, key: key, version_id: version) if version

    response
  end

  def delete(encrypted_channel_id, filename)
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, storage_app_id, filename

    s3.delete_object(bucket: @bucket, key: key)
  end

  def delete_multiple(encrypted_channel_id, filenames)
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    objects = filenames.map {|filename| {key: s3_path(owner_id, storage_app_id, filename)}}

    s3.delete_objects(bucket: @bucket, delete: {objects: objects, quiet: true})
  end

  #
  # Irrevocably removes all objects from the channel.  If the bucket is
  # versioned, this includes all past versions of objects and all delete
  # markers, leaving no trace that the channel was ever used.
  #
  # @param [String] encrypted_channel_id for the channel to hard-delete
  # @return [Integer] the number of objects deleted
  def hard_delete_channel_content(encrypted_channel_id)
    # TODO: Handle pagination in the S3 APIs
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    # Find all versions of all objects
    channel_prefix = s3_path owner_id, storage_app_id
    track_list_operation 'BucketHelper.hard_delete_channel_content'
    version_list = s3.list_object_versions(bucket: @bucket, prefix: channel_prefix)
    return 0 if version_list.versions.empty? && version_list.delete_markers.empty?

    # Delete all versions and delete markers
    objects_to_delete = (version_list.versions + version_list.delete_markers).
      map {|v| v.to_h.slice(:key, :version_id)}
    result = s3.delete_objects(
      bucket: @bucket,
      delete: {
        objects: objects_to_delete,
        quiet: true
      }
    )
    raise <<~ERROR unless result.errors.empty?
      Error deleting channel content:
      #{result.errors.map(&:to_s).join("\n      ")}
    ERROR
    result.deleted.count
  end

  def list_versions(encrypted_channel_id, filename)
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, storage_app_id, filename

    track_list_operation 'BucketHelper.list_versions'
    s3.list_object_versions(bucket: @bucket, prefix: key).
      versions.
      map do |version|
        {
          versionId: version.version_id,
          lastModified: version.last_modified,
          isLatest: version.is_latest
        }
      end
  end

  # Used for testing
  def list_delete_markers(encrypted_channel_id, filename)
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, storage_app_id, filename

    track_list_operation 'BucketHelper.list_delete_markers'
    s3.list_object_versions(bucket: @bucket, prefix: key).
      delete_markers.
      map do |delete_marker|
        {
          versionId: delete_marker.version_id,
          lastModified: delete_marker.last_modified,
          isLatest: delete_marker.is_latest
        }
      end
  end

  # Copies the given version of the file to make it the current revision.
  # (All intermediate versions are preserved.)
  def restore_previous_version(encrypted_channel_id, filename, version_id, user_id)
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    key = s3_path owner_id, storage_app_id, filename

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
        FirehoseClient.instance.put_record(
          :analysis,
          {
            study: 'bucket-warning',
            study_group: self.class.name,
            event: 'restore-specific-version',
            data_string: 'Restore at Specified Version Failed. Restored most recent.',
            data_json: {
              source: "#{@bucket}/#{key}?versionId=#{version_id}"
            }.to_json
          }
        )
      else
        # Couldn't restore specific version and didn't find a latest version either.
        # It is probably deleted.
        # In this case, we want to do nothing.
        response = {status: 'NOT_MODIFIED'}
        FirehoseClient.instance.put_record(
          :analysis,
          {
            study: 'bucket-warning',
            study_group: self.class.name,
            event: 'restore-deleted-object',
            data_string: 'Restore at Specified Version Failed on deleted object. No action taken.',
            data_json: {
              source: "#{@bucket}/#{key}?versionId=#{version_id}"
            }.to_json
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

  # Regex matching every character except those which are url-safe and
  # recommended for use in S3 key names:
  # https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingMetadata.html#object-key-guidelines-safe-characters
  UNSAFE_CHAR_REGEX = /[^0-9A-Za-z!\-_.*'()]/ unless defined? UNSAFE_CHAR_REGEX

  # Replace any unsafe characters with dashes.
  def self.replace_unsafe_chars(str)
    str.gsub(UNSAFE_CHAR_REGEX, '-')
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
    owner_id, storage_app_id = storage_decrypt_channel_id(project_id)
    key = s3_path owner_id, storage_app_id, filename
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'project-data-integrity',
        study_group: 'v4',
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
      }
    )
  end

  def object_exists?(key)
    response = s3.get_object(bucket: @bucket, key: key)
    response && !response[:delete_marker]
  rescue Aws::S3::Errors::NoSuchKey
    false
  end

  def s3_path(owner_id, storage_app_id, filename = nil)
    "#{@base_dir}/#{owner_id}/#{storage_app_id}/#{Addressable::URI.unencode(filename)}"
  end

  # Extracted so we can override with special behavior in AnimationBucket.
  def s3_get_object(key, if_modified_since, version)
    s3.get_object(bucket: @bucket, key: key, if_modified_since: if_modified_since, version_id: version)
  end

  def track_list_operation(source_name)
    return unless CDO.newrelic_logging
    NewRelic::Agent.record_metric("Custom/ListRequests/#{self.class.name}/#{source_name}", 1)
  end
end
