require 'test_helper'

module Pd::Application
  class PrincipalApproval1819ApplicationTest < ActiveSupport::TestCase
    test 'does not require user or status' do
      application = build :pd_principal_approval1819_application, user: nil, status: nil, approved: 'Yes'
      assert application.valid?
    end

    test 'does not require answers for school demographic data if application is rejected' do
      application = build :pd_principal_approval1819_application, approved: 'No'
      assert application.valid?
      application.update_form_data_hash({do_you_approve: 'Yes'})
      refute application.valid?
    end

    test 'requires csp/csd replacement course info if a course is being replaced' do
      application = build :pd_principal_approval1819_application, replace_course: Pd::Application::PrincipalApproval1819Application.options[:replace_course][1]
      assert application.valid?
      application.update_form_data_hash({replace_course: 'Yes'})
      refute application.valid?
    end
  end
end
