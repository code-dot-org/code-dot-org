require 'test_helper'

class UserMenuTest < ActionDispatch::IntegrationTest
  def open_pairing_test(show_pairing)
    student = create(:student_in_word_section)
    section = student.sections_as_student.first
    post "/sections/#{section.code}/log_in", params: {
      id: section.code,
      user_id: student.id,
      secret_words: student.secret_words,
      show_pairing_dialog: show_pairing ? 1 : nil
    }

    assert_redirected_to '/'
    assert_equal show_pairing, !!@controller.session[:show_pairing_dialog]
    get '/home'
    assert_select 'script', /dashboard.pairing.init.*#{show_pairing}/
    refute @controller.session[:show_pairing_dialog] # should only show once
  end

  test 'user menu should open pairing dialog if asked to on login' do
    open_pairing_test true
  end

  test 'user menu should not open pairing dialog if not asked to on login' do
    open_pairing_test false
  end

  test 'student does not see links to teacher dashboard' do
    student = create :student
    sign_in student

    get '/home'

    assert_response :success
    assert_select 'a[href="//test.code.org/teacher-dashboard"]', 0
  end

  test 'should redirect for signed out user' do
    sign_out :user
    get '/home'

    assert_response :redirect
  end

  test 'should show sign out link for signed in user' do
    student = create :student
    sign_in student

    get '/home'

    assert_response :success
    assert_select 'a[href="//test-studio.code.org/users/sign_out"]', 'Sign out'
  end

  test 'show link to pair programming when in a section' do
    student = create(:follower).student_user
    sign_in student

    assert student.can_pair?

    get '/home'

    assert_response :success
    assert_select '#pairing_link'
  end

  test "don't show link to pair programming when not in a section" do
    student = create(:student)
    sign_in student

    get '/home'

    assert_response :success
    assert_select 'a[href="http://test.host/pairing"]', false
  end
end
