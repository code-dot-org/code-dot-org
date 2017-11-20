require 'test_helper'

class MakerControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @teacher = create :teacher
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
end
