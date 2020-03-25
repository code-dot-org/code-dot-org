require_relative '../../test_helper'
require 'cdo/contact_rollups/v2/pardot'

class PardotV2Test < Minitest::Test
  def test_retrieve_new_ids_without_result
    pardot_response = Nokogiri::XML <<-XML
      <rsp stat="ok">
        <result>
          <total_results>0</total_results>
        </result>
      </rsp>
    XML

    PardotV2.stubs(:post_with_auth_retry).returns(pardot_response)

    assert_equal [], PardotV2.retrieve_new_ids
  end

  def test_retrieve_new_ids_with_result
    pardot_id = 1
    email = "alex@rollups.com"
    pardot_response = Nokogiri::XML <<-XML
      <rsp stat="ok">
        <result>
          <prospect>
            <id>#{pardot_id}</id>
            <email>#{email}</email>
          </prospect>
          <total_results>1</total_results>
        </result>
      </rsp>
    XML
    PardotV2.stubs(:post_with_auth_retry).returns(pardot_response)

    expected_result = [{email: email, pardot_id: pardot_id}]
    assert_equal expected_result, PardotV2.retrieve_new_ids
  end
end
