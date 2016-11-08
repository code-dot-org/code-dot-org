#
# FileBucket
#
class FileBucket < BucketHelper
  MANIFEST_FILENAME = 'manifest.json'

  def initialize
    super CDO.files_s3_bucket, CDO.files_s3_directory
  end

  def allowed_file_type?(extension)
    # Allow all files types
    true
  end

  def copy_files(src_channel, dest_channel, options={})
    # copy everything except the manifest
    options[:exclude_filenames] = [MANIFEST_FILENAME]
    result = super src_channel, dest_channel, options

    # if there are files in the project, create a new manifest in the destination channel containing the file entries (including their new versions)
    create_or_replace(dest_channel, FileBucket::MANIFEST_FILENAME, result.to_json) unless result.empty?

    result
  end
end
