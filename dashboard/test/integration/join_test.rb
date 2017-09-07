require 'test_helper'

class JoinTest < ActionDispatch::IntegrationTest
  test '/join with code in query param renders followers#student_user_new with section_code' do
    section = create :section

    join_url = "/join?utf8=%E2%9C%93&section_code=#{section.code}&commit=Go"
    assert_recognizes(
      {controller: 'followers', action: 'student_user_new', section_code: section.code},
      join_url,
      {section_code: section.code}
    )
    get join_url
    assert_response :success

    # not logged in, page contains new user form
    assert_select 'form#new_user'
  end

  test '/join with code in url renders followers#student_user_new with section_code' do
    section = create :section

    join_url = "/join/#{section.code}"
    assert_recognizes(
      {controller: 'followers', action: 'student_user_new', section_code: section.code},
      join_url
    )
    get join_url
    assert_response :success
  end

  test '/join without code renders followers#student_user_new' do
    join_url = '/join'
    assert_recognizes(
      {controller: 'followers', action: 'student_user_new'},
      join_url
    )
    get join_url
    assert_response :success
  end
end
