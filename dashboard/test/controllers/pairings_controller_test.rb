require 'test_helper'

class PairingsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @user = create :user
    sign_in @user
  end

  test 'should get show for logged in user' do
    get :show, xhr: true
    assert_response :success

    expected_response = {'pairings' => [], 'sections' => []}
    assert_equal expected_response, JSON.parse(response.body)
  end

  test 'should get show for logged in user with sections' do
    section_1 = create(:follower, student_user: @user).section
    section_2 = create(:follower, student_user: @user).section

    get :show, xhr: true
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
    section = create(:follower, student_user: @user).section
    classmate = create(:follower, section: section).student_user
    session[:pairings] = [classmate.id]

    get :show, xhr: true
    assert_response :success

    expected_response = {
      'pairings' => [{'id' => classmate.id, 'name' => classmate.name}],
      'sections' => [{
        'id' => section.id,
        'name' => section.name,
        'students' => [{'id' => classmate.id, 'name' => classmate.name}]
      }]
    }
    assert_equal expected_response, JSON.parse(response.body)
  end

  test 'should set pairings in session if they are valid classmates' do
    section = create(:follower, student_user: @user).section
    classmate_1 = create(:follower, section: section).student_user
    classmate_2 = create(:follower, section: section).student_user

    put :update, xhr: true, params: {pairings: [{id: classmate_1.id}, {id: classmate_2.id}]}

    assert_response :success
    assert_equal [classmate_1.id, classmate_2.id], session[:pairings]
  end

  test 'should not set pairings in session if they are not valid classmates' do
    section = create(:follower, student_user: @user).section
    classmate = create(:follower, section: section).student_user
    invalid_user = create(:student)

    put :update, xhr: true, params: {pairings: [{id: classmate.id}, {id: invalid_user.id}]}

    assert_response :success
    # the invalid user is silently rejected
    assert_equal [classmate.id], session[:pairings]
  end

  test 'should remove pairings in session' do
    section = create(:follower, student_user: @user).section
    classmate = create(:follower, section: section).student_user
    session[:pairings] = [classmate.id]

    put :update, xhr: true, params: {pairings: []}

    assert_response :success
    assert_equal [], session[:pairings]
  end
end
