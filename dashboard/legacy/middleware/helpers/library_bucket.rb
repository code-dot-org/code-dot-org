#
# LibraryBucket
#
class LibraryBucket < BucketHelper
  def initialize
    super(CDO.libraries_s3_bucket, CDO.libraries_s3_directory)
  end

  def allowed_file_types
    %w(.json .java .py .csv .txt .js .html .css .md .jpeg .jpg .png .gif .wav .webp)
  end

  def cache_duration_seconds
    3600
  end
end
