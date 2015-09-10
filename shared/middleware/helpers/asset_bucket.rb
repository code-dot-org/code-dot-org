#
# AssetBucket
#
class AssetBucket < BucketHelper

  def initialize(storage_id)
    super CDO.assets_s3_bucket, CDO.assets_s3_directory, storage_id
  end
end
