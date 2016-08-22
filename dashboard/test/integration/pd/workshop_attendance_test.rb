require 'test_helper'
include Warden::Test::Helpers

# More workshop attendance tests are currently in
# ../../controllers/api/v1/pd/workshop_attendance_controller_test.rb
class Pd::WorkshopAttendanceTest < ActionDispatch::IntegrationTest
  setup do
    @organizer = create :workshop_organizer
    @workshop = create :pd_workshop, organizer: @organizer, num_sessions: 1
    @workshop.start!

    @teacher = create :pd_workshop_participant, workshop: @workshop, enrolled: true, in_section: true
  end

  # In this context and in the rails application, but not controller unit tests, empty array params are converted to nil.
  # Apparently this behavior will be reversed in Rails 5 (https://github.com/rails/rails/pull/16924),
  # and this code will correctly work either way.
  test 'handle no attendance' do
    login_as @organizer

    patch attendance_url, attendance_params(false)

    assert_response :success
    assert_empty Pd::Attendance.for_workshop(@workshop).for_teacher(@teacher)
  end

  test 'update is idempotent' do
    login_as @organizer

    # Mark attended twice
    2.times do
      patch attendance_url, attendance_params(true)
      assert_response :success
      assert_equal 1, Pd::Attendance.for_teacher(@teacher).for_workshop(@workshop).count
    end

    # Mark unattended twice
    2.times do
      patch attendance_url, attendance_params(false)
      assert_response :success
      assert_empty Pd::Attendance.for_teacher(@teacher).for_workshop(@workshop)
    end
  end

  private

  def attendance_url
    "/api/v1/pd/workshops/#{@workshop.id}/attendance"
  end

  def attendance_params(attended)
    attendances = attended ? [{id: @teacher.id}] : []
    {
      pd_workshop: {
        session_attendances: [
          session_id: @workshop.sessions.first.id,
          attendances: attendances
        ]
      }
    }
  end
end
