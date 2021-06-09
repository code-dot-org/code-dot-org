require 'test_helper'

class TransfersControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  # As we no longer generate codes with vowels, this code should not already
  # exist in the test DB.
  NONEXISTENT_SECTION_CODE = 'AEIOUY'.freeze

  setup do
    @teacher = create(:teacher)
    sign_in(@teacher)

    @word_section = create(:section, user: @teacher, login_type: 'word')
    @word_student = create(:follower, section: @word_section).student_user

    @picture_section = create(:section, user: @teacher, login_type: 'picture')
    @picture_student = create(:follower, section: @picture_section).student_user

    @params = {
      student_ids: [@word_student.id],
      current_section_code: @word_section.code,
      new_section_code: @picture_section.code,
      stay_enrolled_in_current_section: true
    }

    @other_teacher = create :teacher
    @other_teacher_section = create :section, user: @other_teacher, login_type: 'word'
  end

  test "returns an error when student ids are not provided" do
    @params.delete(:student_ids)
    post :create, params: @params
    assert_response :bad_request
    assert_equal "Please provide student_ids.", json_response["error"]
  end

  test "returns an error when stay_enrolled_in_current_section is not provided" do
    @params.delete(:stay_enrolled_in_current_section)
    post :create, params: @params
    assert_response :bad_request
  end

  test "returns an error when new_section_code is not provided" do
    @params.delete(:new_section_code)
    post :create, params: @params
    assert_response :bad_request
  end

  test "returns an error when current_section_code is not provided" do
    @params.delete(:current_section_code)
    post :create, params: @params
    assert_response :bad_request
  end

  test "returns an error when new_section_code does not exist" do
    @params[:new_section_code] = NONEXISTENT_SECTION_CODE
    post :create, params: @params
    assert_response :not_found
    assert_equal(
      "Sorry, but section #{NONEXISTENT_SECTION_CODE} does not exist. Please "\
        "enter a different section code.",
      json_response["error"]
    )
  end

  test "returns an error when the new_section_code belongs to a google classroom section" do
    google_classroom_section = create(:section, user: @teacher, login_type: 'google_classroom')

    @params[:new_section_code] = google_classroom_section.code
    post :create, params: @params
    assert_response :bad_request
    assert_equal(
      "You cannot move students to a section that is synced with a third party tool.",
      json_response["error"]
    )
  end

  test "returns an error when the new_section_code belongs to a clever section" do
    clever_section = create(:section, user: @teacher, login_type: 'clever')

    @params[:new_section_code] = clever_section.code
    post :create, params: @params
    assert_response :bad_request
    assert_equal(
      "You cannot move students to a section that is synced with a third party tool.",
      json_response["error"]
    )
  end

  test "returns an error when the current_section_code does not exist" do
    @params[:current_section_code] = NONEXISTENT_SECTION_CODE

    post :create, params: @params
    assert_response :not_found
    assert_equal(
      "Sorry, but section #{NONEXISTENT_SECTION_CODE} does not exist. Please "\
        "enter a different section code.",
      json_response["error"]
    )
  end

  test "returns an error when one of the student_ids does not exist" do
    student_ids_with_invalid = [@word_student.id, User.last.id + 1]
    @params[:student_ids] = student_ids_with_invalid
    post :create, params: @params
    assert_response :not_found
  end

  test "transferring without logging in fails" do
    # TODO(asher): Make this test confirm that the transfer did not occur. Alternately, fix the
    # controller to do something saner.
    sign_out(@teacher)
    post :create, params: @params

    # Ergh, Devise will return a :found instead of a 401 because of the way
    # this route is set up
    assert_response :found
  end

  test "when the new section belongs to the same teacher, students should no longer be in the current section if stay_enrolled_in_current_section is false" do
    @params[:stay_enrolled_in_current_section] = false
    post :create, params: @params
    assert_response :no_content
    refute Follower.exists?(student_user: @word_student, section: @word_section)
  end

  test "when the new section belongs to a different teacher, students should stay enrolled in the current section if stay_enrolled_in_current_section is true" do
    @params[:new_section_code] = @other_teacher_section.code
    @params[:stay_enrolled_in_current_section] = true
    post :create, params: @params
    assert_response :no_content
    assert Follower.exists?(student_user: @word_student, section: @word_section)
  end

  test "when the new section belongs to a different teacher, students should no longer be in the current section if stay_enrolled_in_current_section is false" do
    @params[:new_section_code] = @other_teacher_section.code
    @params[:stay_enrolled_in_current_section] = false

    post :create, params: @params
    assert_response :no_content
    refute Follower.exists?(student_user: @word_student, section: @word_section)
  end

  test "transferring to the same section does nothing" do
    @params[:new_section_code] = @params[:current_section_code]
    post :create, params: @params
    assert_response :bad_request
    assert Follower.exists?(student_user: @word_student, section: @word_section)
  end

  test "transferring a student with a messed up email succeeds" do
    @word_student.update_attribute(:email, '')
    @word_student.update_attribute(:hashed_email, '')

    post :create, params: @params
    assert_response :no_content
    assert Follower.exists?(student_user: @word_student, section: @picture_section)
  end

  test "multiple students can be transferred" do
    new_student = create(:student)
    Follower.create!(
      user: @teacher,
      student_user: new_student,
      section: @word_section
    )

    @params[:student_ids] = [new_student.id, @word_student.id]
    post :create, params: @params

    assert_response :no_content
    assert Follower.exists?(student_user: new_student, section: @picture_section)
    assert Follower.exists?(student_user: @word_student, section: @picture_section)
  end

  test "students can be transferred to other teachers if they already belong to a section belonging to the other teacher" do
    already_enrolled_section = create(:section, user: @other_teacher, login_type: 'word')
    Follower.create!(
      user: @other_teacher,
      student_user: @word_student,
      section: already_enrolled_section
    )
    @params[:new_section_code] = @other_teacher_section.code

    assert_creates(Follower) do
      post :create, params: @params
      assert_response :no_content
    end
    assert Follower.find_by(section: @other_teacher_section, student_user: @word_student)
  end

  test "student cannot be transferred to another section if already in the section" do
    Follower.create! section: @picture_section, student_user: @word_student

    assert_does_not_create(Follower) do
      post :create, params: @params
      assert_response :bad_request
      assert_equal "You cannot move these students because they are already in the new section.",
        json_response["error"]
    end
  end

  test "students cannot be transferred to other soft-deleted teachers" do
    @other_teacher.destroy

    @params[:new_section_code] = @other_teacher_section.code
    @params[:stay_enrolled_in_current_section] = false
    post :create, params: @params

    assert_response :not_found
    assert_equal(
      "Sorry, but section #{@other_teacher_section.code} does not exist. "\
        "Please enter a different section code.",
      json_response['error']
    )
    assert Follower.exists?(student_user: @word_student, section: @word_section)
  end

  test "current section must belong to current user" do
    @word_section.update!(user: @other_teacher)

    post :create, params: @params
    assert_response :forbidden
  end

  test "returns an error when the new_section will be over it's section capacity" do
    500.times do
      create(:follower, section: @picture_section)
    end

    post :create, params: @params
    assert_response :forbidden
    assert_equal(
      "full",
      json_response["result"]
    )
  end
end
