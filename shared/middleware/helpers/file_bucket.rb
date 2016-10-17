#
# FileBucket
#
class FileBucket < BucketHelper
  def initialize
    super CDO.files_s3_bucket, CDO.files_s3_directory
  end

  def allowed_file_type?(extension)
    # Allow all files types
    true
  end
end
