#
# SourceBucket
#
class SourceBucket < BucketHelper

  def initialize(storage_id)
    super CDO.sources_s3_bucket, CDO.sources_s3_directory, storage_id
  end
end
