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

    assert_redirected_to 'http://blahblah'
  end


  test "handle nonsense in return_to" do
    sign_in User.new # devise uses an empty user instead of nil? Hm

    request.host = "learn.code.org"

    get :set_locale, :return_to => ["blah"], :locale => "es-ES"

    assert_redirected_to '["blah"]'
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

  def setup_user_with_gallery
    @user = create(:user)
    5.times do
      create :gallery_activity,
        user: @user,
        autosaved: true,
        activity: create(:activity, user: @user, level: create(:level, game: Game.find_by_app(Game::ARTIST)))
    end
    sign_in @user
  end

  test "logged in user with gallery activities shows gallery" do
    setup_user_with_gallery
    get :index

    assert_select 'h3', "Gallery" # title of the gallery section
    assert_select '#gallery div.gallery_activity img', 5
  end

  test "logged in user without gallery activities does not show gallery" do
    user = create(:user)
    create(:activity, user: user)
    sign_in user

    get :index

    assert_response :success
    assert_select 'h3', text: "Gallery", count: 0
  end

  test "do not show gallery activity pagination when not signed in" do
    get :gallery_activities
    assert_redirected_to_sign_in
  end

  test "show gallery activity pagination when signed in" do
    setup_user_with_gallery

    get :gallery_activities
    assert_response :success

    assert_select 'div.gallery_activity img', 5
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

  Script.all.each do |script|
    next if script.hidden? # only test public facing scripts
    test "logged in user sees resume info and progress for course #{script.name}" do
      user = create(:user)
      UserScript.create!(user_id: user.id, script_id: script.id, started_at: Time.now)
      sign_in(user)
      get :index
      assert_response :success

      if script.name == 'hourofcode'
        url = "http://test.host/hoc"
      elsif script.flappy?
        url = "http://test.host/flappy"
      else
        url = "http://test.host/s/#{script.to_param}"
      end
      assert_select "#continue a[href^=#{url}]" # continue link
      assert_select 'h3',  I18n.t("data.script.name.#{script.name}.title") # script title
      assert_select "div[data-script-id=#{script.id}]" # div for loading script progress
    end
  end
    
  test 'finishing whole 20hr curriculum does not show resume info' do
    user = create(:user)
    sign_in(user)
    Script.find(Script::TWENTY_HOUR_ID).script_levels.each do |script_level|
      UserLevel.create(user: user, level: script_level.level, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
    end
    Script.find_by(name: 'hourofcode').script_levels.each do |script_level|
      UserLevel.find_or_create_by(user: user, level: script_level.level, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
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

  test "do not show prize link if you don't have a prize" do
    sign_in create(:teacher)

    get :index
    assert_select 'a[href=http://test.host/redeemprizes]', 0
  end

  test "do show prize link when you already have a prize" do
    teacher = create(:teacher)
    sign_in teacher
    teacher.teacher_prize = TeacherPrize.create!(prize_provider_id: 8, code: 'fake')

    get :index
    assert_select 'a[href=http://test.host/redeemprizes]'
  end

  test 'health_check sets no cookies' do
    get :health_check
    # this stuff is not really a hash but it pretends to be
    assert_equal "{}", @response.cookies.inspect
    assert_equal "{}", session.inspect
  end
end
