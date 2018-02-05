require 'test_helper'
require 'state_abbr'

module Pd::Application
  class Facilitator1819ApplicationTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true
    setup_all do
      @regional_partner = create :regional_partner
    end

    test 'course is filled in from the form program before validation' do
      [:csf, :csd, :csp].each do |program|
        application_hash = build :pd_facilitator1819_application_hash_common, program
        application = build :pd_facilitator1819_application, form_data_hash: application_hash
        assert application.valid?, "Errors in #{program} application: #{application.errors.full_messages}"
        assert_equal program.to_s, application.course
      end
    end

    test 'match regional partner' do
      # match
      RegionalPartner.expects(:find_by_region).with('11111', 'WA').returns(@regional_partner)
      application_hash = build :pd_facilitator1819_application_hash, zip_code: '11111', state: 'Washington'
      application_with_match = create :pd_facilitator1819_application, form_data_hash: application_hash
      assert_equal @regional_partner, application_with_match.regional_partner

      # No match
      RegionalPartner.expects(:find_by_region).with('22222', 'WA').returns(nil)
      application_hash = build :pd_facilitator1819_application_hash, zip_code: '22222', state: 'Washington'
      application_without_match = create :pd_facilitator1819_application, form_data_hash: application_hash
      assert_nil application_without_match.regional_partner
    end

    test 'matched regional partner is not overridden by later form data' do
      RegionalPartner.expects(:find_by_region).never
      application = create :pd_facilitator1819_application, regional_partner: @regional_partner

      application.form_data = build(:pd_facilitator1819_application_hash)
      assert_equal @regional_partner, application.regional_partner
    end

    test 'open until Feb 1, 2018' do
      Timecop.freeze Time.zone.local(2018, 1, 31, 23, 59) do
        assert Facilitator1819Application.open?
      end
      Timecop.freeze Time.zone.local(2018, 2, 1) do
        refute Facilitator1819Application.open?
      end
    end

    test 'only one application allowed per user' do
      teacher = create :teacher
      create :pd_facilitator1819_application, user: teacher

      e = assert_raises ActiveRecord::RecordInvalid do
        create :pd_facilitator1819_application, user: teacher
      end
      assert_equal 'Validation failed: User has already been taken', e.message
    end

    test 'state_code and state_name' do
      application_hash = build :pd_facilitator1819_application_hash, state: 'Washington'
      application = build :pd_facilitator1819_application, form_data_hash: application_hash
      assert_equal 'Washington', application.state_name
      assert_equal 'WA', application.state_code
    end

    test 'answer_with_additional_text with defaults' do
      application_hash = build :pd_facilitator1819_application_hash
      application_hash[:institution_type] = ['School district', 'Other:']
      application_hash[:institution_type_other] = 'School of Witchcraft and Wizardry'

      assert_equal(
        [
          'School district',
          'Other: School of Witchcraft and Wizardry'
        ],
        Facilitator1819Application.answer_with_additional_text(application_hash, :institution_type)
      )
    end

    test 'answer_with_additional_text with custom field' do
      OPTION = 'A Code.org Regional Partner (please share name):'
      application_hash = build :pd_facilitator1819_application_hash
      application_hash[:how_heard] = [OPTION]
      application_hash[:how_heard_regional_partner] = 'Hogwarts Coding Wizards'

      assert_equal(
        [
          "#{OPTION} Hogwarts Coding Wizards"
        ],
        Facilitator1819Application.answer_with_additional_text(application_hash, :how_heard, OPTION, :how_heard_regional_partner)
      )
    end

    test 'csf applications have csd-csp answers filtered out' do
      application_hash = build :pd_facilitator1819_application_hash,
        :with_csf_specific_fields, :with_csd_csp_specific_fields,
        program: Facilitator1819Application::PROGRAMS[:csf]
      application = build :pd_facilitator1819_application, form_data_hash: application_hash, course: :csf

      answers = application.full_answers
      assert answers.key? :csf_availability
      assert answers.key? :csf_partial_attendance_reason
      refute answers.key? :csd_csp_fit_availability
      refute answers.key? :csd_csp_teachercon_availability
    end

    test 'csd and csp applications have csf answers filtered out' do
      [:csd, :csp].each do |course|
        application_hash = build :pd_facilitator1819_application_hash,
          :with_csf_specific_fields, :with_csd_csp_specific_fields,
          program: Facilitator1819Application::PROGRAMS[course]
        application = build :pd_facilitator1819_application, form_data_hash: application_hash, course: course

        answers = application.full_answers
        refute answers.key? :csf_availability
        refute answers.key? :csf_partial_attendance_reason
        assert answers.key? :csd_csp_fit_availability
        assert answers.key? :csd_csp_teachercon_availability
      end
    end

    test 'to_csv method' do
      application = create :pd_facilitator1819_application
      application.update(regional_partner: @regional_partner, status: 'accepted', notes: 'notes')

      csv_row = application.to_csv_row
      csv_answers = csv_row.split(',')
      assert_equal "#{@regional_partner.name}\n", csv_answers[-1]
      assert_equal 'notes', csv_answers[-2]
      assert_equal 'false', csv_answers[-3]
      assert_equal 'accepted', csv_answers[-4]
    end

    test 'send_decision_notification_email only sends to waitlisted and declined' do
      mock_mail = stub
      mock_mail.stubs(:deliver_now).returns(nil)

      Pd::Application::Facilitator1819ApplicationMailer.expects(:accepted).times(0)
      Pd::Application::Facilitator1819ApplicationMailer.expects(:interview).times(0)
      Pd::Application::Facilitator1819ApplicationMailer.expects(:pending).times(0)
      Pd::Application::Facilitator1819ApplicationMailer.expects(:unreviewed).times(0)
      Pd::Application::Facilitator1819ApplicationMailer.expects(:withdrawn).times(0)

      Pd::Application::Facilitator1819ApplicationMailer.expects(:declined).times(1).returns(mock_mail)
      Pd::Application::Facilitator1819ApplicationMailer.expects(:waitlisted).times(1).returns(mock_mail)

      application = create :pd_facilitator1819_application
      Pd::Application::Facilitator1819Application.statuses.values.each do |status|
        application.update(status: status)
        application.send_decision_notification_email
      end
    end

    test 'locking an application with fit_workshop_id automatically enrolls user' do
      application = create :pd_facilitator1819_application
      workshop = create :pd_workshop

      application.fit_workshop_id = workshop.id
      application.status = "accepted"

      assert_creates(Pd::Enrollment) do
        application.lock!
      end
      assert_equal Pd::Enrollment.last.workshop, workshop
      assert_equal Pd::Enrollment.last.id, application.auto_assigned_fit_enrollment_id
    end

    test 'updating and re-locking an application with an auto-assigned FIT enrollment will delete old enrollment' do
      application = create :pd_facilitator1819_application
      first_workshop = create :pd_workshop
      second_workshop = create :pd_workshop

      application.fit_workshop_id = first_workshop.id
      application.status = "accepted"
      application.lock!

      first_enrollment = Pd::Enrollment.find(application.auto_assigned_fit_enrollment_id)

      application.unlock!
      application.fit_workshop_id = second_workshop.id
      application.lock!

      assert first_enrollment.reload.deleted?
      assert_not_equal first_enrollment.id, application.auto_assigned_fit_enrollment_id
    end

    test 'upading the application to unaccepted will also delete the autoenrollment' do
      application = create :pd_facilitator1819_application
      workshop = create :pd_workshop

      application.fit_workshop_id = workshop.id
      application.status = "accepted"
      application.lock!
      first_enrollment = Pd::Enrollment.find(application.auto_assigned_fit_enrollment_id)

      application.unlock!
      application.status = "waitlisted"
      application.lock!

      assert first_enrollment.reload.deleted?

      application.unlock!
      application.status = "accepted"

      assert_creates(Pd::Enrollment) do
        application.lock!
      end

      assert_not_equal first_enrollment.id, application.auto_assigned_fit_enrollment_id
    end

    test 'assign_default_workshop! saves the default workshop' do
      application = create :pd_facilitator1819_application
      workshop = create :pd_workshop
      application.expects(:find_default_workshop).returns(workshop)

      application.assign_default_workshop!
      assert_equal workshop.id, application.reload.pd_workshop_id
    end

    test 'assign_default_workshop! does nothing when a workshop is already assigned' do
      workshop = create :pd_workshop
      application = create :pd_facilitator1819_application, pd_workshop_id: workshop.id
      application.expects(:find_default_workshop).never

      application.assign_default_workshop!
      assert_equal workshop.id, application.reload.pd_workshop_id
    end

    test 'assign_default_fit_workshop! saves the default fit workshop' do
      application = create :pd_facilitator1819_application
      workshop = create :pd_workshop
      application.expects(:find_default_fit_workshop).returns(workshop)

      application.assign_default_fit_workshop!
      assert_equal workshop.id, application.reload.fit_workshop_id
    end

    test 'assign_default_fit_workshop! does nothing when a fit workshop is already assigned' do
      workshop = create :pd_workshop
      application = create :pd_facilitator1819_application, fit_workshop_id: workshop.id
      application.expects(:find_default_fit_workshop).never

      application.assign_default_fit_workshop!
      assert_equal workshop.id, application.reload.fit_workshop_id
    end
  end
end
