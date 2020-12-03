require 'test_helper'

class RegionalPartnerTest < ActiveSupport::TestCase
  freeze_time

  include Pd::SharedWorkshopConstants

  setup do
    Pd::Workshop.any_instance.stubs(:process_location) # don't actually call Geocoder service
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

  test 'Fails lookup with nil zip' do
    assert_equal RegionalPartner.find_by_zip(nil), [nil, nil]
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
    regional_partner_wa = create :regional_partner, name: "partner_WA"
    regional_partner_wa.mappings.find_or_create_by!(state: "WA")

    regional_partner_wa_98104 = create :regional_partner, name: "partner_WA_98104"
    regional_partner_wa_98104.mappings.find_or_create_by!(zip_code: "98104")

    regional_partner_wa_98105 = create :regional_partner, name: "partner_WA_98105"
    regional_partner_wa_98105.mappings.find_or_create_by!(zip_code: "98105")

    regional_partner_ny = create :regional_partner, name: "partner_NY"
    regional_partner_ny.mappings.find_or_create_by!(state: "NY")

    regional_partner_ma_02138 = create :regional_partner, name: "partner_MA_02138"
    regional_partner_ma_02138.mappings.find_or_create_by!(state: "MA")
    regional_partner_ma_02138.mappings.find_or_create_by!(zip_code: "02138")

    regional_partner_ca_94305 = create :regional_partner, name: "partner_CA_94305"
    regional_partner_ca_94305.mappings.find_or_create_by!(state: "CA")
    regional_partner_ca_94305.mappings.find_or_create_by!(zip_code: "94305")

    regional_partner_70808 = create :regional_partner, name: "partner_70808"
    regional_partner_70808.mappings.find_or_create_by!(zip_code: "70808")

    create :regional_partner, name: "partner_nomappings"

    # TEST find_by_region with different combinations of zip code and state

    # state=nil/zip=nil [return nil (no match)]
    assert_nil RegionalPartner.find_by_region(nil, nil)

    # state=NY [search by state only where there is only one match]
    assert_equal regional_partner_ny, RegionalPartner.find_by_region(nil, "NY")

    # zip=70808 [search by zip only where there is only one match]
    assert_equal regional_partner_70808, RegionalPartner.find_by_region("70808", nil)

    # state=MA/zip=02138 [search by state & zip where both match with one partner]
    assert_equal regional_partner_ma_02138, RegionalPartner.find_by_region("02138", "MA")

    # state=LA [state only, no match]
    assert_nil RegionalPartner.find_by_region(nil, "LA")

    # zip=90210 [zip only, no match]
    assert_nil RegionalPartner.find_by_region("90210", nil)

    # state=CA/zip=90210 [state matches one partner, zip code does not match]
    assert_equal regional_partner_ca_94305, RegionalPartner.find_by_region("94305", "CA")

    # state=LA/zip=70808 [zip code matches one partner, state does not match]
    assert_equal regional_partner_70808, RegionalPartner.find_by_region("70808", "LA")

    # state=WA/zip=98104 [state matches many, zip matches one]
    assert_equal regional_partner_wa_98104, RegionalPartner.find_by_region("98104", "WA")

    # state=WA [state matches partner that covers whole state, not specific zips in state]
    assert_equal regional_partner_wa, RegionalPartner.find_by_region(nil, "WA")
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'pd_workshops association as workshop_organizer' do
    regional_partner = create :regional_partner
    partner_organizer = create :workshop_organizer
    create :regional_partner_program_manager, regional_partner: regional_partner, program_manager: partner_organizer

    partner_workshops = create_list :workshop, 2, organizer: partner_organizer

    # non-partner workshops
    non_partner_organizer = create :workshop_organizer
    create_list :workshop, 2, organizer: non_partner_organizer

    assert_equal partner_workshops, regional_partner.pd_workshops_organized
  end

  test 'pd_workshops association' do
    regional_partner = create :regional_partner
    partner_organizer = create :program_manager, regional_partner: regional_partner

    partner_workshops = create_list :workshop, 2, organizer: partner_organizer

    # non-partner workshops
    non_partner_organizer = create :program_manager
    create_list :workshop, 2, organizer: non_partner_organizer

    assert_equal partner_workshops, regional_partner.pd_workshops_organized
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'future_pd_workshops_organized as workshop_organizer' do
    regional_partner = create :regional_partner
    partner_organizer = create :workshop_organizer
    create :regional_partner_program_manager, regional_partner: regional_partner, program_manager: partner_organizer

    future_partner_workshops = [
      create(:workshop, organizer: partner_organizer, sessions_from: Date.today),
      create(:workshop, organizer: partner_organizer, sessions_from: Date.tomorrow)
    ]

    # excluded (past or ended) partner workshops
    create :workshop, organizer: partner_organizer, sessions_from: Date.yesterday
    create :workshop, :ended, organizer: partner_organizer, sessions_from: Date.today

    assert_equal future_partner_workshops, regional_partner.future_pd_workshops_organized
  end

  test 'future_pd_workshops_organized' do
    regional_partner = create :regional_partner
    partner_organizer = create :program_manager, regional_partner: regional_partner
    create :regional_partner_program_manager, regional_partner: regional_partner, program_manager: partner_organizer

    future_partner_workshops = [
      create(:workshop, organizer: partner_organizer, sessions_from: Date.today),
      create(:workshop, organizer: partner_organizer, sessions_from: Date.tomorrow)
    ]

    # excluded (past or ended) partner workshops
    create :workshop, organizer: partner_organizer, sessions_from: Date.yesterday
    create :workshop, :ended, organizer: partner_organizer, sessions_from: Date.today

    assert_equal future_partner_workshops, regional_partner.future_pd_workshops_organized
  end

  test 'contact_email_with_backup falls back to first pm' do
    # contact_email
    regional_partner = create :regional_partner, contact_email: 'contact_email@partner.net'
    assert_equal 'contact_email@partner.net', regional_partner.contact_email_with_backup

    # no contact_email, use first PM
    regional_partner.update!(contact_email: nil, program_managers: [create(:teacher, email: 'first_pm@partner.net')])
    assert_equal 'first_pm@partner.net', regional_partner.contact_email_with_backup

    # nothing :(
    regional_partner.update!(program_managers: [])
    assert_nil regional_partner.contact_email_with_backup
  end

  test 'principal_approval must be valid' do
    regional_partner = build :regional_partner, applications_principal_approval: 'Invalid principal_approval'
    refute regional_partner.valid?
    assert_equal ["Applications principal approval is not included in the list"], regional_partner.errors.full_messages
  end

  test 'regional_partner_summer_workshop_open' do
    regional_partner = nil
    Timecop.freeze Time.zone.local(2018, 9, 27, 21, 25) do
      regional_partner = create :regional_partner_with_summer_workshops, :with_apps_priority_deadline_date

      assert_equal "Contact Name", regional_partner.contact_name
      assert_equal "contact@code.org", regional_partner.contact_email

      summer_workshops = regional_partner.upcoming_summer_workshops
      assert_equal 1, summer_workshops.length
      assert_equal "Training building", summer_workshops[0][:location_name]
      assert_equal "CS Principles", summer_workshops[0][:course]
      assert_equal "December 27, 2018 - December 31, 2018", summer_workshops[0][:workshop_date_range_string]

      assert_equal WORKSHOP_APPLICATION_STATES[:currently_open], regional_partner.summer_workshops_application_state
      assert_equal "September 25, 2018", regional_partner.summer_workshops_earliest_apps_open_date
      assert_nil regional_partner.link_to_partner_application

      assert_equal "October  2, 2018", regional_partner.upcoming_priority_deadline_date
    end
  end

  test 'regional_partner_summer_workshop_open_custom_link' do
    regional_partner = create :regional_partner_illinois

    assert_equal WORKSHOP_APPLICATION_STATES[:currently_open], regional_partner.summer_workshops_application_state
    assert_equal "https://code.org/specific-link", regional_partner.link_to_partner_application
  end

  test 'regional_partner_summer_workshop_closed' do
    regional_partner = create :regional_partner_kentucky

    assert_equal WORKSHOP_APPLICATION_STATES[:now_closed], regional_partner.summer_workshops_application_state
    assert_nil regional_partner.upcoming_priority_deadline_date
  end

  test 'regional_partner_summer_workshop_missing_information' do
    regional_partner = create :regional_partner_newjersey

    assert_nil regional_partner.contact_name
    assert_nil regional_partner.contact_email

    assert_equal WORKSHOP_APPLICATION_STATES[:opening_sometime], regional_partner.summer_workshops_application_state
  end

  test 'regional_partner_summer_workshop_opening_on_date' do
    regional_partner = create :regional_partner_oregon

    assert_equal WORKSHOP_APPLICATION_STATES[:opening_at], regional_partner.summer_workshops_application_state
  end

  test 'regional_partner_summer_workshop_opening_on_date_for_csd_only' do
    regional_partner = create :regional_partner_wyoming

    assert_equal WORKSHOP_APPLICATION_STATES[:opening_at], regional_partner.summer_workshops_application_state
  end
end
