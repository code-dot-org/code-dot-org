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
    @csd6_2017 = ensure_script Script::CSD6_NAME
    @csd6_2018 = ensure_script Script::CSD6_2018_NAME
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

  test "shows CSD6-2018 when there are no relevant assignments" do
    assert_empty @student.scripts
    assert_empty @student.section_courses
    assert_nil @student.user_script_with_most_recent_progress

    assert_equal @csd6_2018, MakerController.maker_script(@student)
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
    assert_includes @student.section_courses, @csd_2017
    assert_includes @student.section_courses, @csd_2018

    assert_equal @csd6_2018, MakerController.maker_script(@student)
  end

  test "shows CSD6-2018 if both CSD6-2017 and CSD-2018 are assigned" do
    create :user_script, user: @student, script: @csd6_2017, assigned_at: Time.now
    create :follower, section: create(:section, course: @csd_2018), student_user: @student
    assert_includes @student.scripts, @csd6_2017
    refute_includes @student.section_courses, @csd_2017
    refute_includes @student.scripts, @csd6_2018
    assert_includes @student.section_courses, @csd_2018

    assert_equal @csd6_2018, MakerController.maker_script(@student)
  end

  test "shows CSD6-2018 if both CSD-2017 and CSD6-2018 are assigned" do
    create :follower, section: create(:section, course: @csd_2017), student_user: @student
    create :user_script, user: @student, script: @csd6_2018, assigned_at: Time.now
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

  test "apply: fails if nonsense unit_6_intention provided" do
    sign_in @teacher

    CircuitPlaygroundDiscountApplication.stubs(:studio_person_pd_eligible?).returns(true)
    CircuitPlaygroundDiscountApplication.stubs(:student_progress_eligible?).returns(true)

    assert_raises ArgumentError do
      post :apply, params: {unit_6_intention: 'not an answer'}
    end
  end

  test "apply: fails if application already exists" do
    sign_in @teacher
    CircuitPlaygroundDiscountApplication.create!(user_id: @teacher.id, unit_6_intention: 'unsure')

    post :apply, params: {unit_6_intention: 'no'}
    assert_response :forbidden
  end

  test "apply: fails if teacher doesn't meet eligibility requirements" do
    sign_in @teacher

    post :apply, params: {unit_6_intention: 'no'}
    assert_response :forbidden
  end

  test "apply: creates a new CircuitPlaygroundDiscountApplication" do
    sign_in @teacher

    CircuitPlaygroundDiscountApplication.stubs(:studio_person_pd_eligible?).returns(true)
    CircuitPlaygroundDiscountApplication.stubs(:student_progress_eligible?).returns(true)

    post :apply, params: {unit_6_intention: 'no'}
    assert_response :success

    application = CircuitPlaygroundDiscountApplication.find_by_user_id(@teacher.id)
    assert application
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

  test "schoolchoice: fails if user doesnt have application" do
    sign_in @teacher
    post :schoolchoice, params: {nces: @school.id}
    assert_response :not_found
  end

  test "schoolchoice: fails if user not teaching unit 6" do
    sign_in @teacher
    CircuitPlaygroundDiscountApplication.create!(user_id: @teacher.id, unit_6_intention: 'unsure')

    post :schoolchoice, params: {nces: @school.id}
    assert_response :forbidden
  end

  test "schoolchoice: fails if already confirmed school" do
    sign_in @teacher
    CircuitPlaygroundDiscountApplication.create!(user_id: @teacher.id, unit_6_intention: 'yes1718', school_id: @school.id)

    post :schoolchoice, params: {nces: @school.id}
    assert_response :forbidden
  end

  test "schoolchoice: succeeds if user is teaching unit 6" do
    sign_in @teacher
    CircuitPlaygroundDiscountApplication.create!(user_id: @teacher.id, unit_6_intention: 'yes1718')

    post :schoolchoice, params: {nces: @school.id}
    assert_response :success
    expected = {"full_discount" => false}
    assert_equal expected, JSON.parse(@response.body)
  end

  test "complete: fails if not given a signature" do
    sign_in @teacher

    assert_raises ActionController::ParameterMissing do
      post :complete, params: {nces: 'asdf'}
    end
  end

  test "complete: fails if user doesnt have application" do
    sign_in @teacher
    post :complete, params: {signature: "My Name"}
    assert_response :not_found
  end

  test "complete: fails if application not in the right state" do
    sign_in @teacher

    # no intention to teach unit 6
    application = CircuitPlaygroundDiscountApplication.create!(user_id: @teacher.id, unit_6_intention: 'no')
    post :complete, params: {signature: "My Name"}
    assert_response :forbidden

    # intend to teach unit 6, but has not confirmed school
    application.update!(unit_6_intention: 'yes1718')
    post :complete, params: {signature: "My Name"}
    assert_response :forbidden

    # has confirmed school, but already has a code
    application.update!(school_id: @school.id, circuit_playground_discount_code_id: 123)
    post :complete, params: {signature: "My Name"}
    assert_response :forbidden
  end

  test "complete: returns a new code" do
    sign_in @teacher

    expiration = Time.now + 30.days
    CircuitPlaygroundDiscountApplication.create!(
      user_id: @teacher.id,
      unit_6_intention: 'yes1718',
      school_id: @school.id,
      full_discount: true
    )
    code = CircuitPlaygroundDiscountCode.create!(
      code: 'FAKE100_asdf123',
      full_discount: true,
      expiration: expiration
    )

    post :complete, params: {signature: "My name"}
    assert_response :success
    expected = {code: code.code, expiration: code.expiration}.to_json
    assert_equal expected, @response.body
  end

  test "complete: works after admin override" do
    sign_in @admin

    post :override, params: {user: @teacher.id, full_discount: true}
    assert_response :success
    sign_out @admin

    CircuitPlaygroundDiscountCode.create!(
      code: 'FAKE100_asdf123',
      full_discount: true,
      expiration: Time.now + 30.days
    )

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

    CircuitPlaygroundDiscountApplication.create!(
      user_id: @teacher.id,
      unit_6_intention: 'yes1718',
      school_id: @school.id,
      full_discount: true
    )

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
    CircuitPlaygroundDiscountApplication.create!(
      user_id: @teacher.id,
      unit_6_intention: 'yes1718',
    )
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
        "unit_6_intention" => "yes1718",
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
