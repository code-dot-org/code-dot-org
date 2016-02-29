#
# SourceBucket
#
class SourceBucket < BucketHelper
  def initialize
    super CDO.sources_s3_bucket, CDO.sources_s3_directory
  end
end
