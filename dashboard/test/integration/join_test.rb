require 'test_helper'

class JoinTest < ActionDispatch::IntegrationTest
  test '/join with code in param redirects to /join with code in url' do
    section = create :section

    get "/join?utf8=%E2%9C%93&section_code=#{section.code}&commit=Go"
    assert_response :success

    # not logged in, page contains new user form
    assert_select 'form#new_user'
  end

  test '/join with code in url is not redirected' do
    section = create :section

    get "/join/#{section.code}"
    assert_response :success
  end

  test '/join without code is not redirected' do
    get "/join"
    assert_response :success
  end
end
