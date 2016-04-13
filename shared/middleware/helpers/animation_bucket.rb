#
# AnimationBucket
#
class AnimationBucket < BucketHelper

  def initialize
    super CDO.animations_s3_bucket, CDO.animations_s3_directory
  end
end
