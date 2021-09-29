require 'test_helper'

class Api::V1::RegionalPartnersControllerTest < ActionController::TestCase
  include Pd::SharedWorkshopConstants
  include Pd::Application::ActiveApplicationModels

  COURSES = ['csd', 'csp']

  self.use_transactional_test_case = true

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
    Pd::RegionalPartnerMapping.any_instance.stubs(:unique_region_to_partner) # skip uniqueness validations for easier testing
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
        :pd_teacher_application,
        course: 'csp',
        regional_partner: @regional_partner,
        user: @serializing_teacher,
      )

      application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
      application.status = 'accepted_not_notified'
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
        :pd_teacher_application,
        course: 'csp',
        regional_partner: @regional_partner,
        user: @serializing_teacher,
      )

      application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
      application.status = 'accepted_not_notified'
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
        :pd_teacher_application,
        course: 'csp',
        regional_partner: @regional_partner,
        user: @serializing_teacher,
      )

      application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
      application.status = 'accepted_not_notified'
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
        :pd_teacher_application,
        course: 'csp',
        regional_partner: @regional_partner,
        user: @serializing_teacher,
      )

      application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
      application.status = 'accepted_not_notified'
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
        :pd_teacher_application,
        course: 'csd',
        regional_partner: @regional_partner,
        user: @serializing_teacher,
      )

      application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
      application.status = 'accepted_not_notified'
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

    get :show, params: {partner_id: regional_partner.id}
    assert_response :success
    assert_equal regional_partner.contact_name, JSON.parse(@response.body)['contact_name']
  end

  test 'show regional partner summer workshops for invalid partner ID' do
    get :show, params: {partner_id: "YY"}
    assert_response :success
    assert_equal "no_partner", JSON.parse(@response.body)['error']
  end

  test 'find regional partner summer workshops for specific zip' do
    Geocoder.expects(:search).never

    regional_partner = create :regional_partner_beverly_hills

    get :find, params: {zip_code: 90210}
    assert_response :success
    assert_equal regional_partner.contact_name, JSON.parse(@response.body)['contact_name']
  end

  test 'find regional partner summer workshops for state fallback' do
    mock_illinois_object = OpenStruct.new(country_code: "US", state_code: "IL")
    Geocoder.expects(:search).returns([mock_illinois_object])

    regional_partner = create :regional_partner_illinois

    get :find, params: {zip_code: 60415}
    assert_response :success
    assert_equal regional_partner.contact_name, JSON.parse(@response.body)['contact_name']
  end

  test 'find no regional partner summer workshops for a state' do
    mock_washington_object = OpenStruct.new(country_code: "US", state_code: "WA")
    Geocoder.expects(:search).returns([mock_washington_object])

    get :find, params: {zip_code: 98104}
    assert_response :success
    assert_equal "no_partner", JSON.parse(@response.body)['error']
  end

  test 'find no regional partner summer workshops for invalid ZIP code' do
    get :find, params: {zip_code: "XX"}
    assert_response :success
    assert_equal "no_state", JSON.parse(@response.body)['error']
  end

  test 'find no regional partner summer workshops for non-existent ZIP code' do
    Geocoder.expects(:search).returns([])

    get :find, params: {zip_code: 11111}
    assert_response :success
    assert_equal "no_state", JSON.parse(@response.body)['error']
  end

  test 'program manager gets partner enrollment count' do
    sign_in @program_manager

    get :enrolled, params: {role: 'csd_teachers', regional_partner_value: nil}
    result = JSON.parse(@response.body)

    assert_response :success

    # A non-nil result means regional_partner_value was automatically figured out from the server side.
    assert_equal 0, result['enrolled']
  end

  test 'get partner enrollment count' do
    # For each type of workshop "role", create a workshop of that role
    # with number of enrollments equal to the role index
    application_year = APPLICATION_CURRENT_YEAR.split('-').first.to_i
    application_year_start_date = Date.new(application_year, 6, 1)

    Api::V1::Pd::ApplicationsController::ROLES.each_with_index do |role, index|
      course, subject =
        case role
        when :csf_facilitators
          [COURSE_CSF, SUBJECT_CSF_FIT]
        when :csd_facilitators
          [COURSE_CSD, SUBJECT_CSD_FIT]
        when :csp_facilitators
          [COURSE_CSP, SUBJECT_CSP_FIT]
        when :csd_teachers
          [COURSE_CSD, SUBJECT_CSD_SUMMER_WORKSHOP]
        when :csp_teachers
          [COURSE_CSP, SUBJECT_CSP_SUMMER_WORKSHOP]
        end

      create :workshop,
        course: course,
        subject: subject,
        enrolled_unattending_users: index,
        sessions_from: application_year_start_date,
        regional_partner: @regional_partner
    end

    Api::V1::Pd::ApplicationsController::ROLES.each_with_index do |role, index|
      result = @controller.send :get_partner_enrollment_count, @regional_partner.id, role.to_s
      assert_equal index, result, "Wrong enrollment count for role #{role}"
    end
  end
end
