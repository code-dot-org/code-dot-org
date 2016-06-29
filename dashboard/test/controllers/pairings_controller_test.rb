require 'test_helper'

class PairingsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
  end

  test 'should get show for logged in user' do
    sign_in create(:user)

    xhr :get, :show
    assert_response :success

    expected_response = {'pairings' => [], 'sections' => []}
    assert_equal expected_response, JSON.parse(response.body)
  end

  test 'should get show for logged in user with sections' do
    sign_in user = create(:user)
    section_1 = create(:follower, student_user: user).section
    section_2 = create(:follower, student_user: user).section

    xhr :get, :show
    assert_response :success

    expected_response = {
      'pairings' => [],
      'sections' => [
        {'id' => section_1.id, 'name' => section_1.name, 'students' => []},
        {'id' => section_2.id, 'name' => section_2.name, 'students' => []}
      ]
    }
    assert_equal expected_response, JSON.parse(response.body)
  end

  test 'should get show for logged in user with sections and pairings' do
    sign_in user = create(:user)
    section = create(:follower, student_user: user).section
    classmate = create(:follower, section: section).student_user
    session[:pairings] = [classmate.id]

    xhr :get, :show
    assert_response :success

    expected_response = {'pairings' => [{'id' => classmate.id, 'name' => classmate.name}],
                         'sections' => [{'id' => section.id, 'name' => section.name,
                                         'students' => [{'id' => classmate.id, 'name' => classmate.name}]}]}
    assert_equal expected_response, JSON.parse(response.body)
  end

  test 'should set pairings in session if they are valid classmates' do
    sign_in user = create(:user)
    section = create(:follower, student_user: user).section
    classmate_1 = create(:follower, section: section).student_user
    classmate_2 = create(:follower, section: section).student_user

    xhr :put, :update, pairings: [{id: classmate_1.id}, {id: classmate_2.id}]

    assert_response :success
    assert_equal [classmate_1.id, classmate_2.id], session[:pairings]
  end

  test 'should not set pairings in session if they are not valid classmates' do
    sign_in user = create(:user)
    section = create(:follower, student_user: user).section
    classmate = create(:follower, section: section).student_user
    invalid_user = create(:student)

    xhr :put, :update, pairings: [{id: classmate.id}, {id: invalid_user.id}]

    assert_response :success
    # the invalid user is silently rejected
    assert_equal [classmate.id], session[:pairings]
  end

  test 'should remove pairings in session' do
    sign_in user = create(:user)

    section = create(:follower, student_user: user).section
    classmate = create(:follower, section: section).student_user
    session[:pairings] = [classmate.id]

    xhr :put, :update, pairings: []

    assert_response :success
    assert_equal [], session[:pairings]
  end
end
