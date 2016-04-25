require 'test_helper'

class TransfersControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @teacher = create(:teacher)
    sign_in(@teacher)

    @word_section = create(:section, user: @teacher, login_type: 'word')
    @word_user_1 = create(:follower, section: @word_section).student_user

    @picture_section = create(:section, user: @teacher, login_type: 'picture')
    @picture_user_1 = create(:follower, section: @word_section).student_user
  end

  test "returns an error when student ids are not provided" do
    post :create, new_section_code: @picture_section.code, current_section_code: @word_section.code, stay_enrolled_in_current_section: false
    assert_response 400
    assert_equal "Please provide student_ids.", json_response["error"]
  end

  test "returns an error when the section id is invalid" do
    code = "QWERTY"
    post :create, new_section_code: code, student_ids: @word_user_1.id.to_s, current_section_code: @word_section.code, stay_enrolled_in_current_section: false

    assert_response 404
    assert_equal "Sorry, but section #{code} does not exist. Please enter a different section code.", json_response["error"]
  end

  test "returns an error when the current_section_code is not provided" do
    post :create, new_section_code: @picture_section.code, student_ids: @word_user_1.id.to_s, stay_enrolled_in_current_section: false
    assert_response 400
    assert_equal "Please provide current_section_code.", json_response["error"]
  end

  test "returns an error when stay_enrolled_in_current_section is not provided and a student is being transferred to another teacher" do
    new_teacher = create(:teacher)
    new_section = create(:section, user: new_teacher, login_type: 'word')

    post :create, new_section_code: new_section.code, student_ids: @word_user_1.id.to_s, current_section_code: @word_section.code
    assert_response 400
    assert_equal "Please provide stay_enrolled_in_current_section.", json_response["error"]
  end

  test "returns an error when the current_section_code is invalid" do
    invalid_section_code = "QWERTY"

    post :create, new_section_code: @picture_section.code, student_ids: @word_user_1.id.to_s, current_section_code: invalid_section_code, stay_enrolled_in_current_section: false
    assert_response 404
    assert_equal "Sorry, but section #{invalid_section_code} does not exist. Please enter a different section code.", json_response["error"]
  end

  test "returns an error when one of the student_ids is invalid" do
    new_section = create(:section, user: create(:teacher), login_type: 'word')
    student_ids = [@word_user_1.id, -100].join(',')
    post :create, new_section_code: new_section.code, student_ids: student_ids, current_section_code: @word_section.code, stay_enrolled_in_current_section: true
    assert_response 404, json_response["error"]
  end

  test "transferring without logging in fails" do
    sign_out(@teacher)
    post :create, new_section_code: @picture_section.code, student_ids: @word_user_1.id.to_s

    # Ergh, Devise will return a 302 instead of a 401 because of the way
    # this route is set up
    assert_response 302
  end

  test "students should stay enrolled in the current section if stay_enrolled_in_current_section is true" do
    new_section = create(:section, user: create(:teacher), login_type: 'word')

    post :create, new_section_code: new_section.code, student_ids: @word_user_1.id.to_s, current_section_code: @word_section.code, stay_enrolled_in_current_section: true
    assert Follower.exists?(student_user: @word_user_1, section: @word_section)
  end

  test "students should no longer be in the current section if stay_enrolled_in_current_section is false" do
    post :create, new_section_code: @picture_section.code, student_ids: @word_user_1.id.to_s, current_section_code: @word_section.code, stay_enrolled_in_current_section: false
    assert_not Follower.exists?(student_user: @word_user_1, section: @word_section)
  end

  test "transferring to the same section does nothing" do
    post :create, new_section_code: @word_section.code, student_ids: @word_user_1.id.to_s
    assert Follower.exists?(student_user: @word_user_1, section: @word_section)
  end

  test "transferring a student to a section owned by a teacher the student "\
       "already follows causes the student to transfer sections under that teacher" do
    post :create, new_section_code: @picture_section.code, student_ids: @word_user_1.id.to_s
    assert_not Follower.exists?(student_user: @picture_user_1, section: @picture_section)
  end

  test "transferring to a new teacher causes a student to join the section" do
    new_teacher = create(:teacher)
    new_word_section = create(:section, user: new_teacher, login_type: 'word')

    post :create, new_section_code: new_word_section.code, student_ids: @word_user_1.id.to_s, current_section_code: @word_section.code, stay_enrolled_in_current_section: false
    assert Follower.exists?(student_user: @word_user_1, section: new_word_section)
  end

  test "transferring to a new teacher does not modify existing sections for a student" do
    new_teacher = create(:teacher)
    new_word_section = create(:section, user: new_teacher, login_type: 'word')

    post :create, new_section_code: new_word_section.code, student_ids: @word_user_1.id.to_s

    assert Follower.exists?(student_user: @word_user_1, section: @word_section)
  end

  test "transferring a student with a messed up email succeeds" do
    @picture_user_1.update_attribute(:email, '')
    @picture_user_1.update_attribute(:hashed_email, '')

    post :create, new_section_code: @word_section.code, student_ids: @picture_user_1.id.to_s

    assert Follower.exists?(student_user: @picture_user_1, section: @word_section)
  end

  test "all students can be transferred successfully" do
    new_teacher = create(:teacher)
    new_section = create(:section, user: new_teacher, login_type: 'word')

    new_student = create(:student)
    Follower.create!(user_id: @picture_section.user_id, student_user: new_student, section: @picture_section)

    student_ids = [new_student, @picture_user_1].map(&:id).join(',')
    post :create, new_section_code: new_section.code, student_ids: student_ids, current_section_code: @picture_section.code, stay_enrolled_in_current_section: true

    assert Follower.exists?(student_user: new_student, section: new_section)
    assert Follower.exists?(student_user: @picture_user_1, section: new_section)
  end

  test "students cannot be transferred to other teachers if they already belong to a section belonging to the other teacher" do
    new_teacher = create(:teacher)
    enrolled_section = create(:section, user: new_teacher, login_type: 'word')
    new_section_to_transfer_to = create(:section, user: new_teacher, login_type: 'word')

    Follower.create!(user_id: enrolled_section.user_id, student_user: @word_user_1, section: enrolled_section)

    student_ids = [@word_user_1].map(&:id).join(',')
    post :create, new_section_code: new_section_to_transfer_to.code, student_ids: student_ids, current_section_code: @word_section.code, stay_enrolled_in_current_section: true

    assert_response 400
    assert_equal "You cannot move these students because this teacher already has them in another section.", json_response["error"]
  end

  test "current_section_code not required for students transferring within the same teacher" do
    new_student = create(:student)

    Follower.create!(user_id: @picture_section.user_id, student_user: new_student, section: @picture_section)

    student_ids = [new_student].map(&:id).join(',')
    post :create, new_section_code: @word_section.code, student_ids: student_ids, current_section_code: @picture_section.code

    assert_response 204
  end

  test "current section must belong to current user" do
    new_section = create(:section, user: create(:teacher), login_type: 'word')
    new_student = create(:student)

    student_ids = [new_student].map(&:id).join(',')
    post :create, new_section_code: @word_section.code, student_ids: student_ids, current_section_code: new_section.code, stay_enrolled_in_current_section: true

    assert_response 403
    assert_equal "You cannot move students from a section that does not belong to you.", json_response["error"]
  end
end
