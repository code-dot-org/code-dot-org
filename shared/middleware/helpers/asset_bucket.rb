#
# AssetBucket
#
class AssetBucket < BucketHelper

  def initialize
    super CDO.assets_s3_bucket, CDO.assets_s3_directory
  end
end
