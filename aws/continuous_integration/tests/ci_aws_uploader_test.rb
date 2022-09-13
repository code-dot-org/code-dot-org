require_relative '../../../shared/test/test_helper'
require 'cdo/rake_utils'
require_relative '../ci_aws_uploader'
class CIAWSUploaderTest < ActiveSupport::TestCase
  def test_successful_upload
    start_time = Time.now - 3600
    duration = 3600
    commit_hash = 'abc'
    expected_result = "https://cdo-build-logs.s3.amazonaws.com/pablos-air.lan/20220913T100608-0700?versionId=0AsDVj_wGZ6VpkQryu.J5Wo1RqwnFX6t&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAW5P5EEELBAHSVZU7%2F20220913%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220913T180609Z&X-Amz-Expires=259200&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBIaCXVzLWVhc3QtMSJGMEQCIFu8m2F77FysiF1Jsk7AlAcqQBdhdVZ0wjqtgORJLUwkAiB%2FDks7dg85MTjwscqPdOcewcO8fxfB2RCTGy2vSh79lyr8Agir%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDQ3NTY2MTYwNzE5MCIM%2BERDXcY5nmD%2B1OMEKtACzcRrWDVl%2Fgdiq1rZGm5A9UbN%2BXRBs3Ut23RVNynMFtk1Gy7A21mlyWjuSaXChQ1fDwnDTHPZ%2FQx6iMH%2Fe3iDieC0pwVSFPnnooovsGpNnm5qletxp0zMaEt6TOllOISkRcBLXUNMcbxCSyRR%2FZFF%2Bb2QXfz6OZbn3%2Bso6Z6%2F%2BEhLnBStIhojun8kBcU74uEQmQSiwQ3vct6jcUYxEKce67hf6ZSo%2BHqtjbXTfJQCpvMzpFNdTL066mJyA2JHlo5aPtL7GEtwj3fW7Q5CFlOVruQI1As6Mwbq6NqDT1cailmoIj%2FAY7fQau4qCyk%2FbWXHLmMPxeSbL33OTIG7DbxjTOdGdnmLlxsfVdcnaqSmKzrsLeoL11knn8W7ssK5JsqLld0yl%2B4dezGvb7aijR%2F32BzdpnZZVCnxAB95kEGhG9ShKCic2CGJyZcdLZZlJIH4MKX%2FgpkGOskBPYm4B7u0Co%2BKlNgssOrQ82J1oZIvsuHNlAcsJdNLqFnop9hzMY0xWaiG5xqvETXl%2F0tLvNP6MHhf2KLBkJpetf6t4no8nftuWxI6gLeopdUI%2F%2B2%2F5WX78UR235vEkQJrpEJt7bgLySNsh8chRfh8E3jxP1pbUydgKftN%2BjwWqDgIMjX%2Fe6Gp3Kg2HqjYJY7AS8QbmvDyjn4xit42N0vI4602hHohqcBKhH1EACIBska0Y%2FOVvRuEg19hsnMJS5Y8XEEuXpfa%2F0GZ&X-Amz-SignedHeaders=host&X-Amz-Signature=d8e7e18556eb51b42c4ce133e20ffeb04a1ceaa62e235c743b2cd0052425c9de"
    expected_key_param = start_time.strftime('%Y%m%dT%H%M%S%z')
    expected_body_param = "test
0
websites built in 60:00 minutes
"
    expected_metadata_param = {metadata: {commit: "abc", duration: "3600", success: "true"}}
    AWS::S3::LogUploader.any_instance.stubs(:upload_log).returns(expected_result).with(expected_key_param, expected_body_param, expected_metadata_param)
    link = CIAWSUploader.upload_log_and_get_link_for_build("test", 0, "websites", start_time, duration, commit_hash)
    assert !link.nil?
  end
end
