require 'test_helper'
require 'cdo/shared_constants/pd/teacher1819_application_constants'

module Pd::Application
  class WorkshopAutoenrolledApplicationTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true
    setup_all do
      @workshop = create :pd_workshop
      @application = create :pd_workshop_autoenrolled_application, pd_workshop_id: @workshop.id
      @application_no_workshop = create :pd_workshop_autoenrolled_application, pd_workshop_id: nil
      @user = @application.user
    end
    setup do
      @application.reload
    end

    test 'application.workshop returns the workshop associated with the assigned id' do
      assert_equal @workshop, @application.workshop
    end

    test 'application.workshop returns nil if the assigned workshop has been deleted' do
      @workshop.destroy!
      assert_nil @application.workshop
    end

    test 'registered_workshop? returns true when the applicant is enrolled in the assigned workshop' do
      create :pd_enrollment, workshop: @workshop, user: @user
      assert @application.registered_workshop?
    end

    test 'registered_workshop? returns false when the applicant is not enrolled in the assigned workshop' do
      refute @application.registered_workshop?
    end

    test 'registered_workshop? returns false when no workshop is assigned' do
      refute @application_no_workshop.registered_workshop?
    end

    test 'registered_workshop? handles deleted workshops gracefully' do
      deleted_workshop = create :pd_workshop
      application = create :pd_workshop_autoenrolled_application, pd_workshop_id: deleted_workshop.id
      create :pd_enrollment, workshop: deleted_workshop, user: application.user
      deleted_workshop.destroy
      refute application.registered_workshop?
    end

    test 'teachercon_cohort' do
      teachercon = create :pd_workshop, :teachercon, num_sessions: 5, sessions_from: Time.new(2018, 7, 22, 9)

      included = [
        create(:pd_workshop_autoenrolled_application, :locked, pd_workshop_id: teachercon.id, status: :accepted),
        create(:pd_workshop_autoenrolled_application, :locked, pd_workshop_id: teachercon.id, status: :waitlisted)
      ]

      excluded = [
        # not teachercon
        create(:pd_workshop_autoenrolled_application, :locked, pd_workshop_id: @workshop.id, status: :accepted),

        # not locked
        create(:pd_workshop_autoenrolled_application, pd_workshop_id: teachercon.id, status: :accepted),

        # not accepted or waitlisted
        @application,

        # no workshop
        @application_no_workshop
      ]

      teachercon_cohort = WorkshopAutoenrolledApplication.teachercon_cohort

      included.each do |application|
        assert teachercon_cohort.include? application
      end
      excluded.each do |application|
        refute teachercon_cohort.include? application
      end
    end

    test 'no unnecessary workshop query when none assigned' do
      @application.update!(pd_workshop_id: nil)

      assert_queries 0 do
        assert_nil @application.workshop
      end
    end

    test 'workshop cache' do
      create :pd_enrollment, workshop: @workshop, user: @application.user

      # Original query: Workshop, Sessions, Enrollments
      assert_queries 3 do
        assert_equal @workshop, @application.workshop
      end

      # Cached
      assert_queries 0 do
        assert_equal @workshop, @application.workshop
        assert @application.registered_workshop?
      end
    end

    test 'workshop cache prefetch' do
      # Workshops, Sessions, Enrollments,
      assert_queries 3 do
        WorkshopAutoenrolledApplication.prefetch_associated_models([@application])
      end

      assert_queries 0 do
        assert_equal @workshop, @application.workshop
      end
    end

    test 'cache expires in 30 seconds' do
      WorkshopAutoenrolledApplication.prefetch_associated_models([@application])

      Timecop.travel(30.seconds) do
        assert_queries 3 do
          assert_equal @workshop, @application.workshop
        end
      end
    end

    test 'prefetch scales without additional queries' do
      workshops = create_list :pd_workshop, 10
      applications = 10.times.map do |i|
        create :pd_workshop_autoenrolled_application, pd_workshop_id: workshops[i].id
      end

      # 10 applications, still only 3 queries
      assert_queries 3 do
        WorkshopAutoenrolledApplication.prefetch_associated_models(applications)
      end

      assert_queries 0 do
        assert_equal workshops, applications.map(&:workshop)
      end
    end
  end
end
