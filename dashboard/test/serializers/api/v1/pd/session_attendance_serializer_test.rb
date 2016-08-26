require 'test_helper'

class Api::V1::Pd::SessionAttendanceSerializerTest < ::ActionController::TestCase
  test 'enrollments and section members match on email regardless of case' do
    workshop = create :pd_workshop
    workshop.sessions << create(:pd_session, workshop: workshop)
    workshop.start!

    create :pd_enrollment, workshop: workshop, email: 'Person@example.net'
    teacher = create :teacher, email: 'person@example.net'
    workshop.section.add_student teacher

    serialized = ::Api::V1::Pd::SessionAttendanceSerializer.new(workshop.sessions.first).attributes
    assert_equal 1, serialized[:attendance].count
  end
end
