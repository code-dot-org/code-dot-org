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

  test 'assign program manager to regional partner assigns program manager' do
    regional_partner = create :regional_partner
    program_manager = create :teacher
    assert_creates RegionalPartnerProgramManager do
      regional_partner.program_manager = program_manager.id
    end
    assert regional_partner.program_managers.exists?(program_manager.id)
  end

  test 'assign existing program manager does not create duplicate regional partner program managers' do
    regional_partner = create :regional_partner
    program_manager = create(:regional_partner_program_manager, regional_partner: regional_partner).program_manager
    assert_does_not_create RegionalPartnerProgramManager do
      regional_partner.program_manager = program_manager.id
    end
  end

  test 'find_by_region finds matching regional_partner' do
    # partners and their mappings

    # regional_partner_WA
    # regional_partner_WA_98105
    # regional_partner_98105
    # regional_partner_NY
    regional_partner_ny = create :regional_partner, name: "partner_NY"
    regional_partner_ny.mappings.find_or_create_by(state: "NY")

    # regional_partner_MA_02138
    regional_partner_ma_02138 = create :regional_partner, name: "partner_MA_02138"
    regional_partner_ma_02138.mappings.find_or_create_by(state: "MA")
    regional_partner_ma_02138.mappings.find_or_create_by(zip_code: "02138")

    # regional_partner_CA_94305

    # regional_partner_70808
    regional_partner_70808 = create :regional_partner, name: "partner_70808"
    regional_partner_70808.mappings.find_or_create_by(zip_code: "70808")

    # regional_partner_no_mappings

    # queries

    # state=nil/zip=nil [return nil (no match)]
    assert_nil RegionalPartner.find_by_region(nil, nil)

    # state=NY [state only, one match]
    assert_equal RegionalPartner.find_by_region(nil, "NY"), regional_partner_ny

    # zip=70808 [zip only, one match]
    assert_equal RegionalPartner.find_by_region("70808", nil), regional_partner_70808

    # state=MA/zip=02138 [state & zip, both match with one partner]
    assert_equal RegionalPartner.find_by_region("02138", "MA"), regional_partner_ma_02138

    # state=LA [state only, no match]
    # zip=90210 [zip only, no match]
    # state=CA/zip=90210 [state matches one partner, zip code does not match]
    # state=LA/zip=70808 [zip code matches one partner, state does not match]
    # state=WA/zip=98104 [state matches many, zip matches one]
    # state=WA [state matches many, indeterminate result]
    # zip=98105 [zip matches many, indeterminate result]
  end
end
