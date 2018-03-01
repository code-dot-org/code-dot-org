require 'test_helper'
require 'cdo/shared_constants/pd/teacher1819_application_constants'

module Pd::Application
  class WorkshopAutoenrolledApplicationTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true
    setup_all do
      @workshop = create :pd_workshop
      @application = create :pd_workshop_autoenrolled_application, pd_workshop_id: @workshop.id
    end

    test 'application.workshop returns the workshop associated with the assigned id' do
      assert_equal @workshop, @application.workshop
    end

    test 'application.workshop returns nil if the assigned workshop has been deleted' do
      @workshop.destroy!
      assert_nil @application.workshop
    end
  end
end
