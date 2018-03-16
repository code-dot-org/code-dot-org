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

  #
  # Extends the default 'get' operation in BucketHelper.  If an animation is
  # requested by version, and the animation is not found, try again without
  # a version (just getting the latest animation).
  # If that works, log the incident since we likely had a bad version id
  # and we want to see these incidents go down over time.
  #
  def s3_get_object(key, if_modified_since, version)
    super(key, if_modified_since, version)
  rescue Aws::S3::Errors::NoSuchVersion
    # Rethrow if it clearly wasn't the version.
    raise if version.nil?
    # Try getting the latest version
    s3_object = super(key, if_modified_since, nil)
    # If the fallback is successful, let's notify Honeybadger, because we'd
    # like these to go down over time.
    Honeybadger.notify(
      'AnimationBucket served latest version instead of requested version',
      context: {
        s3_key: key,
        requested_version: version,
        served_version: s3_object.version_id
      }
    )
    s3_object
  end
end
