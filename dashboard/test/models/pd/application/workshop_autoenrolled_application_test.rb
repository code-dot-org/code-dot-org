require 'test_helper'
require 'cdo/shared_constants/pd/teacher1819_application_constants'

module Pd::Application
  class WorkshopAutoenrolledApplicationTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true
    setup_all do
      @workshop = create :pd_workshop
      @application = create :pd_workshop_autoenrolled_application, pd_workshop_id: @workshop.id
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
      @application.update! pd_workshop_id: nil
      refute @application.registered_workshop?
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
