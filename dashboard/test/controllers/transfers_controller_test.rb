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
    # post :create, section_id: @picture_session.id
  end

  test "returns an error when the section id is invalid" do
    # section_id = -100
    # post :create, section_id: section_id, student_ids: "#{word_user_1.id.to_s}"
  end

  test "returns an error when one of the student_ids is invalid" do
    # student_ids = [@word_user_1.id, -100].join(',')
    # post :create, section_id: @word_section.id, student_ids: student_ids
  end

  test "transferring without logging in fails" do
    sign_out(@teacher)
    post :create, format: 'json', section_id: @picture_section.id, student_ids: @word_user_1.id.to_s
    assert_response 401
  end

  test "transferring to a new teacher succeeds" do
    student = create(:student)
    post :create, format: 'json', section_id: @picture_section.id, student_ids: student.id.to_s
    assert Follower.exists?(user: student, section: @picture_section)
  end

  test "transferring to the same section does nothing" do
    post :create, format: 'json', section_id: @word_section.id, student_ids: @word_user_1.id.to_s
    assert Follower.exists?(user: @word_user_1, section: @word_section)
  end

  test "transferring a student to a section owned by a teacher the student "\
       "already follows causes the student to transfer sections under that teacher" do
     post :create, format: 'json', section_id: @picture_section.id, student_ids: @word_user_1.id.to_s
     assert Follower.exists?(user: @user, section: @picture_section)
  end

  test "transferring to a new teacher causes a student to join the section" do
    new_teacher = create(:teacher)
    new_word_section = create(:section, user: @teacher, login_type: 'word')

    post :create, format: 'json', section_id: new_word_section.id, student_ids: @word_user_1.id.to_s

    assert Follower.exists?(user: @word_user_1, section: new_word_section)
  end

  test "transferring to a new teacher causes a student to remain as a follower for his/her current sections" do
    new_teacher = create(:teacher)
    new_word_section = create(:section, user: @teacher, login_type: 'word')

    post :create, format: 'json', section_id: new_word_section.id, student_ids: @word_user_1.id.to_s

    assert Follower.exists?(user: @word_user_1, section: @word_section)
  end

  test "transferring a student with a messed up email succeeds" do
    # Copied from /follower_controller_tests
  end

  test "all students can be transferred successfully" do
    new_student = create(:student)
    student_ids = [new_student, @word_user_1, @picture_user_1].map(&:id).join(',')
    post :create, format: 'json', section_id: @picture_section.id, student_ids: student_ids

    assert Follower.exists?(user: new_student, section: @picture_section)
    assert Follower.exists?(user: @word_user_1, section: @picture_section)
    assert Follower.exists?(user: @picture_user_1, section: @picture_section)
  end

  test "copying a student to a new section saves progress" do
    # TODO: Figure out how progress works
  end
end
