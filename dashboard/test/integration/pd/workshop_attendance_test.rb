require 'test_helper'
include Warden::Test::Helpers

# More workshop attendance tests are currently in ../controllers/api/v1/pd/workshop_attendance_controller_test.rb
class Pd::WorkshopAttendanceTest < ActionDispatch::IntegrationTest
  # In this context and in the rails application, but not controller unit tests, empty array params are converted to nil.
  # Apparently this behavior will be reversed in Rails 5 (https://github.com/rails/rails/pull/16924),
  # and this code will correctly work either way.
  test 'handle no attendance' do
    organizer = create(:workshop_organizer)
    login_as organizer

    workshop = create :pd_workshop, organizer: organizer
    session = create :pd_session
    workshop.sessions << session

    patch "/api/v1/pd/workshops/#{workshop.id}/attendance", pd_workshop: {
      session_attendances: [
        session_id: session.id,
        attendances: []
      ]
    }

    assert_response :success
  end
end
