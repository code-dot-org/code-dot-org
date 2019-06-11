#
# LibraryPilotBucket
#
class LibraryPilotBucket < BucketHelper
  def initialize
    super CDO.librarypilot_s3_bucket, CDO.librarypilot_s3_directory
  end

  def allowed_file_types
    %w(.json)
  end

  def cache_duration_seconds
    3600
  end
end
