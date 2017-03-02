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
      student_ids: @word_student.id.to_s,
      current_section_code: @word_section.code,
      new_section_code: @picture_section.code
    }

    @other_teacher = create :teacher
    @other_teacher_section = create :section, user: @other_teacher, login_type: 'word'
  end

  test "returns an error when student ids are not provided" do
    @params.delete(:student_ids)
    post :create, params: @params
    assert_response 400
    assert_equal "Please provide student_ids.", json_response["error"]
  end

  test "returns an error when new_section_code is invalid" do
    @params[:new_section_code] = NONEXISTENT_SECTION_CODE
    post :create, params: @params
    assert_response 404
    assert_equal(
      "Sorry, but section #{NONEXISTENT_SECTION_CODE} does not exist. Please "\
        "enter a different section code.",
      json_response["error"]
    )
  end

  test "returns an error when current_section_code is not provided" do
    @params.delete(:current_section_code)
    post :create, params: @params
    assert_response 400
    assert_equal "Please provide current_section_code.", json_response["error"]
  end

  test "returns an error when the current_section_code is invalid" do
    @params[:current_section_code] = NONEXISTENT_SECTION_CODE

    post :create, params: @params
    assert_response 404
    assert_equal(
      "Sorry, but section #{NONEXISTENT_SECTION_CODE} does not exist. Please "\
        "enter a different section code.",
      json_response["error"]
    )
  end

  test "returns an error when one of the student_ids is invalid" do
    student_ids_with_invalid = [@word_student.id, User.last.id + 1].join(',')
    @params[:student_ids] = student_ids_with_invalid
    post :create, params: @params
    assert_response 404
  end

  test "transferring without logging in fails" do
    sign_out(@teacher)
    post :create, params: @params

    # Ergh, Devise will return a 302 instead of a 401 because of the way
    # this route is set up
    assert_response 302
  end

  test "when the new section belongs to the same teacher, students should no longer be in the current section if stay_enrolled_in_current_section is false" do
    @params[:stay_enrolled_in_current_section] = false
    post :create, params: @params
    assert_response 204
    refute Follower.exists?(student_user: @word_student, section: @word_section)
  end

  test "when the new section belongs to the same teacher, students should no longer be in the current section even if stay_enrolled_in_current_section is true" do
    @params[:stay_enrolled_in_current_section] = true
    post :create, params: @params
    assert_response 204
    refute Follower.exists?(student_user: @word_student, section: @word_section)
  end

  test "transferring to a new teacher errors without stay_enrolled_in_current_section" do
    @params[:new_section_code] = @other_teacher_section.code
    post :create, params: @params
    assert_response 400
    assert Follower.exists?(
      student_user: @word_student,
      section: @word_section
    )
    refute Follower.exists?(
      student_user: @word_student,
      section: @other_teacher_section
    )
  end

  test "when the new section belongs to a different teacher, students should stay enrolled in the current section if stay_enrolled_in_current_section is true" do
    @params[:new_section_code] = @other_teacher_section.code
    @params[:stay_enrolled_in_current_section] = true
    post :create, params: @params
    assert_response 204
    assert Follower.exists?(student_user: @word_student, section: @word_section)
  end

  test "when the new section belongs to a different teacher, students should no longer be in the current section if stay_enrolled_in_current_section is false" do
    @params[:new_section_code] = @other_teacher_section.code
    @params[:stay_enrolled_in_current_section] = false

    post :create, params: @params
    assert_response 204
    refute Follower.exists?(student_user: @word_student, section: @word_section)
  end

  test "transferring to the same section does nothing" do
    @params[:new_section_code] = @params[:current_section_code]
    post :create, params: @params
    assert_response 400
    assert Follower.exists?(student_user: @word_student, section: @word_section)
  end

  # TODO(asher): Determine what the desired behavior is, uncommenting this test
  # or fixing the controller code appropriately.
  # test "transferring a student to a section owned by a teacher the student "\
  #      "already follows causes the student to transfer sections under that teacher" do
  #   existing_section = create :section, user: @other_teacher, login_type: 'word'
  #   Follower.create!(
  #     user: @other_teacher,
  #     student_user: @word_student,
  #     section: existing_section
  #   )
  #   @params[:new_section_code] = @other_teacher_section.code
  #   @params[:stay_enrolled_in_current_section] = false
  #   post :create, params: @params
  #
  #   assert_response 204
  #   refute Follower.exists?(student_user: @word_student, section: existing_section)
  #   assert Follower.exists?(student_user: @word_student, section: @other_teacher_section)
  # end

  test "transferring a student with a messed up email succeeds" do
    @word_student.update_attribute(:email, '')
    @word_student.update_attribute(:hashed_email, '')

    post :create, params: @params
    assert_response 204
    assert Follower.exists?(student_user: @word_student, section: @picture_section)
  end

  test "multiple students can be transferred" do
    new_student = create(:student)
    Follower.create!(
      user: @teacher,
      student_user: new_student,
      section: @word_section
    )

    @params[:student_ids] = "#{new_student.id},#{@word_student.id}"
    post :create, params: @params

    assert_response 204
    assert Follower.exists?(student_user: new_student, section: @picture_section)
    assert Follower.exists?(student_user: @word_student, section: @picture_section)
  end

  test "students cannot be transferred to other teachers if they already belong to a section belonging to the other teacher" do
    already_enrolled_section = create(:section, user: @other_teacher, login_type: 'word')
    Follower.create!(
      user: @other_teacher,
      student_user: @word_student,
      section: already_enrolled_section
    )
    @params[:new_section_code] = @other_teacher_section.code
    @params[:stay_enrolled_in_current_section] = false

    post :create, params: @params
    assert_response 400
    assert_equal(
      "You cannot move these students because this teacher already has them in another section.",
      json_response["error"]
    )
  end

  test "students cannot be transferred to other soft-deleted teachers" do
    @other_teacher.update!(deleted_at: DateTime.now)

    @params[:new_section_code] = @other_teacher_section.code
    @params[:stay_enrolled_in_current_section] = false
    post :create, params: @params

    assert_response 404
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
    assert_response 403
    assert_equal(
      "You cannot move students from a section that does not belong to you.",
      json_response["error"]
    )
  end
end
