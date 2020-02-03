require 'test_helper'

class Api::V1::Pd::SessionAttendanceSerializerTest < ::ActionController::TestCase
  setup do
    @workshop = create :workshop, num_sessions: 1
    @workshop.start!
  end

  test 'attended with user account' do
    teacher = create :pd_workshop_participant, workshop: @workshop, enrolled: true, attended: true
    teacher.update(sign_in_count: 1)

    serialized = ::Api::V1::Pd::SessionAttendanceSerializer.new(@workshop.sessions.first).attributes
    assert_equal 1, serialized[:attendance].count
    assert_equal teacher.id, serialized[:attendance].first[:user_id]
    assert serialized[:attendance].first[:attended]
  end

  test 'attended without user account' do
    enrollment = create :pd_enrollment, workshop: @workshop
    create :pd_attendance_no_account, session: @workshop.sessions.first, enrollment: enrollment

    serialized = ::Api::V1::Pd::SessionAttendanceSerializer.new(@workshop.sessions.first).attributes
    assert_equal 1, serialized[:attendance].count
    assert_nil serialized[:attendance].first[:user_id]
    assert_equal enrollment.id, serialized[:attendance].first[:enrollment_id]
    assert serialized[:attendance].first[:attended]
  end

  test 'not attended user account' do
    teacher = create :pd_workshop_participant, workshop: @workshop, enrolled: true, attended: false
    teacher.update(sign_in_count: 1)

    serialized = ::Api::V1::Pd::SessionAttendanceSerializer.new(@workshop.sessions.first).attributes
    assert_equal 1, serialized[:attendance].count
    assert_equal teacher.id, serialized[:attendance].first[:user_id]
    refute serialized[:attendance].first[:attended]
  end

  test 'not attended without user account' do
    create :pd_enrollment, workshop: @workshop

    serialized = ::Api::V1::Pd::SessionAttendanceSerializer.new(@workshop.sessions.first).attributes
    assert_equal 1, serialized[:attendance].count
    assert_nil serialized[:attendance].first[:user_id]
    refute serialized[:attendance].first[:attended]
  end
end
