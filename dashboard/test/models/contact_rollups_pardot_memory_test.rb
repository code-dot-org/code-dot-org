require 'test_helper'
require 'cdo/contact_rollups/v2/pardot'

class ContactRollupsPardotMemoryTest < ActiveSupport::TestCase
  test 'update_from_new_contacts creates one row per email' do
    response = <<~XML
                 <rsp>
                   <result>
                     <prospect>
                       <id>1</id>
                       <email>alex@rollups.com</email>
                     </prospect>
                     <total_results>1</total_results>
                   </result>
                 </rsp>
               XML

    Pardot.stubs(:post_with_auth_retry).returns(Nokogiri::XML.parse(response))
    Pardot.stubs(:raise_if_response_error).returns(nil)

    ContactRollupsPardotMemory.update_from_new_contacts

    assert_equal 1, ContactRollupsPardotMemory.find_by(email: 'alex@rollups.com').pardot_id
  end

  test 'update_from_new_contacts with two emails returns record with higher ID' do
    create :contact_rollups_pardot_memory, email: 'alex@rollups.com', pardot_id: 1

    response = <<~XML
                 <rsp>
                   <result>
                     <prospect>
                       <id>2</id>
                       <email>alex@rollups.com</email>
                     </prospect>
                     <total_results>1</total_results>
                   </result>
                 </rsp>
               XML

    Pardot.stubs(:post_with_auth_retry).returns(Nokogiri::XML.parse(response))
    Pardot.stubs(:raise_if_response_error).returns(nil)

    assert_equal 1, ContactRollupsPardotMemory.find_by(email: 'alex@rollups.com').pardot_id
    ContactRollupsPardotMemory.update_from_new_contacts
    assert_equal 2, ContactRollupsPardotMemory.find_by(email: 'alex@rollups.com').pardot_id
  end

  test 'can handle having multiple mappings in response' do
    response = <<~XML
                 <rsp>
                   <result>
                     <prospect>
                       <id>1</id>
                       <email>alex@rollups.com</email>
                     </prospect>
                     <prospect>
                       <id>3</id>
                       <email>becky@rollups.com</email>
                     </prospect>
                     <total_results>2</total_results>
                   </result>
                 </rsp>
               XML

    Pardot.stubs(:post_with_auth_retry).returns(Nokogiri::XML.parse(response))
    Pardot.stubs(:raise_if_response_error).returns(nil)

    ContactRollupsPardotMemory.update_from_new_contacts

    assert_equal 1, ContactRollupsPardotMemory.find_by(email: 'alex@rollups.com').pardot_id
    assert_equal 3, ContactRollupsPardotMemory.find_by(email: 'becky@rollups.com').pardot_id
    assert_equal 2, ContactRollupsPardotMemory.count
  end
end
