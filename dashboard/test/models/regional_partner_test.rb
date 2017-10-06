require 'test_helper'

class RegionalPartnerTest < ActiveSupport::TestCase
  setup do
    @fake_geocoder_response = [
      OpenStruct.new(
        postal_code: '98101',
        state_code: 'WA',
        street_number: '1501'
      )
    ]
    Geocoder.stubs(:search).returns(@fake_geocoder_response)
  end

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
      regional_partner = create :regional_partner,
        urban: true,
        attention: "code.org",
        street: '1501 4th Ave',
        apartment_or_suite: 'Suite 900',
        city: 'Seattle',
        state: 'WA',
        zip_code: '98101',
        phone_number: '555-111-2222'
      puts regional_partner.zip_code
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

  test "create regional partner with invalid address does not create" do
    regional_partner = RegionalPartner.new
    assert_does_not_create RegionalPartner do
      regional_partner.update(name: "Test Regional Partner With Invalid Address",
        street: "1501 4th Ave",
        city: "Seattle",
        state: "WA",
        zip_code: "99999"
      )
    end
    refute regional_partner.valid?
    assert_includes regional_partner.errors.full_messages, "Zip code doesn't match the address. Did you mean 98101?"
  end
end
