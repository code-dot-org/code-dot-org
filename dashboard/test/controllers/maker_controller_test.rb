require 'test_helper'

class MakerControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @teacher = create :teacher
    @school = create :school
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
    CircuitPlaygroundDiscountApplication.create!(user_id: @teacher.id, unit_6_intention: 'yes1718', has_confirmed_school: true)

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
end
