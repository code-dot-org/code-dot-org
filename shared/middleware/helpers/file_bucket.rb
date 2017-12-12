#
# FileBucket
#
class FileBucket < BucketHelper
  MANIFEST_FILENAME = 'manifest.json'.freeze

  def initialize
    super CDO.files_s3_bucket, CDO.files_s3_directory
  end

  def allowed_file_type?(extension)
    # Allow all file types recognized by Sinatra
    Sinatra::Base.mime_type(extension)
  end

  def get_manifest(channel_id)
    manifest_result = get(channel_id, FileBucket::MANIFEST_FILENAME)
    if manifest_result[:status] == 'NOT_FOUND'
      return []
    end
    JSON.load manifest_result[:body]
  end

  def copy_files(src_channel, dest_channel, options={})
    # copy everything except the manifest
    options[:exclude_filenames] = [MANIFEST_FILENAME]
    result = super src_channel, dest_channel, options
    # return right away if there are no files in the source project
    return [] if result.empty?

    # update dest_manifest with the decorated filenames from the src_manifest
    # (we need the new version ids from the dest_manifest, otherwise we'd just copy the src_manifest)
    dest_manifest = JSON.load result.to_json
    src_manifest = get_manifest(src_channel)
    src_manifest.each do |src_entry|
      src_filename = src_entry['filename']
      dest_manifest.each do |dest_entry|
        if dest_entry['filename'].downcase == src_filename.downcase
          dest_entry['filename'] = src_filename
        end
      end
    end

    # Save the dest_manifest in the destination channel
    create_or_replace(dest_channel, FileBucket::MANIFEST_FILENAME, dest_manifest.to_json)

    dest_manifest
  end
end
