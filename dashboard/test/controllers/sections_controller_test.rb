# -*- coding: utf-8 -*-
require 'test_helper'

class SectionsControllerTest < ActionController::TestCase
##### NEW SECTION STUFF

  def new_setup
    @teacher = create(:teacher)

    @word_section = create(:section, user: @teacher, login_type: 'word')
    @word_user_1 = create(:follower, section: @word_section).student_user

    @picture_section = create(:section, user: @teacher, login_type: 'picture')
    @picture_user_1 = create(:follower, section: @word_section).student_user

    @regular_section = create(:section, user: @teacher, login_type: 'regular')

    @flappy_section = create(:section, user: @teacher, login_type: 'word', script_id: Script.get_from_cache(Script::FLAPPY_NAME).id)
    @flappy_user_1 = create(:follower, section: @word_section).student_user
  end

  test "do not show login screen for invalid section code" do
    new_setup

    assert_raises(ActiveRecord::RecordNotFound) do
      get :show, id: @word_section.id # we use code not id
    end
  end

  test "do not show login screen for non-picture/word sections" do
    new_setup

    assert_raises(ActiveRecord::RecordNotFound) do
      get :show, id: @regular_section.code
    end
  end

  test "show login screen for picture section" do
    new_setup

    get :show, id: @picture_section.code

    assert_response :success
  end

  test "show login screen for word section" do
    new_setup

    get :show, id: @word_section.code

    assert_response :success
  end

  test "valid log_in wih picture" do
    new_setup

    assert_difference '@picture_user_1.reload.sign_in_count' do # devise Trackable fields are updated
      post :log_in, id: @picture_section.code, user_id: @picture_user_1.id, secret_picture_id: @picture_user_1.secret_picture_id
    end

    assert_redirected_to '/'
  end

  test "invalid log_in wih picture" do
    new_setup

    assert_no_difference '@picture_user_1.reload.sign_in_count' do # devise Trackable fields are not updated
      post :log_in, id: @picture_section.code, user_id: @picture_user_1.id, secret_picture_id: @picture_user_1.secret_picture_id + 1
    end

    assert_redirected_to section_path(id: @picture_section.code)
  end

  test "valid log_in wih word" do
    new_setup

    assert_difference '@word_user_1.reload.sign_in_count' do # devise Trackable fields are updated
      post :log_in, id: @word_section.code, user_id: @word_user_1.id, secret_words: @word_user_1.secret_words
    end

    assert_redirected_to '/'
  end

  test "invalid log_in wih word" do
    new_setup

    assert_no_difference '@word_user_1.reload.sign_in_count' do # devise Trackable fields are not updated
      post :log_in, id: @word_section.code, user_id: @word_user_1.id, secret_words: "not correct"
    end

    assert_redirected_to section_path(id: @word_section.code)
  end

  test "login to section with a script redirects to script" do
    new_setup

    post :log_in, id: @flappy_section.code, user_id: @flappy_user_1.id, secret_words: @flappy_user_1.secret_words

    assert_redirected_to '/s/flappy'
  end
end
