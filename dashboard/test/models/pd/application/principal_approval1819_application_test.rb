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
      application = build :pd_principal_approval1819_application, replace_course: Pd::Application::PrincipalApproval1819Application::REPLACE_COURSE_NO
      assert application.valid?
      application.update_form_data_hash({replace_course: 'Yes'})
      refute application.valid?
    end

    test 'underrepresnted minority percent' do
      application = build :pd_principal_approval1819_application
      application.update_form_data_hash(
        {
          black: '10',
          hispanic: '15%',

          pacific_islander: '20.5%',
          american_indian: '11.0',
          white: '100000000',

          asian: '100000000',
          other: '100000000'
        }
      )
      assert_equal 56.5, application.underrepresented_minority_percent
    end

    test 'corresponding teacher application is required' do
      principal_application = build :pd_principal_approval1819_application, teacher_application: nil
      refute principal_application.valid?
      assert_equal ['Teacher application is required'], principal_application.errors.full_messages

      # fake guid won't work
      principal_application.application_guid = SecureRandom.uuid
      refute principal_application.valid?

      # real teacher application guid is required
      teacher_application = create :pd_teacher1819_application
      principal_application.application_guid = teacher_application.application_guid
      assert principal_application.valid?
    end
  end
end
