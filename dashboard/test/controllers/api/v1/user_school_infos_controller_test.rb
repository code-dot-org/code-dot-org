require 'test_helper'
require 'timecop'

class UserSchoolInfosControllerTest < ActionDispatch::IntegrationTest
  setup do
    Timecop.freeze
    @teacher = create :teacher
  end

  teardown do
    Timecop.return
  end

  test "last confirmation date in user school infos table is updated" do
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

  # The next set of tests checks all of the (known) valid call patterns for the
  # PATCH /api/v1/user_school_infos route.
  #
  # We identified the parameters that affect the expected behavior of this route:
  #
  # PREVIOUS STATE VARIATIONS
  #   *  Iniital flow / Confirmation flow
  #      Initial flow is when the teacher has never given us complete school
  #      info before (~7 days after sign-up). Confirmation flow is when we
  #      ask them to confirm/change their school info, a year later.
  #
  #   *  No previous entry / partial previous entry / complete previous entry
  #      It's possible for a teacher to save partial school info, in which case
  #      we record it and use it when we ask them to complete that info at the
  #      earliest opportunity.
  #
  #   Together, these produce four relevant previous states:
  #   1. Initial flow, no previous entry
  #      The very first time we ask a teacher for this information
  #   2. Initial flow, partial previous entry
  #      Teacher has given us partial entry but never a complete entry
  #   3. Confirmation flow, complete previous entry
  #      Our first time re-prompting the teacher a year after the last complete entry
  #   4. Confirmation flow, partial previous entry
  #      The teacher has a complete previous entry (because it's the confirmation flow)
  #      _and_ a partial previous entry, we want them to complete the partial entry.
  #
  # CALL PARAMETERS
  #   *.  Blank / Unchanged / Partial / Complete
  #   *.  Found school in Dropdown / Not in dropdown, manually entered
  #
  #   Together, these produce six relevant call parameter patterns:
  #   1. Blank submission
  #   2. Unchanged from previous, school is in dropdown
  #   3. Unchanged from previous, school is manually entered
  #   4. Partial entry, school is manually entered
  #   5. Complete entry, school is in dropdown
  #   6. Complete entry, school is manually entered
  #
  # All together, we have less than 24 cases because not every previous state and
  # call pattern combination makes sense - for example, you can't make an
  # "Unchanged / Dropdown" call when the previous entry is partial.

  def assert_first_tenure(user)
    tenure = user.user_school_infos.last
    assert_equal user.user_school_infos.count, 1
    assert_equal user.created_at, tenure.start_date
    assert_in_delta Time.now.to_i, tenure.last_confirmation_date.to_i, 10
    assert_nil tenure.end_date
  end

  test 'initial, no previoius, blank, manual' do
    sign_in @teacher

    submit_blank_school_info
    @teacher.reload

    assert_response :success, response.body
    assert_nil @teacher.school_info
    assert_empty @teacher.user_school_infos
  end

  test 'initial, no previoius, partial, manual' do
    sign_in @teacher

    Timecop.travel 1.hour

    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: 'United States', school_type: 'private', school_name: '', full_address: ''}
      }
    }

    @teacher.reload

    assert_response :success, response.body
    refute_nil @teacher.school_info
    assert @teacher.school_info.school_name.nil?
    assert_first_tenure(@teacher)
  end

  test 'initial, no previoius, complete, drop down' do
    sign_in @teacher

    school = create :school

    Timecop.travel 1.hour

    assert_creates SchoolInfo do
      patch "/api/v1/user_school_infos", params: {
        user: {
          school_info_attributes: {school_id: school.id}
        }
      }
    end

    @teacher.reload

    assert_response :success, response.body

    refute_nil @teacher.school_info
    refute_nil @teacher.school_info.school
    refute_empty @teacher.user_school_infos
    assert_first_tenure(@teacher)
  end

  test 'initial, no previous, complete, manual' do
    sign_in @teacher

    Timecop.travel 1.hour

    assert_creates SchoolInfo do
      patch "/api/v1/user_school_infos", params: {
        user: {
          school_info_attributes: {country: 'United States', school_type: 'public', school_name: 'The School of Rock',
            full_address: 'Seattle, Washington USA'}
        }
      }
    end

    @teacher.reload

    assert_response :success, response.body

    refute_nil @teacher.school_info
    refute_nil @teacher.school_info.school_name
    refute_empty @teacher.user_school_infos
    assert_first_tenure(@teacher)
  end

  test 'initial, partial previous, blank, manual' do
    school_info = create :school_info, school_id: nil, validation_type: SchoolInfo::VALIDATION_NONE

    @teacher.update school_info: school_info
    sign_in @teacher

    refute @teacher.school_info.country.nil?

    Timecop.travel 1.hour
    submit_blank_school_info

    @teacher.reload

    assert_response :success, response.body

    assert_equal @teacher.school_info.id, school_info.id
    assert_equal @teacher.school_info, school_info
    assert_first_tenure(@teacher)
    assert_nil @teacher.school_info.country
  end

  test 'initial, partial previous, unchanged, manual' do
    school_info = create :school_info, school_id: nil, validation_type: SchoolInfo::VALIDATION_NONE

    @teacher.update school_info: school_info
    sign_in @teacher

    refute @teacher.school_info.country.nil?

    Timecop.travel 1.hour
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: school_info.country, school_type: school_info.school_type, school_name: school_info.school_name,
          full_address: school_info.full_address}
      }
    }

    @teacher.reload

    assert_response :success, response.body

    assert_equal @teacher.school_info.id, school_info.id
    assert_equal @teacher.school_info, school_info
    assert_first_tenure(@teacher)
    refute_nil @teacher.school_info.country
  end

  test 'initial, partial previous, submit, partial, manual' do
    school_info = create :school_info, school_id: nil, school_name: nil,  validation_type: SchoolInfo::VALIDATION_NONE

    @teacher.update school_info: school_info
    sign_in @teacher

    refute @teacher.school_info.country.nil?
    assert @teacher.school_info.school_name.nil?

    Timecop.travel 1.hour
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: school_info.country, school_type: school_info.school_type, school_name: '',
          full_address: 'seattle, Washington'}
      }
    }

    @teacher.reload

    assert_response :success, response.body

    assert_equal @teacher.school_info.id, school_info.id
    assert_equal @teacher.school_info, school_info
    assert_first_tenure(@teacher)
    assert_nil @teacher.school_info.school_name
    refute_nil @teacher.school_info.country
  end

  test 'initial, partial previous, submit, complete, drop down' do
    school_info = create :school_info, school_id: nil, school_name: nil,  validation_type: SchoolInfo::VALIDATION_NONE

    @teacher.update school_info: school_info
    sign_in @teacher

    new_school = create :school

    Timecop.travel 1.hour

    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {school_id: new_school.id}
      }
    }

    @teacher.reload

    assert_response :success, response.body

    refute_nil @teacher.school_info
    refute_nil @teacher.school_info.school
    refute_empty @teacher.user_school_infos
    assert_first_tenure(@teacher)
  end

  test 'initial, partial previous, submit, complete, manual' do
    school_info = create :school_info, school_id: nil, school_name: nil, full_address: nil, validation_type: SchoolInfo::VALIDATION_NONE

    @teacher.update school_info: school_info
    sign_in @teacher

    Timecop.travel 1.hour
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: 'United States', school_type: 'public', school_name: 'Acme Inc',
          full_address: 'Seattle, Washington'}
      }
    }

    @teacher.reload

    assert_response :success, response.body

    refute_nil @teacher.school_info
    refute_nil @teacher.school_info.school_name
    refute_empty @teacher.user_school_infos
    assert_first_tenure(@teacher)
  end

  test 'confirmation, complete previous, submit, blank, manual' do
    school_info = create :school_info

    @teacher.update school_info: school_info
    sign_in @teacher

    Timecop.travel 1.hour
    submit_blank_school_info

    @teacher.reload

    assert_response :success, response.body

    refute_nil @teacher.school_info
    refute_empty @teacher.user_school_infos
    assert_equal @teacher.user_school_infos.count, 1
    assert_in_delta 1.hour.ago.to_i, @teacher.user_school_infos.last.last_confirmation_date.to_i, 10
  end

  test 'confirmation, complete previous, submit, unchanged, dropdown' do
    school_info = create :school_info

    @teacher.update school_info: school_info
    sign_in @teacher

    Timecop.travel 1.hour
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {school_id: school_info.school.id}
      }
    }

    @teacher.reload

    assert_response :success, response.body
    refute_nil @teacher.school_info
    assert_first_tenure(@teacher)
  end

  test 'confirmation, complete previous, submit, unchanged, manual' do
    school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})

    @teacher.update school_info: school_info
    sign_in @teacher

    Timecop.travel 1.hour
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: school_info.country, school_type: school_info.school_type, school_name: school_info.school_name,
        full_address: school_info.full_address}
      }
    }

    @teacher.reload

    assert_response :success, response.body
    refute_nil @teacher.school_info
    assert_first_tenure(@teacher)
  end

  test 'confirmation, complete previous, submit, partial, manual' do
    school_info = SchoolInfo.create({country: 'United States', school_name: 'Philly High Harmony', school_type: 'public', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})

    @teacher.update school_info: school_info
    sign_in @teacher

    Timecop.travel 1.year
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: 'United States', school_type: '', school_name: '', full_address: school_info.full_address}
      }
    }

    @teacher.reload

    assert_response :success, response.body
    refute_nil @teacher.school_info
    assert_equal @teacher.user_school_infos.count, 2
    assert_nil @teacher.user_school_infos.last.end_date
    assert_equal Time.now.utc.to_date, @teacher.user_school_infos.last.start_date.to_date
    assert_equal Time.now.utc.to_date, @teacher.user_school_infos.first.end_date.to_date
  end

  test 'confirmation, complete previous, submit, complete, dropdown' do
    school_info = create :school_info

    @teacher.update school_info: school_info
    sign_in @teacher

    new_school = create :school

    Timecop.travel 1.year

    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {school_id: new_school.id}
      }
    }

    @teacher.reload

    assert_response :success, response.body

    refute_nil @teacher.school_info
    assert_equal @teacher.user_school_infos.count, 2
    assert_nil @teacher.user_school_infos.last.end_date
    assert_equal Time.now.utc.to_date, @teacher.user_school_infos.last.start_date.to_date
    assert_equal Time.now.utc.to_date, @teacher.user_school_infos.first.end_date.to_date
  end

  test 'confirmation, complete previous, submit, complete, manual' do
    school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})

    @teacher.update school_info: school_info
    sign_in @teacher

    Timecop.travel 1.year
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: 'United States', school_type: 'private', school_name: 'School of Rock',
        full_address: 'Nashville, TN'}
      }
    }

    @teacher.reload

    assert_response :success, response.body
    refute_nil @teacher.school_info
    assert_equal @teacher.user_school_infos.count, 2
    assert_nil @teacher.user_school_infos.last.end_date
    assert_equal Time.now.utc.to_date, @teacher.user_school_infos.last.start_date.to_date
    assert_equal Time.now.utc.to_date, @teacher.user_school_infos.first.end_date.to_date
    refute_equal @teacher.user_school_infos.last.school_info.school_name, @teacher.user_school_infos.first.school_info.school_name
  end

  test 'confirmation, partial previous, blank, manual' do
    complete_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})
    @teacher.update(school_info: complete_school_info)

    Timecop.travel 1.year

    partial_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: nil, full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})
    @teacher.update(school_info: partial_school_info)

    Timecop.travel 7.days

    sign_in @teacher
    submit_blank_school_info

    assert_nil @teacher.user_school_infos.last.school_info.school_name
    assert_equal @teacher.user_school_infos.count, 2
  end

  test 'confirmation, partial previous, unchanged, manual' do
    complete_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})
    @teacher.update(school_info: complete_school_info)

    Timecop.travel 1.year

    partial_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: nil, full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})
    @teacher.update(school_info: partial_school_info)

    Timecop.travel 7.days

    sign_in @teacher
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: 'United States', school_type: 'public', school_name: '', full_address: 'Seattle, Washington'}
      }
    }

    assert_nil @teacher.user_school_infos.last.school_info.school_name
    assert_equal @teacher.user_school_infos.count, 2
    assert_equal Time.now.utc.to_date, @teacher.user_school_infos.last.last_confirmation_date.to_date
  end

  test 'confirmation, partial previous, partial, manual' do
    complete_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})
    @teacher.update(school_info: complete_school_info)

    Timecop.travel 1.year

    partial_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: nil, full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})
    @teacher.update(school_info: partial_school_info)

    Timecop.travel 7.days

    sign_in @teacher
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: 'United States', school_type: 'public', school_name: '', full_address: 'Dallas, TX'}
      }
    }

    assert_nil @teacher.user_school_infos.last.school_info.school_name
    assert_equal @teacher.user_school_infos.count, 2
    assert_equal Time.now.utc.to_date, @teacher.user_school_infos.last.last_confirmation_date.to_date
    assert_equal @teacher.user_school_infos.last.school_info.full_address, 'Dallas, TX'
  end

  test 'confirmation, partial previous, complete, dropdown' do
    new_school = create :school

    complete_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})
    @teacher.update(school_info: complete_school_info)

    Timecop.travel 1.year

    partial_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: nil, full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})
    @teacher.update(school_info: partial_school_info)

    Timecop.travel 7.days

    sign_in @teacher
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {school_id: new_school.id}
      }
    }

    assert_equal @teacher.user_school_infos.count, 2
    assert_equal Time.now.utc.to_date, @teacher.user_school_infos.last.last_confirmation_date.to_date
    assert_equal @teacher.user_school_infos.last.school_info.school, new_school
  end

  test 'confirmation, partial previous, complete, manual' do
    complete_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})
    @teacher.update(school_info: complete_school_info)

    Timecop.travel 1.year

    partial_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: nil, full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_NONE})
    @teacher.update(school_info: partial_school_info)

    Timecop.travel 7.days

    sign_in @teacher
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {country: 'United States', school_type: 'public', school_name: 'Pleasantville High', full_address: 'Dallas, TX'}
      }
    }

    assert_equal @teacher.user_school_infos.last.school_info.school_name, 'Pleasantville High'
    assert_equal @teacher.user_school_infos.count, 2
    assert_equal Time.now.utc.to_date, @teacher.user_school_infos.last.last_confirmation_date.to_date
  end

  private def submit_blank_school_info
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {
          country: '',
          school_type: ''
        }
      }
    }
  end
end
