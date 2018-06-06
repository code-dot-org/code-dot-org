# -*- coding: utf-8 -*-
require 'test_helper'

class SectionsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)

    @word_section = create(:section, user: @teacher, login_type: 'word')
    @word_user_1 = create(:follower, section: @word_section).student_user

    @picture_section = create(:section, user: @teacher, login_type: 'picture')
    @picture_user_1 = create(:follower, section: @picture_section).student_user

    @regular_section = create(:section, user: @teacher, login_type: 'email')

    @flappy_section = create(:section, user: @teacher, login_type: 'word', script_id: Script.flappy_script.id)
    @flappy_user_1 = create(:follower, section: @flappy_section).student_user
  end

  setup do
    # Expect any scripts/courses to be valid unless specified by test
    Course.stubs(:valid_course_id?).returns(true)
    Script.stubs(:valid_script_id?).returns(true)

    # place in setup instead of setup_all otherwise course ends up being serialized
    # to a file if levelbuilder_mode is true
    @course = create(:course)
    @script_in_course = create(:script)
    create(:course_script, script: @script_in_course, course: @course, position: 1)
    @section_with_course = create(:section, user: @teacher, login_type: 'word', course_id: @course.id)
    @section_with_course_user_1 = create(:follower, section: @section_with_course).student_user
  end

  test "do not show login screen for invalid section code" do
    assert_raises(ActiveRecord::RecordNotFound) do
      get :show, params: {id: @word_section.id} # we use code not id
    end
  end

  test "do not show login screen for non-picture/word sections" do
    assert_raises(ActiveRecord::RecordNotFound) do
      get :show, params: {id: @regular_section.code}
    end
  end

  test "show login screen for picture section" do
    get :show, params: {id: @picture_section.code}

    assert_response :success
  end

  test "show login screen for word section" do
    get :show, params: {id: @word_section.code}

    assert_response :success
  end

  test "valid log_in wih picture" do
    assert_difference '@picture_user_1.reload.sign_in_count' do # devise Trackable fields are updated
      post :log_in, params: {
        id: @picture_section.code,
        user_id: @picture_user_1.id,
        secret_picture_id: @picture_user_1.secret_picture_id
      }
    end

    assert_redirected_to '/'
  end

  test "invalid log_in wih picture" do
    assert_no_difference '@picture_user_1.reload.sign_in_count' do # devise Trackable fields are not updated
      post :log_in, params: {
        id: @picture_section.code,
        user_id: @picture_user_1.id,
        secret_picture_id: @picture_user_1.secret_picture_id + 1
      }
    end

    assert_redirected_to section_path(id: @picture_section.code)
  end

  test "valid log_in wih word" do
    assert_difference '@word_user_1.reload.sign_in_count' do # devise Trackable fields are updated
      post :log_in, params: {
        id: @word_section.code,
        user_id: @word_user_1.id,
        secret_words: @word_user_1.secret_words
      }
    end

    assert_redirected_to '/'
  end

  test "invalid log_in wih word" do
    assert_no_difference '@word_user_1.reload.sign_in_count' do # devise Trackable fields are not updated
      post :log_in, params: {
        id: @word_section.code,
        user_id: @word_user_1.id,
        secret_words: "not correct"
      }
    end

    assert_redirected_to section_path(id: @word_section.code)
  end

  test "login to section with a script redirects to script" do
    post :log_in, params: {
      id: @flappy_section.code,
      user_id: @flappy_user_1.id,
      secret_words: @flappy_user_1.secret_words
    }

    assert_redirected_to '/s/flappy'
  end

  test "login to section with a course redirects to course" do
    post :log_in, params: {
      id: @section_with_course.code,
      user_id: @section_with_course_user_1.id,
      secret_words: @section_with_course_user_1.secret_words
    }

    assert_redirected_to "/courses/#{@section_with_course.course.name}"
  end

  test "login with show_pairing_dialog shows pairing dialog" do
    post :log_in, params: {
      id: @flappy_section.code,
      user_id: @flappy_user_1.id,
      secret_words: @flappy_user_1.secret_words,
      show_pairing_dialog: '1'
    }

    assert_redirected_to '/s/flappy'

    assert session[:show_pairing_dialog]
  end

  test "login without show_pairing_dialog shows pairing dialog" do
    post :log_in, params: {
      id: @flappy_section.code,
      user_id: @flappy_user_1.id,
      secret_words: @flappy_user_1.secret_words
    }

    assert_redirected_to '/s/flappy'

    refute session[:show_pairing_dialog]
  end

  test "cannot log in to section if you are not in the section" do
    assert_no_difference '@picture_user_1.reload.sign_in_count' do # devise Trackable fields are not updated
      post :log_in, params: {
        id: @picture_section.code,
        user_id: @word_user_1.id,
        secret_picture_id: @word_user_1.secret_picture_id
      }
    end

    assert_redirected_to section_path(id: @picture_section.code)
  end

  test "update: can update section you own" do
    sign_in @teacher
    section_with_script = create(
      :section,
      user: @teacher,
      script_id: Script.flappy_script.id,
      login_type: Section::LOGIN_TYPE_WORD,
      grade: "1",
      stage_extras: true,
      pairing_allowed: false,
      hidden: true
    )

    post :update, params: {
      id: section_with_script.id,
      course_id: @course.id,
      name: "My Section",
      login_type: Section::LOGIN_TYPE_PICTURE,
      grade: "K",
      stage_extras: false,
      pairing_allowed: true,
      hidden: false
    }
    assert_response :success

    # Cannot use section_with_script.reload because login_type has changed
    section_with_script = Section.find(section_with_script.id)

    assert_equal(@course.id, section_with_script.course_id)
    assert_nil(section_with_script.script_id)
    assert_equal("My Section", section_with_script.name)
    assert_equal(Section::LOGIN_TYPE_PICTURE, section_with_script.login_type)
    assert_equal("K", section_with_script.grade)
    assert_equal(false, section_with_script.stage_extras)
    assert_equal(true, section_with_script.pairing_allowed)
    assert_equal(false, section_with_script.hidden)
  end

  test "update: course_id is not updated if invalid" do
    Course.stubs(:valid_course_id?).returns(false)

    sign_in @teacher
    section = create(:section, user: @teacher, course_id: nil)

    post :update, params: {
      id: section.id,
      course_id: 1,
    }
    section.reload
    assert_response :success
    assert_nil section.course_id
    refute_equal 1, section.course_id
  end

  test "update: script_id is not updated if invalid" do
    Script.stubs(:valid_script_id?).returns(false)

    sign_in @teacher
    section = create(:section, user: @teacher, script_id: nil)

    post :update, params: {
      id: section.id,
      script_id: 1,
    }
    section.reload
    assert_response :success
    assert_nil section.script_id
    refute_equal 1, section.script_id
  end

  test "update: cannot update section you dont own" do
    other_teacher = create(:teacher)
    sign_in other_teacher
    post :update, params: {
      id: @regular_section.id,
      course_id: @course.id,
    }
    assert_response :forbidden
  end

  test "update: cannot update section if not logged in " do
    post :update, params: {
      id: @regular_section.id,
      course_id: @course.id,
    }
    assert_response :redirect
  end

  test "update: can set course and script" do
    sign_in @teacher
    section = create(:section, user: @teacher, script_id: Script.flappy_script.id)
    post :update, as: :json, params: {
      id: section.id,
      course_id: @course.id,
      script_id: @script_in_course.id
    }
    assert_response :success
    section.reload
    assert_equal(@course.id, section.course_id)
    assert_equal(@script_in_course.id, section.script_id)
  end

  test "update: non-matching course/script rejected" do
    sign_in @teacher
    section = create(:section, user: @teacher, script_id: Script.flappy_script.id)
    post :update, params: {
      id: section.id,
      course_id: @course.id,
      script_id: Script.artist_script.id
    }
    assert_response 400
  end

  test "update: can set course-less script" do
    sign_in @teacher
    section = create(:section, user: @teacher, script_id: Script.flappy_script.id)
    post :update, params: {
      id: section.id,
      script_id: Script.artist_script.id
    }
    assert_response :success
    section.reload
    assert_nil section.course_id
    assert_equal(Script.artist_script.id, section.script_id)
  end

  test "upate: setting a script results in UserScripts for students" do
    sign_in @teacher
    section = create(:section, user: @teacher, script_id: Script.flappy_script.id)
    student = create(:follower, section: section).student_user

    assert_nil UserScript.find_by(script: Script.artist_script, user: student)

    post :update, params: {
      id: section.id,
      script_id: Script.artist_script.id
    }

    assert_not_nil UserScript.find_by(script: Script.artist_script, user: student)
  end
end
