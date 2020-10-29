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
    UnitGroup.stubs(:valid_course_id?).returns(true)
    Script.stubs(:valid_script_id?).returns(true)

    # place in setup instead of setup_all otherwise course ends up being serialized
    # to a file if levelbuilder_mode is true
    @unit_group = create(:unit_group)
    @script_in_course = create(:script)
    create(:unit_group_unit, script: @script_in_course, unit_group: @unit_group, position: 1)
    @section_with_course = create(:section, user: @teacher, login_type: 'word', course_id: @unit_group.id)
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

  test "former picture section member cannot log in with picture" do
    former_picture_section_user = create(:follower, section: @picture_section).student_user
    follower = Follower.where(section: @picture_section.id, student_user_id: former_picture_section_user.id).first
    @picture_section.remove_student(former_picture_section_user, follower, {})

    assert_no_difference 'former_picture_section_user.reload.sign_in_count' do # devise Trackable fields are not updated
      post :log_in, params: {
        id: @picture_section.code,
        user_id: former_picture_section_user.id,
        secret_picture_id: former_picture_section_user.secret_picture_id
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

  test "former word section member cannot log in with word" do
    former_word_section_user = create(:follower, section: @word_section).student_user
    follower = Follower.where(section: @word_section.id, student_user_id: former_word_section_user.id).first
    @word_section.remove_student(former_word_section_user, follower, {})

    assert_no_difference 'former_word_section_user.reload.sign_in_count' do # devise Trackable fields are not updated
      post :log_in, params: {
        id: @word_section.code,
        user_id: former_word_section_user.id,
        secret_words: former_word_section_user.secret_words
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

    assert_redirected_to "/courses/#{@section_with_course.unit_group.name}"
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
end
