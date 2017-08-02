# -*- coding: utf-8 -*-
require 'test_helper'
require 'time'

class HomeControllerTest < ActionController::TestCase
  # rubocop:disable Lint/UnreachableCode
  include Devise::Test::ControllerHelpers

  setup do
    # stub properties so we don't try to hit pegasus db
    Properties.stubs(:get).returns nil
  end

  test "redirect index when signed in" do
    user = create(:user)
    sign_in user
    get :index

    assert_redirected_to '/home'
  end

  test "redirect index when signed out" do
    get :index

    assert_redirected_to '/courses'
  end

  test "language is determined from cdo.locale" do
    return  # TODO: get :home, and look for a div that still exists

    @request.env['cdo.locale'] = "es-ES"

    get :index

    assert_select 'div.description', 'Code Studio es la página principal de los cursos en línea creados por Code.org'
  end

  test "language is set with cookies" do
    sign_in User.new # devise uses an empty user instead of nil? Hm

    request.host = "studio.code.org"

    get :set_locale, params: {user_return_to: "/blahblah", locale: "es-ES"}

    assert_equal "es-ES", cookies[:language_]
    assert_match "language_=es-ES; domain=.code.org; path=/; expires=#{10.years.from_now.rfc2822}"[0..-15], @response.headers["Set-Cookie"]
    assert_redirected_to 'http://studio.code.org/blahblah'
  end

  test "handle nonsense in user_return_to by returning to home" do
    sign_in User.new # devise uses an empty user instead of nil? Hm

    request.host = "studio.code.org"

    get :set_locale, params: {user_return_to: ["blah"], locale: "es-ES"}

    assert_redirected_to 'http://studio.code.org/'
  end

  test "user_return_to should not redirect off-site" do
    request.host = "studio.code.org"
    get :set_locale, params: {
      user_return_to: "http://blah.com/blerg",
      locale: "es-ES"
    }
    assert_redirected_to 'http://studio.code.org/blerg'
  end

  test "if user_return_to in set_locale is nil redirects to homepage" do
    request.host = "studio.code.org"
    get :set_locale, params: {user_return_to: nil, locale: "es-ES"}
    assert_redirected_to ''
  end

  test "should get index with edmodo header" do
    return  # TODO: get :home

    @request.headers["Accept"] = "image/*"
    @request.headers["User-Agent"] = "Edmodo/14 CFNetwork/672.0.2 Darwin/14.0.0"
    get :index
    assert_response :success
  end

  test "should get index with weebly header" do
    return  # TODO: get :home

    @request.headers["Accept"] = "image/*"
    @request.headers["User-Agent"] = "weebly-agent"
    get :index
    assert_response :success
  end

  def setup_user_with_gallery
    @user = create(:user)
    5.times do
      create :gallery_activity,
        level_source: create(:level_source, level_source_image: create(:level_source_image)),
        user: @user,
        autosaved: true
    end
    sign_in @user
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
    assert_select 'a[href="/admin"]', 0
  end

  test "do show admin links when admin" do
    return  # TODO: get :home

    sign_in create(:admin)
    get :index
    assert_select 'a[href="/admin"]'
  end

  test 'do not show levelbuilder links when not levelbuilder' do
    return  # TODO: look into bringing levelbuilder links to /home

    sign_in create(:user)

    get :index
    assert_select 'a[href="/levels/new"]', 0
  end

  test 'do show levelbuilder links when levelbuilder' do
    return  # TODO: look into bringing levelbuilder links to /home

    user = create(:user)
    UserPermission.create(user_id: user.id, permission: 'levelbuilder')
    sign_in user

    get :index
    assert_select 'a[href="/levels/new"]'
  end

  test 'user without age gets age prompt' do
    return  # TODO: get :home

    user = create(:user)
    user.update_attribute(:birthday, nil) # bypasses validations
    user = user.reload
    refute user.age, "user should not have age, but value was #{user.age}"

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

  # This exception is actually annoying to handle because it never gets to
  # ActionController (so we can't use the rescue in ApplicationController).
  # test "bad http methods are rejected" do
  #   process :index, 'APOST' # use an APOST instead of get/post/etc
  #
  #   assert_response 400
  # end

  test 'health_check sets no cookies' do
    get :health_check
    # this stuff is not really a hash but it pretends to be
    assert_equal "{}", @response.cookies.inspect
    assert_equal "{}", session.inspect
  end

  test 'no more debug' do
    # this action is now in AdminReportsController and requires admin privileges
    assert_raises ActionController::UrlGenerationError do
      get :debug
    end
  end

  test 'workshop organizers see only new dashboard links' do
    sign_in create(:workshop_organizer, :with_terms_of_service)
    get :home
    assert_select 'h1', count: 1, text: 'Workshop Dashboard'
    assert_select 'h1', count: 0, text: 'Old CSF Workshop Dashboard'
  end

  test 'workshop admins see new and old dashboard links' do
    sign_in create(:workshop_admin, :with_terms_of_service)
    get :home
    assert_select 'h1', count: 1, text: 'Workshop Dashboard'
    assert_select 'h1', count: 1, text: 'Old CSF Workshop Dashboard'
  end

  test 'facilitators see only new dashboard links' do
    facilitator = create(:facilitator, :with_terms_of_service)
    sign_in facilitator
    get :home
    assert_select 'h1', count: 1, text: 'Workshop Dashboard'
    assert_select 'h1', count: 0, text: 'Old CSF Workshop Dashboard'
  end

  test 'legacy workshop creators see only old dashboard links' do
    teacher = create :terms_of_service_teacher
    teacher.permission = UserPermission::CREATE_PROFESSIONAL_DEVELOPMENT_WORKSHOP
    sign_in teacher
    get :home
    assert_select 'h1', count: 0, text: 'Workshop Dashboard'
    assert_select 'h1', count: 1, text: 'Old CSF Workshop Dashboard'
  end

  test 'teachers cannot see dashboard links' do
    sign_in create(:terms_of_service_teacher)
    get :home
    assert_select 'h1', count: 0, text: 'Workshop Dashboard'
    assert_select 'h1', count: 0, text: 'Old CSF Workshop Dashboard'
  end
end
