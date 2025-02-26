require 'test_helper'

class JoinTest < ActionDispatch::IntegrationTest
  test 'signed out /join with code in query param shows link account view' do
    section = create :section

    get "http://#{CDO.dashboard_hostname}/join?utf8=%E2%9C%93&section_code=#{section.code}&commit=Go"

    assert_response :success
    assert_template :join_logged_out
  end

  test 'signed out /join with code in url shows link account view' do
    section = create :section

    get "http://#{CDO.dashboard_hostname}/join/#{section.code}"

    assert_response :success
    assert_template :join_logged_out
  end

  test 'signed out /join without code shows link account view' do
    get "http://#{CDO.dashboard_hostname}/join"

    assert_response :success
    assert_template :join_logged_out
  end

  test 'signed in /join with code in query param successfully loads join page' do
    sign_in create :student
    section = create :section

    get "http://#{CDO.dashboard_hostname}/join?utf8=%E2%9C%93&section_code=#{section.code}&commit=Go"

    assert_response :success
  end

  test 'signed in /join with code in url successfully loads join page' do
    sign_in create :student
    section = create :section

    get "http://#{CDO.dashboard_hostname}/join/#{section.code}"

    assert_response :success
  end

  test 'signed in /join without code successfully loads join page' do
    sign_in create :student
    get "http://#{CDO.dashboard_hostname}/join"

    assert_response :success
  end
end
