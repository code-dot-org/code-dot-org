require 'test_helper'

module Pd
  class WorkshopTest < ActiveSupport::TestCase
    setup do
      @organizer = create(:workshop_organizer)
      @workshop = create(:pd_workshop, organizer: @organizer)
    end

    test 'query by organizer' do
      # create a workshop with a different organizer, which should not be returned below
      create(:pd_workshop)

      workshops = Workshop.organized_by @organizer
      assert_equal 1, workshops.length
      assert_equal workshops.first, @workshop
    end

    test 'query by facilitator' do
      facilitator = create(:facilitator)
      @workshop.facilitators << facilitator
      @workshop.save!

      # create a workshop with a different facilitator, which should not be returned below
      create(:pd_workshop, facilitators: [create(:facilitator)])

      workshops = Workshop.facilitated_by facilitator
      assert_equal 1, workshops.length
      assert_equal workshops.first, @workshop
    end

    test 'query by enrolled teacher' do
      # Teachers enroll in a workshop as a whole
      teacher = create :teacher
      create :pd_enrollment, workshop: @workshop, name: teacher.name, email: teacher.email

      # create a workshop with a different teacher enrollment, which should not be returned below
      other_workshop = create(:pd_workshop)
      create :pd_enrollment, workshop: other_workshop

      workshops = Workshop.enrolled_in_by teacher
      assert_equal 1, workshops.length
      assert_equal workshops.first, @workshop
    end

    test 'query by attended teacher' do
      # Teachers attend individual sessions in the workshop
      teacher = create :teacher
      session = create :pd_session
      @workshop.sessions << session
      create :pd_attendance, session: session, teacher: teacher

      # create a workshop attended by a different teacher, which should not be returned below
      other_workshop = create(:pd_workshop)
      other_session = create(:pd_session)
      other_workshop.sessions << other_session
      create :pd_attendance, session: other_session

      workshops = Workshop.attended_by teacher
      assert_equal 1, workshops.length
      assert_equal workshops.first, @workshop
    end

    test 'wont start without a session' do
      assert_equal 0, @workshop.sessions.length
      e = assert_raises Exception do
        @workshop.start!
      end
      assert_equal 'Workshop must have at least one session to start.', e.message
    end

    test 'start stop' do
      @workshop.sessions << create(:pd_session)
      assert_equal 'Not Started', @workshop.state

      @workshop.start!
      @workshop.reload
      assert_equal 'In Progress', @workshop.state

      @workshop.end!
      @workshop.reload
      assert_equal 'Ended', @workshop.state
    end
  end
end
