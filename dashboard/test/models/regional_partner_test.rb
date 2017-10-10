require 'test_helper'

class RegionalPartnerTest < ActiveSupport::TestCase
  test "regional partners initialized from tsv" do
    RegionalPartner.find_or_create_all_from_tsv('test/fixtures/regional_partners.tsv')

    partner1 = RegionalPartner.find_by name: 'A+ College Ready'
    assert_not_nil partner1
    assert_equal partner1.group, 1
    partner2 = RegionalPartner.find_by name: 'Center for STEM Education, The University of Texas at Austin'
    assert_not_nil partner2
    assert_equal partner2.group, 2
  end

  test "create regional partner with valid attributes creates regional partner" do
    assert_creates RegionalPartner do
      create :regional_partner,
        urban: true,
        attention: "code.org",
        street: '1501 4th Ave',
        apartment_or_suite: 'Suite 900',
        city: 'Seattle',
        state: 'WA',
        zip_code: '98101',
        phone_number: '555-111-2222'
    end
  end

  test "create regional partner with invalid attributes does not create" do
    regional_partner = RegionalPartner.new
    assert_does_not_create RegionalPartner do
      regional_partner.update(name: "", group: "fish", phone_number: 'fish')
    end
    refute regional_partner.valid?
    assert_includes regional_partner.errors.full_messages, "Name is too short (minimum is 1 character)"
    assert_includes regional_partner.errors.full_messages, "Group is not a number"
    assert_includes regional_partner.errors.full_messages, "Phone number is invalid"
  end

  test 'state must be in list' do
    regional_partner = build :regional_partner, state: 'invalid'
    refute regional_partner.valid?
    assert_equal ['State is not included in the list'], regional_partner.errors.full_messages
  end

  test 'zip code must be a valid format' do
    regional_partner = build :regional_partner, zip_code: 'invalid'
    refute regional_partner.valid?
    assert_equal ['Zip code is invalid'], regional_partner.errors.full_messages
  end
end
