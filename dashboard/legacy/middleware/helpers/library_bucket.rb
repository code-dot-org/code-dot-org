#
# LibraryBucket
#
class LibraryBucket < BucketHelper
  def initialize
    super CDO.libraries_s3_bucket, CDO.libraries_s3_directory
  end

  def allowed_file_types
    # The Library bucket is used by App Lab (json), Java Lab (java, csv, txt),
    # Python Lab (py, csv, txt), and Web Lab 2 (html, css, js, md).
    %w(.json .java .py .csv .txt .js .html .css .md)
  end

  def cache_duration_seconds
    3600
  end
end
