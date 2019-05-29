require 'test_helper'
require 'timecop'

class UserSchoolInfosControllerTest < ActionDispatch::IntegrationTest
  test "last confirmation date in user school infos table is updated" do
    Timecop.freeze

    user_school_info = create :user_school_info
    sign_in user_school_info.user
    original_confirmation_date = user_school_info.last_confirmation_date
    original_user_school_info_created_at = user_school_info.created_at

    Timecop.travel 1

    patch "/api/v1/user_school_infos/#{user_school_info.id}/update_last_confirmation_date"

    user_school_info.reload

    assert_response :success
    assert user_school_info.last_confirmation_date.to_datetime > original_confirmation_date.to_datetime

    refute_equal original_user_school_info_created_at, user_school_info[:updated_at]
    refute_equal original_confirmation_date.to_datetime, user_school_info.last_confirmation_date.to_datetime

    Timecop.return
  end

  test "will redirect user to sign in" do
    patch "/api/v1/user_school_infos/-1/update_last_confirmation_date"
    assert_response 302
  end

  test "last confirmation date will 404 if user school info id does not exist" do
    user_school_info = create :user_school_info
    sign_in user_school_info.user
    patch "/api/v1/user_school_infos/-1/update_last_confirmation_date"
    assert_response 404
  end

  test 'update last confirmation date will 401 if given a school_info id not owned by the signed-in user' do
    user_school_info1 = create :user_school_info
    user_school_info2 = create :user_school_info
    sign_in user_school_info2.user
    patch "/api/v1/user_school_infos/#{user_school_info1.id}/update_last_confirmation_date"
    assert_response 403
  end

  test 'intial, no previoius, blank, manual' do
    user = create :teacher
    sign_in user

    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {
          country: '', school_type: ''
        }
      }
    }

    user.reload

    assert_response :success, response.body
    assert_nil user.school_info
    assert_empty user.user_school_infos
  end

  test 'intial, no previoius, partial, manual' do
    Timecop.freeze

    user = create :teacher
    sign_in user

    Timecop.travel 1.hour

    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: 'United States', school_type: 'private', school_name: '', full_address: ''}
      }
    }

    user.reload

    new_user_school_info = user.user_school_infos.last

    assert_response :success, response.body
    assert_equal user.user_school_infos.count, 1
    refute_nil user.school_info
    assert user.school_info.school_name.nil?
    refute_empty user.user_school_infos
    assert_equal user.created_at, new_user_school_info.start_date
    assert_in_delta Time.now.to_i, new_user_school_info.last_confirmation_date.to_i, 10
    assert_nil new_user_school_info.end_date

    Timecop.return
  end

  test 'intial, no previoius, complete, drop down' do
    Timecop.freeze

    user = create :teacher
    sign_in user

    school = create :school

    Timecop.travel 1.hour

    assert_creates SchoolInfo do
      patch "/api/v1/user_school_infos", params: {
        user: {
          school_info_attributes: {school_id: school.id}
        }
      }
    end

    user.reload

    tenure = user.user_school_infos.last

    assert_response :success, response.body
    assert_equal user.user_school_infos.count, 1
    refute_nil user.school_info
    refute_nil user.school_info.school
    refute_empty user.user_school_infos
    assert_equal user.created_at, tenure.start_date
    assert_in_delta Time.now.to_i, tenure.last_confirmation_date.to_i, 10
    assert_nil tenure.end_date
    assert_equal user.school_info.school.id, school.id

    Timecop.return
  end
end
