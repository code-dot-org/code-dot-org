require_relative '../../../shared/test/test_helper'
require 'cdo/rake_utils'
require_relative '../ci_aws_uploader'
class CIAWSUploaderTest < ActiveSupport::TestCase
  def test_successful_upload
    start_time = Time.now - 3600
    duration = 3600
    commit_hash = 'abc'
    link = CIAWSUploader.upload_log_and_get_link_for_build("test", 0, "websites", start_time, duration, commit_hash)
    puts link
    puts "bye"
  end
end
