require 'test_helper'
require 'timecop'

class UserSchoolInfosControllerTest < ActionDispatch::IntegrationTest
  setup do
    Timecop.freeze
    @teacher = create :teacher
    @second_teacher = create :teacher
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

  # We identified the parameters that affect the expected behavior of this route:

  # PREVIOUS STATE VARIATIONS
  #   *  Iniital flow / Confirmation flow
  #      Initial flow is when the teacher has never given us complete school
  #      info before (~7 days after sign-up). Confirmation flow is when we
  #      ask them to confirm/change their school info, a year later.

  #   *  No previous entry / partial previous entry / complete previous entry
  #      It's possible for a teacher to save partial school info, in which case
  #      we record it and use it when we ask them to complete that info at the
  #      earliest opportunity.

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

  # CALL PARAMETERS
  #   *.  Blank / Unchanged / Partial / Complete
  #   *.  Found school in Dropdown / Not in dropdown, manually entered

  #   Together, these produce six relevant call parameter patterns:
  #   1. Blank submission
  #   2. Unchanged from previous, school is in dropdown
  #   3. Unchanged from previous, school is manually entered
  #   4. Partial entry, school is manually entered
  #   5. Complete entry, school is in dropdown
  #   6. Complete entry, school is manually entered

  # All together, we have less than 24 cases because not every previous state and
  # call pattern combination makes sense - for example, you can't make an
  # "Unchanged / Dropdown" call when the previous entry is partial.

  def assert_first_tenure(user)
    tenure = user.user_school_infos.last
    assert user.user_school_infos.count >= 1
    assert_in_delta Time.now.to_i, tenure.last_confirmation_date.to_i, 10
    assert_nil tenure.end_date
  end

  test 'initial, no previous, blank, manual' do
    sign_in @teacher

    submit_blank_school_info
    assert_response 422

    @teacher.reload
    assert_nil @teacher.school_info
    assert_empty @teacher.user_school_infos
  end

  test 'initial, no previous, partial, manual' do
    sign_in @teacher

    Timecop.travel 1.hour

    submit_partial_school_info
    assert_response 422

    @teacher.reload
    assert_nil @teacher.school_info
    assert_equal 0, @teacher.user_school_infos.count
  end

  test 'initial, no previous, complete, drop down' do
    sign_in @teacher

    school = create :school

    Timecop.travel 1.hour

    submit_complete_school_info_from_dropdown(school)

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
      submit_complete_school_info_manual
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

    Timecop.travel 1.hour
    submit_blank_school_info
    assert_response 422

    @teacher.reload

    assert_response 422, response.body
    assert_equal @teacher.school_info.id, school_info.id
    assert_equal @teacher.school_info, school_info
    refute_nil @teacher.school_info.country
  end

  test 'initial, partial previous, partial, manual' do
    school_info = create :school_info, school_id: nil, school_name: nil, validation_type: SchoolInfo::VALIDATION_NONE

    @teacher.update school_info: school_info
    sign_in @teacher

    refute @teacher.school_info.country.nil?
    assert @teacher.school_info.school_name.nil?

    Timecop.travel 1.hour
    submit_partial_school_info
    assert_response 422

    @teacher.reload

    assert_response 422
    assert_equal @teacher.school_info.id, school_info.id
    assert_equal @teacher.school_info, school_info
    assert_nil @teacher.school_info.school_name
    refute_nil @teacher.school_info.country
  end

  test 'initial, partial previous, complete, drop down' do
    school_info = create :school_info, school_id: nil, school_name: nil, validation_type: SchoolInfo::VALIDATION_NONE

    @teacher.update school_info: school_info
    sign_in @teacher

    new_school = create :school

    Timecop.travel 1.hour

    submit_complete_school_info_from_dropdown(new_school)

    @teacher.reload

    assert_response :success, response.body

    refute_nil @teacher.school_info
    refute_nil @teacher.school_info.school
    refute_empty @teacher.user_school_infos
    assert_first_tenure(@teacher)
  end

  test 'initial, partial previous, complete, manual' do
    school_info = create :school_info, school_id: nil, school_name: nil, full_address: nil, validation_type: SchoolInfo::VALIDATION_NONE

    @teacher.update school_info: school_info
    sign_in @teacher

    Timecop.travel 1.hour
    submit_complete_school_info_manual

    @teacher.reload

    assert_response :success, response.body

    refute_nil @teacher.school_info
    refute_nil @teacher.school_info.school_name
    refute_empty @teacher.user_school_infos
    assert_first_tenure(@teacher)
  end

  test 'confirmation, complete previous, blank, manual' do
    school_info = create :school_info

    @teacher.update school_info: school_info
    sign_in @teacher

    Timecop.travel 1.hour
    submit_blank_school_info

    @teacher.reload

    refute_nil @teacher.school_info
    refute_empty @teacher.user_school_infos
    assert_equal @teacher.user_school_infos.count, 1
    assert_in_delta 1.hour.ago.to_i, @teacher.user_school_infos.last.last_confirmation_date.to_i, 10
  end

  test 'confirmation, complete previous, unchanged, dropdown' do
    school_info = create :school_info

    @teacher.update school_info: school_info
    sign_in @teacher

    Timecop.travel 1.hour

    submit_complete_school_info_from_dropdown(school_info.school)

    @teacher.reload

    assert_response :success, response.body
    refute_nil @teacher.school_info
    assert_first_tenure(@teacher)
  end

  test 'confirmation, complete previous, unchanged, manual' do
    school_info = partial_manual_school_info

    @teacher.update school_info: school_info
    sign_in @teacher

    Timecop.travel 1.hour
    submit_unchanged_school_info school_info

    @teacher.reload

    assert_response :success, response.body
    refute_nil @teacher.school_info
    assert_first_tenure(@teacher)
  end

  test 'confirmation, complete previous, partial, manual' do
    school_info = partial_manual_school_info

    @teacher.update school_info: school_info
    sign_in @teacher

    Timecop.travel 1.year
    submit_partial_school_info
    assert_response 422

    @teacher.reload
    refute_nil @teacher.school_info
    assert_equal 1, @teacher.user_school_infos.count
    assert_nil @teacher.user_school_infos.last.end_date
  end

  test 'confirmation, complete previous, complete, dropdown' do
    school_info = create :school_info

    @teacher.update school_info: school_info
    sign_in @teacher

    new_school = create :school

    Timecop.travel 1.year

    submit_complete_school_info_from_dropdown(new_school)

    @teacher.reload

    assert_response :success, response.body

    refute_nil @teacher.school_info
    assert_equal 2, @teacher.user_school_infos.count
    assert_nil @teacher.user_school_infos.last.end_date
    assert_equal Time.now.utc.to_date, @teacher.user_school_infos.last.start_date.to_date
    assert_equal Time.now.utc.to_date, @teacher.user_school_infos.first.end_date.to_date
  end

  test 'confirmation, complete previous, complete, manual' do
    school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_COMPLETE})

    @teacher.update school_info: school_info
    sign_in @teacher

    Timecop.travel 1.year

    submit_complete_school_info_manual
    assert_response :success, response.body

    @teacher.reload
    assert_equal @teacher.user_school_infos.count, 2
    old_tenure = @teacher.user_school_infos.first
    new_tenure = @teacher.user_school_infos.last
    assert_same_date Time.now, old_tenure.end_date
    assert_same_date Time.now, new_tenure.start_date
    assert_nil new_tenure.end_date
    refute_equal new_tenure.school_info.school_name, old_tenure.school_info.school_name
  end

  private def assert_same_date(expected, actual)
    assert_equal expected.utc.to_date, actual.utc.to_date
  end

  test 'confirmation, partial previous, blank, manual' do
    complete_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_COMPLETE})
    assert @teacher.update(school_info: complete_school_info)

    Timecop.travel 1.year
    @teacher.reload

    partial_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: nil, full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_COMPLETE})
    refute @teacher.update(school_info: partial_school_info)

    Timecop.travel 7.days
    @teacher.reload

    sign_in @teacher
    submit_blank_school_info

    assert_response 422
    refute_nil @teacher.user_school_infos.last.school_info.school_name
    assert_equal 1, @teacher.user_school_infos.count
  end

  test 'confirmation, partial previous, unchanged, manual' do
    complete_school_info = SchoolInfo.create({country: 'US', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_COMPLETE})
    assert @teacher.update(school_info: complete_school_info)

    Timecop.travel 1.year
    @teacher.reload

    partial_school_info = SchoolInfo.create({country: 'US', school_type: 'public', school_name: nil, full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_COMPLETE})
    refute @teacher.update(school_info: partial_school_info)

    Timecop.travel 7.days
    @teacher.reload

    sign_in @teacher
    submit_unchanged_school_info partial_school_info
    assert_response 422

    @teacher.reload
    assert_equal 1, @teacher.user_school_infos.count
    new_tenure = @teacher.user_school_infos.last
    refute_nil new_tenure.school_info.school_name
  end

  test 'confirmation, partial previous, partial, manual' do
    complete_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_COMPLETE})
    assert @teacher.update(school_info: complete_school_info)

    Timecop.travel 1.year
    @teacher.reload

    partial_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: nil, full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_COMPLETE})
    refute @teacher.update(school_info: partial_school_info)

    Timecop.travel 7.days
    @teacher.reload

    sign_in @teacher
    submit_partial_school_info
    assert_response 422

    new_tenure = @teacher.user_school_infos.last
    refute_nil @teacher.user_school_infos.last.school_info.school_name
    assert_equal 1, @teacher.user_school_infos.count
    refute_equal Time.now, new_tenure.last_confirmation_date
    assert_equal @teacher.user_school_infos.last.school_info.full_address, 'Seattle, Washington'
  end

  test 'confirmation, partial previous, complete, dropdown' do
    new_school = create :school

    complete_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_COMPLETE})
    assert @teacher.update(school_info: complete_school_info)

    Timecop.travel 1.year
    @teacher.reload

    partial_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: nil, full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_COMPLETE})
    refute @teacher.update(school_info: partial_school_info)

    Timecop.travel 7.days
    @teacher.reload

    sign_in @teacher
    submit_complete_school_info_from_dropdown(new_school)

    @teacher.reload

    new_tenure = @teacher.user_school_infos.last
    assert_equal 2, @teacher.user_school_infos.count
    assert_same_date Time.now, new_tenure.last_confirmation_date
    assert_equal new_tenure.school_info.school, new_school
  end

  test 'confirmation, partial previous, complete, manual' do
    complete_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_COMPLETE})
    assert @teacher.update(school_info: complete_school_info)

    Timecop.travel 1.year
    @teacher.reload

    partial_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: nil, full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_COMPLETE})
    refute @teacher.update(school_info: partial_school_info)

    Timecop.travel 7.days
    @teacher.reload

    sign_in @teacher
    submit_complete_school_info_manual

    @teacher.reload
    assert_response :success, response.body

    assert_equal 2, @teacher.user_school_infos.count
    new_tenure = @teacher.user_school_infos.last
    refute_equal new_tenure.school_info.school_name, 'Philly High Harmony'
    refute_nil new_tenure.school_info.school_name
    assert_same_date Time.now.utc, new_tenure.last_confirmation_date
  end

  test 'confirmation, partial previous, complete, dropdown, two users with the same school info, update only one user' do
    new_school = create :school

    complete_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'Philly High Harmony', full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_COMPLETE})
    assert @teacher.update(school_info: complete_school_info)

    second_teacher_complete_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: 'School of Rock', full_address: 'Harrisburg, PA', validation_type: SchoolInfo::VALIDATION_COMPLETE})
    assert @second_teacher.update(school_info: second_teacher_complete_school_info)

    Timecop.travel 1.year
    @teacher.reload

    partial_school_info = SchoolInfo.create({country: 'United States', school_type: 'public', school_name: nil, full_address: 'Seattle, Washington', validation_type: SchoolInfo::VALIDATION_COMPLETE})
    refute @teacher.update(school_info: partial_school_info)
    refute @second_teacher.update(school_info: partial_school_info)

    Timecop.travel 7.days
    @teacher.reload

    sign_in @teacher
    submit_complete_school_info_from_dropdown(new_school)

    @teacher.reload
    assert_response :success, response.body

    new_tenure = @teacher.user_school_infos.last
    assert_equal 2, @teacher.user_school_infos.count
    assert_same_date Time.now, new_tenure.last_confirmation_date
    assert_equal new_tenure.school_info.school, new_school
    refute_nil @second_teacher.user_school_infos.last.school_info.school_name
    refute_equal @second_teacher.user_school_infos.last.school_info.school, new_school
  end

  test 'confirmation complete submit unchanged manual info' do
    # Edge case involving complete school info

    # Given a user with a complete (dropdown OR manual) school info `A`
    school_info = SchoolInfo.create({country: 'US', school_type: 'public', school_name: 'Acme Inc', full_address: nil, validation_type: SchoolInfo::VALIDATION_NONE})
    @teacher.update school_info: school_info
    tenure_c = @teacher.user_school_infos.first
    assert tenure_c.school_info.complete?

    # When a year later they click "No" and "Save" without changing anything
    Timecop.travel 1.year
    sign_in @teacher
    submit_complete_school_info_manual_no_school_params
    assert_response :success, response.body

    # Then, only update the last confirmation date
    @teacher.reload
    assert_equal 1, @teacher.user_school_infos.count
    assert tenure_c.school_info.complete?
    assert_equal @teacher.school_info.id, school_info.id
  end

  test 'confirmation, complete, submit unchanged complete info' do
    # Edge case involving complete school info

    # Given a user with a complete (dropdown OR manual) school info `A`
    school_info = create :school_info
    @teacher.update school_info: school_info
    tenure_d = @teacher.user_school_infos.first
    assert tenure_d.school_info.complete?

    # When a year later they click "No" and "Save" without changing anything
    Timecop.travel 1.year
    sign_in @teacher
    submit_complete_school_info_from_dropdown school_info.school
    assert_response :success, response.body

    # Then, only update the last confirmation date
    @teacher.reload
    assert_equal 1, @teacher.user_school_infos.count
    assert tenure_d.school_info.complete?
    assert_equal @teacher.school_info.id, school_info.id
  end

  private def partial_manual_school_info
    SchoolInfo.create(
      country: 'United States',
      school_type: 'public',
      school_name: 'Philly High Harmony',
      full_address: 'Seattle, Washington',
      validation_type: SchoolInfo::VALIDATION_COMPLETE
    )
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

  private def submit_partial_school_info
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {
          country: 'United States',
          school_type: 'private',
          school_name: '',
          full_address: ''
        }
      }
    }
  end

  private def submit_complete_school_info_from_dropdown(school)
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {school_id: school.id}
      }
    }
  end

  private def submit_complete_school_info_manual
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {
          country: 'United States',
          school_type: 'public',
          school_name: 'Acme Inc',
          full_address: 'Seattle, Washington'
        }
      }
    }
  end

  private def submit_complete_school_info_manual_no_school_params
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {
          country: 'United States',
          school_type: 'public',
          school_name: 'Acme Inc',
          full_address: ''
        }
      }
    }
  end

  private def submit_unchanged_school_info(school_info)
    patch "/api/v1/user_school_infos", params: {
      user: {
        school_info_attributes: {
          country: school_info.country,
          school_type: school_info.school_type,
          school_name: school_info.school_name,
          full_address: school_info.full_address
        }
      }
    }
  end
end
