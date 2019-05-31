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

  def assert_first_tenure(user)
    tenure = user.user_school_infos.last
    assert_equal user.user_school_infos.count, 1
    assert_equal user.created_at, tenure.start_date
    assert_in_delta Time.now.to_i, tenure.last_confirmation_date.to_i, 10
    assert_nil tenure.end_date
  end

  def assert_first_tenure_partial(user)
    tenure = user.user_school_infos.last
    assert_equal user.user_school_infos.count, 2
    refute_equal user.created_at, tenure.start_date
    assert_in_delta Time.now.to_i, tenure.last_confirmation_date.to_i, 10
    assert_nil tenure.end_date
    refute_nil user.school_info.school_name
    refute_nil user.school_info.country
  end

  test 'initial, no previoius, blank, manual' do
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

  test 'initial, no previoius, partial, manual' do
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

    assert_response :success, response.body
    refute_nil user.school_info
    assert user.school_info.school_name.nil?
    assert_first_tenure(user)

    Timecop.return
  end

  test 'initial, no previoius, complete, drop down' do
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

    assert_response :success, response.body

    refute_nil user.school_info
    refute_nil user.school_info.school
    refute_empty user.user_school_infos
    assert_first_tenure(user)

    Timecop.return
  end

  test 'initial, no previous, complete, manual' do
    Timecop.freeze

    user = create :teacher
    sign_in user

    Timecop.travel 1.hour

    assert_creates SchoolInfo do
      patch "/api/v1/user_school_infos", params: {
        user: {
          school_info_attributes: {country: 'United States', school_type: 'public', school_name: 'The School of Rock',
            full_address: 'Seattle, Washington USA'}
        }
      }
    end

    user.reload

    assert_response :success, response.body

    refute_nil user.school_info
    refute_nil user.school_info.school_name
    refute_empty user.user_school_infos
    assert_first_tenure(user)

    Timecop.return
  end

  test 'initial, partial previous, blank, manual' do
    Timecop.freeze

    school_info = create :school_info, school_id: nil, validation_type: SchoolInfo::VALIDATION_NONE

    user = create :teacher, school_info: school_info
    sign_in user

    refute user.school_info.country.nil?

    Timecop.travel 1.hour
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {
          country: '', school_type: ''
        }
      }
    }

    user.reload

    assert_response :success, response.body

    assert_equal user.school_info.id, school_info.id
    assert_equal user.school_info, school_info
    assert_first_tenure(user)
    assert_nil user.school_info.country

    Timecop.return
  end

  test 'initial, partial previous, unchanged, manual' do
    Timecop.freeze

    school_info = create :school_info, school_id: nil, validation_type: SchoolInfo::VALIDATION_NONE

    user = create :teacher, school_info: school_info
    sign_in user

    refute user.school_info.country.nil?

    Timecop.travel 1.hour
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: school_info.country, school_type: school_info.school_type, school_name: school_info.school_name,
          full_address: school_info.full_address}
      }
    }

    user.reload

    assert_response :success, response.body

    assert_equal user.school_info.id, school_info.id
    assert_equal user.school_info, school_info
    assert_first_tenure(user)
    refute_nil user.school_info.country

    Timecop.return
  end

  test 'initial, partial previous, submit, partial, manual' do
    Timecop.freeze

    school_info = create :school_info, school_id: nil, school_name: nil,  validation_type: SchoolInfo::VALIDATION_NONE

    user = create :teacher, school_info: school_info
    sign_in user

    refute user.school_info.country.nil?
    assert user.school_info.school_name.nil?

    Timecop.travel 1.hour
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: school_info.country, school_type: school_info.school_type, school_name: '',
          full_address: 'seattle, Washington'}
      }
    }

    user.reload

    assert_response :success, response.body

    assert_equal user.school_info.id, school_info.id
    assert_equal user.school_info, school_info
    assert_first_tenure(user)
    assert_nil user.school_info.school_name
    refute_nil user.school_info.country

    Timecop.return
  end

  test 'initial, partial previous, submit, complete, drop down' do
    Timecop.freeze

    user = create :teacher
    sign_in user

    new_school = create :school

    Timecop.travel 1.hour

    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {school_id: new_school.id}
      }
    }

    user.reload

    assert_response :success, response.body

    refute_nil user.school_info
    refute_nil user.school_info.school
    refute_empty user.user_school_infos
    assert_first_tenure(user)

    Timecop.return
  end

  test 'initial, partial previous, submit, complete, manual' do
    Timecop.freeze

    school_info = create :school_info, school_id: nil, school_name: nil, full_address: nil, validation_type: SchoolInfo::VALIDATION_NONE

    user = create :teacher, school_info: school_info
    sign_in user

    Timecop.travel 1.hour
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: 'United States', school_type: 'public', school_name: 'Acme Inc',
          full_address: 'Seattle, Washington'}
      }
    }

    user.reload

    assert_response :success, response.body

    refute_nil user.school_info
    refute_nil user.school_info.school_name
    refute_empty user.user_school_infos
    assert_first_tenure(user)

    Timecop.return
  end

  test 'confirmation, complete previous, submit, blank, manual' do
    Timecop.freeze

    school_info = create :school_info

    user = create :teacher, school_info: school_info
    sign_in user

    Timecop.travel 1.hour
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: '', school_type: ''}
      }
    }

    user.reload

    assert_response :success, response.body

    refute_nil user.school_info
    refute_empty user.user_school_infos
    assert_equal user.user_school_infos.count, 1
    assert_in_delta 1.hour.ago.to_i, user.user_school_infos.last.last_confirmation_date.to_i, 10

    Timecop.return
  end

  test 'confirmation, complete previous, submit, unchanged, dropdown' do
    Timecop.freeze

    school_info = create :school_info

    user = create :teacher, school_info: school_info
    sign_in user

    Timecop.travel 1.hour
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {school_id: school_info.school.id}
      }
    }

    user.reload

    assert_response :success, response.body
    refute_nil user.school_info
    assert_first_tenure(user)

    Timecop.return
  end

  test 'confirmation, complete previous, submit, unchanged, manual' do
    Timecop.freeze

    school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})

    user = create :teacher, school_info: school_info
    sign_in user

    Timecop.travel 1.hour
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: school_info.country, school_type: school_info.school_type, school_name: school_info.school_name,
        full_address: school_info.full_address}
      }
    }

    user.reload

    assert_response :success, response.body
    refute_nil user.school_info
    assert_first_tenure(user)

    Timecop.return
  end

  test 'confirmation, complete previous, submit, partial, manual' do
    Timecop.freeze

    school_info = SchoolInfo.create({country: 'United States', school_name: 'Philly High Harmony', school_type: 'public', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})

    user = create :teacher, school_info: school_info
    sign_in user

    Timecop.travel 1.year
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: 'United States', school_type: '', school_name: '', full_address: school_info.full_address}
      }
    }

    user.reload

    assert_response :success, response.body
    refute_nil user.school_info
    assert_equal user.user_school_infos.count, 2
    assert_nil user.user_school_infos.last.end_date
    assert_equal Time.now.utc.to_date, user.user_school_infos.last.start_date.to_date
    assert_equal Time.now.utc.to_date, user.user_school_infos.first.end_date.to_date

    Timecop.return
  end

  # test 'confirmation, complete previous, submit, complete, dropdown' do
  # end

  # test 'confirmation, complete previous, submit, complete, manual' do
  # end

  # test 'confirmation, partial previous, blank, manual' do
  # end

  # test 'confirmation, partial previous, unchanged, manual' do
  # end

  # test 'confirmation, partial previous, partial, manual' do
  # end

  # test 'confirmation, partial previous, complete, dropdown' do
  # end

  # test 'confirmation, partial previous, complete, manual' do
  # end
end
