require 'test_helper'

class MakerControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @student = create :student
    @teacher = create :teacher
    @admin = create :admin
    @school = create :school

    @csd_2017 = ensure_course Script::CSD_2017
    @csd_2018 = ensure_course Script::CSD_2018
    @csd_2019 = ensure_course Script::CSD_2019
    @csd6_2017 = ensure_script Script::CSD6_NAME
    @csd6_2018 = ensure_script Script::CSD6_2018_NAME
    @csd6_2019 = ensure_script Script::CSD6_2019_NAME
  end

  test_redirect_to_sign_in_for :home

  test "home loads for student" do
    sign_in @student

    get :home

    assert_response :success
    assert_select '#maker-home'
  end

  test "home loads for teacher" do
    sign_in @teacher

    get :home

    assert_response :success
    assert_select '#maker-home'
  end

  test "shows CSD6-2019 when there are no relevant assignments" do
    assert_empty @student.scripts
    assert_empty @student.section_courses
    assert_nil @student.user_script_with_most_recent_progress

    assert_equal @csd6_2019, MakerController.maker_script(@student)
  end

  test "assignment should take precedence over progress in a script" do
    create :user_script, user: @student, script: @csd6_2019
    create :follower, section: create(:section, course: @csd_2017), student_user: @student

    assert_equal @csd6_2017, MakerController.maker_script(@student)
  end

  test "shows CSD6-2019 if CSD6-2019 is assigned" do
    create :user_script, user: @student, script: @csd6_2019, assigned_at: Time.now
    assert_includes @student.scripts, @csd6_2019

    assert_equal @csd6_2019, MakerController.maker_script(@student)
  end

  test "shows CSD6-2018 if CSD6-2018 is assigned" do
    create :user_script, user: @student, script: @csd6_2018, assigned_at: Time.now
    refute_includes @student.scripts, @csd6_2017
    assert_includes @student.scripts, @csd6_2018

    assert_equal @csd6_2018, MakerController.maker_script(@student)
  end

  test "shows CSD6-2017 if CSD6-2017 is assigned" do
    create :user_script, user: @student, script: @csd6_2017, assigned_at: Time.now
    assert_includes @student.scripts, @csd6_2017
    refute_includes @student.scripts, @csd6_2018

    assert_equal @csd6_2017, MakerController.maker_script(@student)
  end

  test "shows CSD6-2018 if both CSD6-2017 and CSD6-2018 are assigned" do
    create :user_script, user: @student, script: @csd6_2017, assigned_at: Time.now
    create :user_script, user: @student, script: @csd6_2018, assigned_at: Time.now
    assert_includes @student.scripts, @csd6_2017
    assert_includes @student.scripts, @csd6_2018

    assert_equal @csd6_2018, MakerController.maker_script(@student)
  end

  test "shows CSD6-2019 if both CSD6-2018 and CSD6-2019 are assigned" do
    create :user_script, user: @student, script: @csd6_2018, assigned_at: Time.now
    create :user_script, user: @student, script: @csd6_2019, assigned_at: Time.now
    assert_includes @student.scripts, @csd6_2018
    assert_includes @student.scripts, @csd6_2019

    assert_equal @csd6_2019, MakerController.maker_script(@student)
  end

  test "shows CSD6-2019 if CSD-2019 is assigned" do
    create :follower, section: create(:section, course: @csd_2019), student_user: @student
    assert_includes @student.section_courses, @csd_2019

    assert_equal @csd6_2019, MakerController.maker_script(@student)
  end

  test "shows CSD6-2018 if CSD-2018 is assigned" do
    create :follower, section: create(:section, course: @csd_2018), student_user: @student
    refute_includes @student.section_courses, @csd_2017
    assert_includes @student.section_courses, @csd_2018

    assert_equal @csd6_2018, MakerController.maker_script(@student)
  end

  test "shows CSD6-2017 if CSD-2017 is assigned" do
    create :follower, section: create(:section, course: @csd_2017), student_user: @student
    assert_includes @student.section_courses, @csd_2017
    refute_includes @student.section_courses, @csd_2018

    assert_equal @csd6_2017, MakerController.maker_script(@student)
  end

  test "shows CSD6-2018 if both CSD-2017 and CSD-2018 are assigned" do
    create :follower, section: create(:section, course: @csd_2017), student_user: @student
    create :follower, section: create(:section, course: @csd_2018), student_user: @student
    @student.reload
    assert_includes @student.section_courses, @csd_2017
    assert_includes @student.section_courses, @csd_2018

    assert_equal @csd6_2018, MakerController.maker_script(@student)
  end

  test "shows CSD6-2018 if both CSD6-2017 and CSD-2018 are assigned" do
    create :follower, section: create(:section, script: @csd6_2017), student_user: @student
    create :follower, section: create(:section, course: @csd_2018), student_user: @student
    @student.reload
    assert_includes @student.scripts, @csd6_2017
    refute_includes @student.section_courses, @csd_2017
    refute_includes @student.scripts, @csd6_2018
    assert_includes @student.section_courses, @csd_2018

    assert_equal @csd6_2018, MakerController.maker_script(@student)
  end

  test "shows CSD6-2018 if both CSD-2017 and CSD6-2018 are assigned" do
    create :follower, section: create(:section, course: @csd_2017), student_user: @student
    create :follower, section: create(:section, script: @csd6_2018), student_user: @student
    assert_includes @student.section_scripts, @csd6_2018
    refute_includes @student.scripts, @csd6_2017
    assert_includes @student.section_courses, @csd_2017
    assert_includes @student.scripts, @csd6_2018
    refute_includes @student.section_courses, @csd_2018

    assert_equal @csd6_2018, MakerController.maker_script(@student)
  end

  test "apply: fails if unit_6_intention not provided" do
    sign_in @teacher
    assert_raises ActionController::ParameterMissing do
      post :apply
    end
  end

  test "apply: fails if user doesn't have an application" do
    sign_in @teacher
    post :apply, params: {unit_6_intention: 'no'}
    assert_response :not_found
  end

  test "apply: fails if school doesn't meet eligibility requirements" do
    sign_in @teacher
    create :circuit_playground_discount_application,
      user: @teacher,
      school: @school,
      full_discount: false # This should be true before submitting a unit 6 intention

    CircuitPlaygroundDiscountApplication.stubs(:studio_person_pd_eligible?).returns(true)
    CircuitPlaygroundDiscountApplication.stubs(:student_progress_eligible?).returns(true)

    post :apply, params: {unit_6_intention: 'no'}
    assert_response :forbidden
  end

  test "apply: fails if teacher doesn't meet eligibility requirements" do
    sign_in @teacher
    create :circuit_playground_discount_application,
      user: @teacher,
      school: @school,
      full_discount: true

    # These should be true before submitting a unit 6 intention
    CircuitPlaygroundDiscountApplication.stubs(:studio_person_pd_eligible?).returns(false)
    CircuitPlaygroundDiscountApplication.stubs(:student_progress_eligible?).returns(false)

    post :apply, params: {unit_6_intention: 'no'}
    assert_response :forbidden
  end

  test "apply: fails if nonsense unit_6_intention provided" do
    sign_in @teacher
    create :circuit_playground_discount_application,
      user: @teacher,
      school: @school,
      full_discount: true

    CircuitPlaygroundDiscountApplication.stubs(:studio_person_pd_eligible?).returns(true)
    CircuitPlaygroundDiscountApplication.stubs(:student_progress_eligible?).returns(true)

    assert_raises ArgumentError do
      post :apply, params: {unit_6_intention: 'not an answer'}
    end
  end

  test "apply: updates the application with the intention" do
    sign_in @teacher
    application = create :circuit_playground_discount_application,
      user: @teacher,
      school: @school,
      full_discount: true

    assert_nil application.unit_6_intention

    CircuitPlaygroundDiscountApplication.stubs(:studio_person_pd_eligible?).returns(true)
    CircuitPlaygroundDiscountApplication.stubs(:student_progress_eligible?).returns(true)

    post :apply, params: {unit_6_intention: 'no'}
    assert_response :success

    application.reload
    assert_equal 'no', application.unit_6_intention
  end

  test "schoolchoice: fails if no school id provided" do
    sign_in @teacher

    assert_raises ActionController::ParameterMissing do
      post :schoolchoice
    end
  end

  test "schoolchoice: fails if given a bad school_id" do
    sign_in @teacher

    assert_raises ActiveRecord::RecordNotFound do
      post :schoolchoice, params: {nces: 'asdf'}
    end
  end

  test "schoolchoice: fails if user already has an application with a selected school" do
    sign_in @teacher
    create :circuit_playground_discount_application,
      user: @teacher,
      school: @school,
      full_discount: true

    post :schoolchoice, params: {nces: @school.id}
    assert_response :forbidden
  end

  test "schoolchoice: Creates an application" do
    sign_in @teacher

    assert_creates CircuitPlaygroundDiscountApplication do
      post :schoolchoice, params: {nces: @school.id}
      assert_response :success
      expected = {"full_discount" => false}
      assert_equal expected, JSON.parse(@response.body)
    end
  end

  test "complete: fails if not given a signature" do
    DCDO.stubs(:get).with('currently_distributing_discount_codes', false).returns(true)
    sign_in @teacher

    assert_raises ActionController::ParameterMissing do
      post :complete, params: {nces: 'asdf'}
    end
  end

  test "complete: fails if user doesnt have application" do
    DCDO.stubs(:get).with('currently_distributing_discount_codes', false).returns(true)
    sign_in @teacher
    post :complete, params: {signature: "My Name"}
    assert_response :not_found
  end

  test "complete: fails if application not in the right state" do
    DCDO.stubs(:get).with('currently_distributing_discount_codes', false).returns(true)
    sign_in @teacher

    # no intention to teach unit 6
    application = create :circuit_playground_discount_application,
      user_id: @teacher.id,
      unit_6_intention: 'no'
    post :complete, params: {signature: "My Name"}
    assert_response :forbidden

    # intend to teach unit 6, but has not confirmed school
    application.update!(unit_6_intention: 'yes1819')
    post :complete, params: {signature: "My Name"}
    assert_response :forbidden

    # has confirmed school, but already has a code
    application.update!(school_id: @school.id, circuit_playground_discount_code_id: 123)
    post :complete, params: {signature: "My Name"}
    assert_response :forbidden
  end

  test "complete: returns a new code" do
    DCDO.stubs(:get).with('currently_distributing_discount_codes', false).returns(true)
    sign_in @teacher

    create :circuit_playground_discount_application,
      user: @teacher,
      school: @school,
      unit_6_intention: 'yes1819',
      full_discount: true
    code = create :circuit_playground_discount_code

    post :complete, params: {signature: "My name"}
    assert_response :success
    expected = {code: code.code, expiration: code.expiration}.to_json
    assert_equal expected, @response.body
  end

  test "complete: works after admin override" do
    DCDO.stubs(:get).with('facilitator_ids_eligible_for_maker_discount', []).returns([])
    DCDO.stubs(:get).with('currently_distributing_discount_codes', false).returns(true)
    sign_in @admin

    post :override, params: {user: @teacher.id, full_discount: true}
    assert_response :success
    sign_out @admin

    create :circuit_playground_discount_code

    sign_in @teacher
    post :complete, params: {signature: "My name"}
    assert_response :success
  end

  test "application_status: fails if not admin" do
    sign_in @teacher

    get :application_status, params: {user: @teacher.id}
    assert_response :forbidden
  end

  test "application_status: works for user without in progress application" do
    sign_in @admin

    get :application_status, params: {user: @teacher.id}
    assert_response :success
    refute_nil JSON.parse(@response.body)['application']
    # actual contents tested in CircuitPlaygroundDiscountApplication tests
  end

  test "application_status: works for user with in progress application" do
    sign_in @admin

    create :circuit_playground_discount_application,
      user_id: @teacher.id,
      unit_6_intention: 'yes1819',
      school_id: @school.id,
      full_discount: true

    get :application_status, params: {user: @teacher.id}
    assert_response :success
    refute_nil JSON.parse(@response.body)['application']
    # actual contents tested in CircuitPlaygroundDiscountApplication tests
  end

  test "override: fails if not admin" do
    sign_in @teacher

    post :override, params: {user: @teacher.id, full_discount: true}
    assert_response :forbidden
  end

  test "override: can override discount for a user that has not started an application" do
    sign_in @admin

    assert_equal 0, CircuitPlaygroundDiscountApplication.where(user_id: @teacher.id).length

    post :override, params: {user: @teacher.id, full_discount: true}
    assert_response :success
    expected = {
      "application" => {
        "is_pd_eligible" => false,
        "is_progress_eligible" => false,
        "user_school" => {
          "id" => nil,
          "name" => nil,
          "high_needs" => nil,
        },
        "application_school" => {
          "id" => nil,
          "name" => nil,
          "high_needs" => nil,
        },
        "unit_6_intention" => nil,
        "full_discount" => true,
        "admin_set_status" => true,
        "discount_code" => nil,
      }
    }
    assert_equal expected, JSON.parse(@response.body)

    assert_equal 1, CircuitPlaygroundDiscountApplication.where(user_id: @teacher.id).length
  end

  test "override: can update an existing application that does not yet have a code" do
    sign_in @admin

    # Application in which user has answered question about unit6 intentions, but
    # has not yet confirmed school
    create :circuit_playground_discount_application,
      user_id: @teacher.id,
      unit_6_intention: 'yes1819'
    post :override, params: {user: @teacher.id, full_discount: true}
    assert_response :success
    expected = {
      "application" => {
        "is_pd_eligible" => false,
        "is_progress_eligible" => false,
        "user_school" => {
          "id" => nil,
          "name" => nil,
          "high_needs" => nil,
        },
        "application_school" => {
          "id" => nil,
          "name" => nil,
          "high_needs" => nil,
        },
        "unit_6_intention" => "yes1819",
        "full_discount" => true,
        "admin_set_status" => true,
        "discount_code" => nil,
      }
    }
    assert_equal expected, JSON.parse(@response.body)

    assert_equal 1, CircuitPlaygroundDiscountApplication.where(user_id: @teacher.id).length
  end

  private

  def ensure_script(script_name)
    Script.find_by_name(script_name) ||
      create(:script, name: script_name).tap do |script|
        create :script_level, script: script
      end
  end

  def ensure_course(course_name)
    Course.find_by_name(course_name) ||
      create(:course, name: course_name)
  end
end
