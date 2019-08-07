require 'test_helper'

module Pd::Application
  class PdWorkshopHelperTest < ActionView::TestCase
    include PdWorkshopHelper
    include ActiveApplicationModels

    self.use_transactional_test_case = true
    setup_all do
      @workshop = create :workshop
      @application = create TEACHER_APPLICATION_FACTORY, pd_workshop_id: @workshop.id

      @application_no_workshop = create FACILITATOR_APPLICATION_FACTORY, pd_workshop_id: nil
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
      deleted_workshop = create :workshop
      application = create FACILITATOR_APPLICATION_FACTORY, pd_workshop_id: deleted_workshop.id
      create :pd_enrollment, workshop: deleted_workshop, user: application.user
      deleted_workshop.destroy
      refute application.registered_workshop?
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
      # Workshops, Sessions, Enrollments
      assert_queries 3 do
        TEACHER_APPLICATION_CLASS.prefetch_workshops([@application.pd_workshop_id])
      end

      assert_queries 0 do
        assert_equal @workshop, @application.workshop
      end
    end

    test 'cache expires in 30 seconds' do
      TEACHER_APPLICATION_CLASS.prefetch_associated_models([@application])

      Timecop.travel(30.seconds) do
        assert_queries 3 do
          assert_equal @workshop, @application.workshop
        end
      end
    end

    test 'prefetch scales without additional queries' do
      workshops = create_list :workshop, 10
      applications = 10.times.map do |i|
        create FACILITATOR_APPLICATION_FACTORY, pd_workshop_id: workshops[i].id
      end

      # 10 applications, still only 3 queries
      assert_queries 3 do
        FACILITATOR_APPLICATION_CLASS.prefetch_associated_models(applications)
      end

      assert_queries 0 do
        assert_equal workshops, applications.map(&:workshop)
      end
    end
  end
end
