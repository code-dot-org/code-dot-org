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
  end
end
