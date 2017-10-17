require 'test_helper'

module Pd::Application
  class FacilitatorApplication1819Text < ActiveSupport::TestCase
    test 'course is filled in from the form program before validation' do
      application = build :pd_facilitator_application1819

      assert_nil application.course
      application.valid?
      assert_equal 'csf', application.course
      assert application.csf?
    end
  end
end
