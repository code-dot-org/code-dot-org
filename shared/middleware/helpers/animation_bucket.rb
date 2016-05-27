#
# AnimationBucket
#
class AnimationBucket < BucketHelper

  def initialize
    super CDO.animations_s3_bucket, CDO.animations_s3_directory
  end

  def allowed_file_types
    # Only allow specific image types to be uploaded by users.
    # Only png for now, will expand support in the future
    %w(.png)
  end

  def cache_duration_seconds
    3600
  end

end
