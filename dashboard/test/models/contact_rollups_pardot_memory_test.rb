require 'test_helper'
require 'cdo/contact_rollups/v2/pardot'

class ContactRollupsPardotMemoryTest < ActiveSupport::TestCase
  test 'update_from_new_contacts creates one row per email' do
    response = Nokogiri::XML::Builder.new do |xml|
      xml.rsp {
        xml.result {
          xml.prospect {
            xml.id_ "1"
            xml.email "alex@rollups.com"
          }
          xml.total_results "1"
        }
      }
    end

    Pardot.stubs(:post_with_auth_retry).returns(response.doc)
    Pardot.stubs(:raise_if_response_error).returns(nil)

    ContactRollupsPardotMemory.update_from_new_contacts

    assert 1, ContactRollupsPardotMemory.find_by(email: 'alex@rollups.com').pardot_id
  end

  test 'update_from_new_contacts with two emails returns record with higher ID' do
    create :contact_rollups_pardot_memory, email: 'alex@rollups.com', pardot_id: 1

    response = Nokogiri::XML::Builder.new do |xml|
      xml.rsp {
        xml.result {
          xml.prospect {
            xml.id_ "2"
            xml.email "alex@rollups.com"
          }
          xml.total_results "1"
        }
      }
    end

    Pardot.stubs(:post_with_auth_retry).returns(response.doc)
    Pardot.stubs(:raise_if_response_error).returns(nil)

    assert 1, ContactRollupsPardotMemory.find_by(email: 'alex@rollups.com').pardot_id
    ContactRollupsPardotMemory.update_from_new_contacts
    assert 2, ContactRollupsPardotMemory.find_by(email: 'alex@rollups.com').pardot_id
  end

  test 'can handle having multiple mappings in response' do
    response = Nokogiri::XML::Builder.new do |xml|
      xml.rsp {
        xml.result {
          xml.prospect {
            xml.id_ "1"
            xml.email "alex@rollups.com"
          }
          xml.prospect {
            xml.id_ "2"
            xml.email "becky@rollups.com"
          }
          xml.total_results "2"
        }
      }
    end

    Pardot.stubs(:post_with_auth_retry).returns(response.doc)
    Pardot.stubs(:raise_if_response_error).returns(nil)

    ContactRollupsPardotMemory.update_from_new_contacts

    assert 1, ContactRollupsPardotMemory.find_by(email: 'alex@rollups.com').pardot_id
    assert 2, ContactRollupsPardotMemory.find_by(email: 'becky@rollups.com').pardot_id
    assert 2, ContactRollupsPardotMemory.count
  end
end

