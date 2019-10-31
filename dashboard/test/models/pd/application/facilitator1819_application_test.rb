require 'test_helper'

module Pd::Application
  class Facilitator1819ApplicationTest < ActiveSupport::TestCase
    self.use_transactional_test_case = true
    setup_all do
      @regional_partner = create :regional_partner
      @fit_workshop = create :fit_workshop
      @workshop = create :workshop
      @application = create :pd_facilitator1819_application
      @application_with_fit_workshop = create :pd_facilitator1819_application,
        pd_workshop_id: @workshop.id, fit_workshop_id: @fit_workshop.id
    end
    setup do
      @application.reload
      @application_with_fit_workshop.reload
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
      e = assert_raises ActiveRecord::RecordInvalid do
        create :pd_facilitator1819_application, user: @application.user
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

    test 'to_csv_row method' do
      @application.update!(regional_partner: @regional_partner, status: 'accepted', notes: 'notes')

      csv_row = @application.to_csv_row(nil)
      csv_answers = csv_row.split(',')
      assert_equal "#{@regional_partner.name}\n", csv_answers[-1]
      assert_equal 'notes', csv_answers[-6]
      assert_equal 'false', csv_answers[-7]
      assert_equal 'accepted', csv_answers[-8]
    end

    test 'csv_header and row return same number of columns' do
      mock_user = mock

      header = Facilitator1819Application.csv_header('csp', mock_user)
      row = @application.to_csv_row(mock_user)
      assert_equal CSV.parse(header).length, CSV.parse(row).length,
        "Expected header and row to have the same number of columns"
    end

    test 'to_cohort_csv' do
      optional_columns = {registered_workshop: true, accepted_teachercon: false}
      assert (header = Facilitator1819Application.cohort_csv_header(optional_columns))
      assert (row = @application.to_cohort_csv_row(optional_columns))
      assert_equal CSV.parse(header).length, CSV.parse(row).length,
        "Expected header and row to have the same number of columns"
    end

    test 'locking an application with fit_workshop_id does not automatically enroll user' do
      @application.fit_workshop_id = @fit_workshop.id
      @application.status = "accepted"

      refute_creates(Pd::Enrollment) do
        @application.lock!
      end
    end

    test 'fit_workshop returns the workshop associated with the assigned fit workshop id' do
      assert_equal @fit_workshop, @application_with_fit_workshop.fit_workshop
    end

    test 'fit_workshop returns nil if the assigned workshop has been deleted' do
      @fit_workshop.destroy!
      assert_nil @application_with_fit_workshop.fit_workshop
    end

    test 'registered_fit_workshop? returns true when the applicant is enrolled in the assigned fit workshop' do
      create :pd_enrollment, workshop: @fit_workshop, user: @application_with_fit_workshop.user
      assert @application_with_fit_workshop.registered_fit_workshop?
    end

    test 'registered_fit_workshop? returns false when the applicant is not enrolled in the assigned fit workshop' do
      refute @application_with_fit_workshop.registered_fit_workshop?
    end

    test 'registered_fit_workshop? returns false when no fit workshop is assigned' do
      @application_with_fit_workshop.update! fit_workshop_id: nil
      refute @application_with_fit_workshop.registered_fit_workshop?
    end

    test 'workshop cache' do
      create :pd_enrollment, workshop: @fit_workshop, user: @application_with_fit_workshop.user

      # Original query: Workshop, Session, Enrollment
      assert_queries 3 do
        assert_equal @fit_workshop, @application_with_fit_workshop.fit_workshop
      end

      # Cached
      assert_queries 0 do
        assert_equal @fit_workshop, @application_with_fit_workshop.fit_workshop
        assert @application_with_fit_workshop.registered_fit_workshop?
      end
    end

    test 'workshop cache prefetch' do
      # Workshop, Session, Enrollment
      assert_queries 3 do
        Facilitator1819Application.prefetch_associated_models([@application_with_fit_workshop])
      end

      assert_queries 0 do
        assert_equal @fit_workshop, @application_with_fit_workshop.fit_workshop

        # also prefetches assigned workshop
        assert_equal @workshop, @application_with_fit_workshop.workshop
      end
    end

    test 'fit_cohort' do
      included = [
        create(:pd_facilitator1819_application, :locked, fit_workshop_id: @fit_workshop.id, status: :accepted),
        create(:pd_facilitator1819_application, :locked, fit_workshop_id: @fit_workshop.id, status: :waitlisted)
      ]

      excluded = [
        # not locked
        create(:pd_facilitator1819_application, fit_workshop_id: @fit_workshop.id, status: :accepted),

        # not accepted or waitlisted
        @application_with_fit_workshop,

        # no workshop
        @application
      ]

      fit_cohort = Facilitator1819Application.fit_cohort

      included.each do |application|
        assert fit_cohort.include? application
      end
      excluded.each do |application|
        refute fit_cohort.include? application
      end
    end

    test 'memoized filtered_labels' do
      Facilitator1819Application::FILTERED_LABELS.clear

      filtered_labels_csd = Facilitator1819Application.filtered_labels('csd')
      assert filtered_labels_csd.key? :csd_csp_fit_availability
      refute filtered_labels_csd.key? :csf_availability
      assert_equal ['csd'], Facilitator1819Application::FILTERED_LABELS.keys

      filtered_labels_csf = Facilitator1819Application.filtered_labels('csf')
      refute filtered_labels_csf.key? :csd_csp_fit_availability
      assert filtered_labels_csf.key? :csf_availability
      assert_equal ['csd', 'csf'], Facilitator1819Application::FILTERED_LABELS.keys
    end
  end
end
