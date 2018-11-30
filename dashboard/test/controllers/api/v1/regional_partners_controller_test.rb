require 'test_helper'

class Api::V1::RegionalPartnersControllerTest < ActionController::TestCase
  COURSES = ['csd', 'csp']

  setup_all do
    @workshop_admin = create :workshop_admin
    @workshop_organizer = create :workshop_organizer
    @program_manager = create :teacher
    @regional_partner = create :regional_partner,
      program_managers: [@workshop_organizer, @program_manager],
      cohort_capacity_csd: 25,
      cohort_capacity_csp: 50

    @serializing_teacher = create(:teacher,
      school_info: create(
        :school_info,
        school: create(
          :school,
          name: 'Hogwarts'
        )
      )
    )
  end

  setup do
    Pd::Workshop.any_instance.stubs(:process_location) # don't actually call Geocoder service
  end

  [:index, :capacity].each do |action|
    test_redirect_to_sign_in_for action
    test_user_gets_response_for action, user: :user, response: :success
  end

  test 'index gets regional partners for user' do
    program_manager = create :teacher

    regional_partner_for_user = create :regional_partner, name: 'Regional Partner'
    regional_partner_for_user.program_manager = program_manager.id

    another_regional_partner_for_user = create :regional_partner, name: 'Another Regional Partner'
    another_regional_partner_for_user.program_manager = program_manager.id

    create :regional_partner, name: 'Other regional partner'

    sign_in program_manager

    get :index
    response = JSON.parse(@response.body)
    assert_equal [
      {'name' => 'Another Regional Partner', 'id' => another_regional_partner_for_user.id},
      {'name' => 'Regional Partner', 'id' => regional_partner_for_user.id}
    ], response
  end

  test 'index gets all regional partners for workshop admin' do
    regional_partner = create :regional_partner, name: 'New regional partner'
    sign_in (create :workshop_admin)

    get :index
    response = JSON.parse(@response.body)
    assert_equal RegionalPartner.count, response.length
    assert response.include?({'id' => regional_partner.id, 'name' => regional_partner.name})
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'capacity as a workshop organizer returns regional partner cohort capacity for teacher applications' do
    time = Date.new(2017, 3, 15)

    Timecop.freeze(time) do
      application = create(
        :pd_teacher1819_application,
        course: 'csp',
        regional_partner: @regional_partner,
        user: @serializing_teacher,
      )

      application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
      application.status = 'accepted'
      application.save!
      application.lock!

      sign_in @workshop_organizer
      get :capacity, params: {role: 'csp_teachers'}
      assert_response :success

      assert_equal(50, JSON.parse(@response.body)['capacity'])
    end
  end

  # TODO: remove this test when workshop_organizer is deprecated
  test 'capacity as a workshop organizer returns nil regional partner cohort capacity for facilitator applications' do
    time = Date.new(2017, 3, 15)

    Timecop.freeze(time) do
      application = create(
        :pd_facilitator1819_application,
        course: 'csp',
        regional_partner: @regional_partner,
        user: @serializing_teacher
      )

      application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
      application.status = 'accepted'
      application.save!
      application.lock!

      sign_in @workshop_organizer
      get :capacity, params: {role: 'csp_facilitators'}
      assert_response :success

      assert_nil JSON.parse(@response.body)['capacity']
    end
  end

  test 'capacity returns regional partner cohort capacity for teacher applications' do
    time = Date.new(2017, 3, 15)

    Timecop.freeze(time) do
      application = create(
        :pd_teacher1819_application,
        course: 'csp',
        regional_partner: @regional_partner,
        user: @serializing_teacher,
      )

      application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
      application.status = 'accepted'
      application.save!
      application.lock!

      sign_in @program_manager
      get :capacity, params: {role: 'csp_teachers'}
      assert_response :success

      assert_equal(50, JSON.parse(@response.body)['capacity'])
    end
  end

  test 'capacity returns nil regional partner cohort capacity for facilitator applications' do
    time = Date.new(2017, 3, 15)

    Timecop.freeze(time) do
      application = create(
        :pd_facilitator1819_application,
        course: 'csp',
        regional_partner: @regional_partner,
        user: @serializing_teacher
      )

      application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
      application.status = 'accepted'
      application.save!
      application.lock!

      sign_in @program_manager
      get :capacity, params: {role: 'csp_facilitators'}
      assert_response :success

      assert_nil JSON.parse(@response.body)['capacity']
    end
  end

  test 'capacity returns nil cohort capacity for all applications filter' do
    time = Date.new(2017, 3, 15)

    Timecop.freeze(time) do
      application = create(
        :pd_teacher1819_application,
        course: 'csp',
        regional_partner: @regional_partner,
        user: @serializing_teacher,
      )

      application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
      application.status = 'accepted'
      application.save!
      application.lock!

      sign_in @workshop_admin
      get :capacity, params: {role: 'csp_teachers', regional_partner_value: 'all'}
      assert_response :success

      assert_nil JSON.parse(@response.body)['capacity']
    end
  end

  test 'capacity returns nil cohort capacity for unmatched applications filter' do
    time = Date.new(2017, 3, 15)

    Timecop.freeze(time) do
      application = create(
        :pd_teacher1819_application,
        course: 'csp',
        regional_partner: @regional_partner,
        user: @serializing_teacher,
      )

      application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
      application.status = 'accepted'
      application.save!
      application.lock!

      sign_in @workshop_admin
      get :capacity, params: {role: 'csp_teachers', regional_partner_value: 'none'}
      assert_response :success

      assert_nil JSON.parse(@response.body)['capacity']
    end
  end

  test 'capacity returns cohort capacity for admin with regional partner filter' do
    time = Date.new(2017, 3, 15)

    Timecop.freeze(time) do
      application = create(
        :pd_teacher1819_application,
        course: 'csd',
        regional_partner: @regional_partner,
        user: @serializing_teacher,
      )

      application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
      application.status = 'accepted'
      application.save!
      application.lock!

      sign_in @workshop_admin
      get :capacity, params: {role: 'csd_teachers', regional_partner_value: @regional_partner.id}
      assert_response :success

      assert_equal(25, JSON.parse(@response.body)['capacity'])
    end
  end

  test 'capacity returns nil for non workshop admin with no regional partners' do
    sign_in create(:admin)

    get :capacity, params: {role: 'csd_teachers', regional_partner_value: 'all'}
    assert_response :success
    assert_nil JSON.parse(@response.body)['capacity']
  end

  test 'show regional partner summer workshops for valid partner ID' do
    regional_partner = create :regional_partner_beverly_hills

    get :show, partner_id: regional_partner.id
    assert_response :success
    assert_equal regional_partner.contact_name, JSON.parse(@response.body)['contact_name']
  end

  test 'show regional partner summer workshops for invalid partner ID' do
    get :show, partner_id: "YY"
    assert_response :success
    assert_equal "no_partner", JSON.parse(@response.body)['error']
  end

  test 'find regional partner summer workshops for specific zip' do
    Geocoder.expects(:search).never

    regional_partner = create :regional_partner_beverly_hills

    get :find, zip_code: 90210
    assert_response :success
    assert_equal regional_partner.contact_name, JSON.parse(@response.body)['contact_name']
  end

  test 'find regional partner summer workshops for state fallback' do
    mock_illinois_object = OpenStruct.new(state_code: "IL")
    Geocoder.expects(:search).returns([mock_illinois_object])

    regional_partner = create :regional_partner_illinois

    get :find, zip_code: 60415
    assert_response :success
    assert_equal regional_partner.contact_name, JSON.parse(@response.body)['contact_name']
  end

  test 'find no regional partner summer workshops for a state' do
    mock_washington_object = OpenStruct.new(state_code: "WA")
    Geocoder.expects(:search).returns([mock_washington_object])

    get :find, zip_code: 98104
    assert_response :success
    assert_equal "no_partner", JSON.parse(@response.body)['error']
  end

  test 'find no regional partner summer workshops for invalid ZIP code' do
    get :find, zip_code: "XX"
    assert_response :success
    assert_equal "no_state", JSON.parse(@response.body)['error']
  end
end
