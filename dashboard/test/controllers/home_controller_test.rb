# -*- coding: utf-8 -*-
require 'test_helper'

class HomeControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  test "language is determined from cookies" do
    @request.cookies[:language_] = "es-ES"

    get :index

    assert_select 'a', 'Iniciar Sesión'
  end

  test "language is set with cookies" do
    sign_in User.new # devise uses an empty user instead of nil? Hm

    request.host = "learn.code.org"

    get :set_locale, :return_to => "http://blahblah", :locale => "es-ES"

    assert_equal "es-ES", cookies[:language_]

    assert_equal "language_=es-ES; domain=.code.org; path=/", @response.headers["Set-Cookie"]
  end

  test "should get index with edmodo header" do
    @request.headers["Accept"] = "image/*"
    @request.headers["User-Agent"] = "Edmodo/14 CFNetwork/672.0.2 Darwin/14.0.0"
    get :index
    assert_response :success
  end

  test "should get index with weebly header" do
    @request.headers["Accept"] = "image/*"
    @request.headers["User-Agent"] = "weebly-agent"
    get :index
    assert_response :success
  end

  test "logged in user with gallery activities shows gallery" do
    user = create(:user)
    create :gallery_activity, user: user, app: Game::ARTIST, autosaved: true
    create :gallery_activity, user: user, app: Game::ARTIST
    create :gallery_activity, user: user, app: Game::ARTIST
    create :gallery_activity, user: user, app: Game::STUDIO
    sign_in user

    get :index

    assert_select 'h4', "My Apps" # title of the gallery section
    assert_select 'h4', "My Art" # title of the gallery section
    assert_select '#turtle-gallery div.gallery_activity img', 3 # artist items
    assert_select '#studio-gallery div.gallery_activity img', 1 # playlab item

  end

  test "logged in user without gallery activities does not show gallery" do
    user = create(:user)
    create(:activity, user: user)
    sign_in user

    get :index

    assert_response :success
    assert_select 'h4', text: "Gallery", count: 0
  end

  test "do not show gallery when not logged in" do
    get :index
    assert_select 'h4', text: "Gallery", count: 0
  end

  test "do not show admin links when not admin" do
    sign_in create(:user)

    get :index
    assert_select 'a[href=/admin/stats]', 0
  end

  test "do show admin links when admin" do
    sign_in create(:admin)

    get :index
    assert_select 'a[href=/admin/stats]'
  end

  test 'logged in user without primary course does not see resume info' do
    user = create(:user)
    sign_in(user)
    get :index
    assert_response :success
    assert_select '#left_off', 0
  end


  test 'logged in user sees resume info and progress for 20hour' do
    user = create(:user)
    UserScript.create!(user_id: user.id, script_id: 1, started_at: Time.now)
    sign_in(user)
    get :index
    assert_response :success

    assert_select '#left_off'
    assert_select 'form[action=http://test.host/s/1/level/2]' # continue link
    assert_select 'h3', 'K-8 Intro to Computer Science Course (15-25 hours)' # progress block
    assert_select 'a.level_link[href=http://test.host/s/1/level/2]' # link to level in progress
  end

  test 'logged in user sees resume info and progress for course1' do
    user = create(:user)
    UserScript.create!(user_id: user.id, script_id: Script.find_by_name('course1').id, started_at: Time.now)
    sign_in(user)
    get :index
    assert_response :success

    assert_select '#left_off'
    assert_select 'form[action=http://test.host/s/course1/stage/3/puzzle/1]' # continue link
    assert_select 'h3', 'Course 1 - For early readers' # progress block
    assert_select 'a.level_link[href=http://test.host/s/course1/stage/3/puzzle/1]' # link to level in progress
  end

  test 'finishing whole 20hr curriculum does not show resume info' do
    user = create(:user)
    sign_in(user)
    Script.find(Script::TWENTY_HOUR_ID).script_levels.each do |script_level|
      UserLevel.create(user: user, level: script_level.level, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
    end
    user.backfill_user_scripts

    assert_equal [], user.working_on_scripts # if you finish a script you are not working on it!
    
    get :index
    assert_response :success
    assert_select '#left_off', false
  end

  test 'user without age gets age prompt' do
    user = create(:user)
    user.update_attribute(:birthday, nil) # bypasses validations
    user = user.reload
    assert !user.age

    sign_in user
    get :index
    
    assert_select '#age-modal'
  end

  test 'user with age does not get age prompt' do
    user = create(:user)
    assert user.age

    sign_in user

    get :index

    assert_select '#age-modal', false
  end

  test 'anonymous does not get age prompt' do
    get :index
    
    assert_select '#age-modal', false
  end

# this exception is actually annoying to handle because it never gets
# to ActionController (so we can't use the rescue in
# ApplicationController)
#  test "bad http methods are rejected" do
#    process :index, 'APOST' # use an APOST instead of get/post/etc
#
#    assert_response 400
#  end


end
