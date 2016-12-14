require 'test_helper'

class RegionalPartnerTest < ActiveSupport::TestCase
  include ActiveSupport::Testing::Stream

  test "regional partners initialized from tsv" do
    RegionalPartner.find_or_create_all_from_tsv('test/fixtures/regional_partners.tsv')

    assert_equal(2, RegionalPartner.count, 'test data contains 2 partners')
    partner1 = RegionalPartner.find_by({name: 'A+ College Ready'})
    assert_not_nil partner1
    assert_equal partner1.group, 1
    partner2 = RegionalPartner.find_by({name: 'Center for STEM Education, The University of Texas at Austin'})
    assert_not_nil partner2
    assert_equal partner2.group, 2
  end
end
