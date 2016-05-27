#
# SourceBucket
#
class SourceBucket < BucketHelper

  def initialize
    super CDO.sources_s3_bucket, CDO.sources_s3_directory
  end

  def allowed_file_types
    # Only allow JavaScript and Blockly XML source files.
    %w(.js .xml .txt .json)
  end

  def cache_duration_seconds
    0
  end

end
