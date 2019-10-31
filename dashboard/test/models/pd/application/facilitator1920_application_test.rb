require 'test_helper'

module Pd::Application
  class Facilitator1920ApplicationTest < ActiveSupport::TestCase
    include Pd::Application::ApplicationConstants
    include Pd::Facilitator1920ApplicationConstants

    self.use_transactional_test_case = true
    setup_all do
      @regional_partner = create :regional_partner
      @fit_workshop = create :fit_workshop
      @workshop = create :workshop
      @application = create :pd_facilitator1920_application
      @application_with_fit_workshop = create :pd_facilitator1920_application,
        pd_workshop_id: @workshop.id, fit_workshop_id: @fit_workshop.id
    end
    setup do
      @application.reload
      @application_with_fit_workshop.reload
    end

    test 'course is filled in from the form program before validation' do
      [:csf, :csd, :csp].each do |program|
        application_hash = build :pd_facilitator1920_application_hash_common, program
        application = build :pd_facilitator1920_application, form_data_hash: application_hash
        assert application.valid?, "Errors in #{program} application: #{application.errors.full_messages}"
        assert_equal program.to_s, application.course
      end
    end

    test 'match regional partner' do
      # match
      RegionalPartner.expects(:find_by_region).with('11111', 'WA').returns(@regional_partner)
      application_hash = build :pd_facilitator1920_application_hash, zip_code: '11111', state: 'Washington'
      application_with_match = create :pd_facilitator1920_application, form_data_hash: application_hash
      assert_equal @regional_partner, application_with_match.regional_partner

      # No match
      RegionalPartner.expects(:find_by_region).with('22222', 'WA').returns(nil)
      application_hash = build :pd_facilitator1920_application_hash, zip_code: '22222', state: 'Washington'
      application_without_match = create :pd_facilitator1920_application, form_data_hash: application_hash
      assert_nil application_without_match.regional_partner
    end

    test 'matched regional partner is not overridden by later form data' do
      RegionalPartner.expects(:find_by_region).never
      application = create :pd_facilitator1920_application, regional_partner: @regional_partner

      application.form_data = build(:pd_facilitator1920_application_hash)
      assert_equal @regional_partner, application.regional_partner
    end

    test 'open until May 1, 2019' do
      Timecop.freeze Time.zone.local(2019, 4, 30, 23, 59) do
        assert Facilitator1920Application.open?
      end
      Timecop.freeze Time.zone.local(2019, 5, 1) do
        refute Facilitator1920Application.open?
      end
    end

    test 'only one application allowed per user' do
      e = assert_raises ActiveRecord::RecordInvalid do
        create :pd_facilitator1920_application, user: @application.user
      end
      assert_equal 'Validation failed: User has already been taken', e.message
    end

    test 'state_code and state_name' do
      application_hash = build :pd_facilitator1920_application_hash, state: 'Washington'
      application = build :pd_facilitator1920_application, form_data_hash: application_hash
      assert_equal 'Washington', application.state_name
      assert_equal 'WA', application.state_code
    end

    test 'answer_with_additional_text with defaults' do
      application_hash = build :pd_facilitator1920_application_hash
      application_hash[:institution_type] = ['School district', 'Other:']
      application_hash[:institution_type_other] = 'School of Witchcraft and Wizardry'

      assert_equal(
        [
          'School district',
          'Other: School of Witchcraft and Wizardry'
        ],
        Facilitator1920Application.answer_with_additional_text(application_hash, :institution_type)
      )
    end

    test 'answer_with_additional_text with custom field' do
      OPTION = 'A Code.org Regional Partner (please share name):'
      application_hash = build :pd_facilitator1920_application_hash
      application_hash[:how_heard] = [OPTION]
      application_hash[:how_heard_regional_partner] = 'Hogwarts Coding Wizards'

      assert_equal(
        [
          "#{OPTION} Hogwarts Coding Wizards"
        ],
        Facilitator1920Application.answer_with_additional_text(application_hash, :how_heard, OPTION, :how_heard_regional_partner)
      )
    end

    test 'csf applications have csd-csp answers filtered out' do
      application_hash = build :pd_facilitator1920_application_hash,
        :with_csf_specific_fields, :with_csd_csp_specific_fields,
        program: Facilitator1920Application::PROGRAMS[:csf]
      application = build :pd_facilitator1920_application, form_data_hash: application_hash, course: :csf

      answers = application.full_answers
      [
        :csf_good_standing_requirement,
        :csf_summit_requirement,
        :csf_workshop_requirement,
        :csf_community_requirement
      ].each {|x| assert answers.key? x}
      [
        :csd_csp_good_standing_requirement,
        :csd_csp_lead_summer_workshop_requirement,
        :csd_csp_workshop_requirement,
        :csd_csp_lead_summer_workshop_requirement,
        :csd_csp_deeper_learning_requirement
      ].each {|x| refute answers.key? x}
    end

    test 'csd and csp applications have csf answers filtered out' do
      [:csd, :csp].each do |course|
        application_hash = build :pd_facilitator1920_application_hash,
          :with_csf_specific_fields, :with_csd_csp_specific_fields,
          program: Facilitator1920Application::PROGRAMS[course]
        application = build :pd_facilitator1920_application, form_data_hash: application_hash, course: course

        answers = application.full_answers

        [
          :csf_good_standing_requirement,
          :csf_summit_requirement,
          :csf_workshop_requirement,
          :csf_community_requirement
        ].each {|x| refute answers.key? x}
        [
          :csd_csp_good_standing_requirement,
          :csd_csp_lead_summer_workshop_requirement,
          :csd_csp_workshop_requirement,
          :csd_csp_lead_summer_workshop_requirement,
          :csd_csp_deeper_learning_requirement
        ].each {|x| assert(answers.key?(x), "Expected #{x} to be in the hash")}
      end
    end

    test 'columns_to_remove' do
      ['csf', 'csd', 'csp'].each do |course|
        columns = Facilitator1920Application.columns_to_remove(course)
        columns.each do |k|
          if course == 'csf'
            refute k.to_s.starts_with?('csf')
          elsif course == 'csd'
            refute k.to_s.starts_with?("#{course}_training")
          else
            refute k.to_s.starts_with?('csd_csp', "#{course}_training")
          end
        end
      end
    end

    test 'csv_filtered_labels' do
      csv_filtered_labels_csf = Facilitator1920Application.csv_filtered_labels('csf')
      assert csv_filtered_labels_csf.include? :csf_good_standing_requirement
      refute csv_filtered_labels_csf.include? :csd_csp_good_standing_requirement

      csv_filtered_labels_csd = Facilitator1920Application.csv_filtered_labels('csd')
      assert csv_filtered_labels_csd.include? :csd_csp_good_standing_requirement
      refute csv_filtered_labels_csd.include? :csp_training
      refute csv_filtered_labels_csd.include? :csf_good_standing_requirement

      csv_filtered_labels_csp = Facilitator1920Application.csv_filtered_labels('csp')
      assert csv_filtered_labels_csp.include? :csd_csp_good_standing_requirement
      refute csv_filtered_labels_csp.include? :csd_training
      refute csv_filtered_labels_csp.include? :csf_good_standing_requirement
    end

    test 'to_csv_row method' do
      @application.update!(regional_partner: @regional_partner, status: 'accepted', notes: 'notes')

      csv_row = @application.to_csv_row(@application.course)
      csv_answers = csv_row.split(',')
      assert_equal @regional_partner.name, csv_answers[36]
      assert_equal 'notes', csv_answers[15]
      assert_equal 'accepted', csv_answers[2]
      assert csv_answers[37].include?("/pd/application_dashboard/#{@application.course}_facilitators/#{@application.id}")
    end

    test 'csv_header and row return same number of columns' do
      course = 'csp'
      header = Facilitator1920Application.csv_header(course)
      row = @application.to_csv_row(course)
      assert_equal CSV.parse(header).length, CSV.parse(row).length,
        "Expected header and row to have the same number of columns"
    end

    test 'locking an accepted application with fit_workshop_id does not automatically enroll user' do
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
        Facilitator1920Application.prefetch_associated_models([@application_with_fit_workshop])
      end

      assert_queries 0 do
        assert_equal @fit_workshop, @application_with_fit_workshop.fit_workshop

        # also prefetches assigned workshop
        assert_equal @workshop, @application_with_fit_workshop.workshop
      end
    end

    test 'fit_cohort' do
      fit_workshop = create :fit_workshop
      expected_application_ids = []

      # create some applications to be included in fit_cohort
      expected_application_ids << (create :pd_facilitator1920_application, :locked, fit_workshop_id: fit_workshop.id, status: :accepted).id
      expected_application_ids << (create :pd_facilitator1920_application, :locked, fit_workshop_id: fit_workshop.id, status: :withdrawn).id
      # no workshop
      expected_application_ids << (create :pd_facilitator1920_application, :locked, status: :accepted).id

      #create some applications that won't be included in fit_cohort
      # not locked
      create :pd_facilitator1920_application, fit_workshop_id: fit_workshop.id, status: :accepted

      # not accepted or withdrawn
      create :pd_facilitator1920_application, fit_workshop_id: fit_workshop.id, status: :waitlisted

      actual_application_ids = Facilitator1920Application.fit_cohort.map(&:id)

      assert_equal expected_application_ids, actual_application_ids
    end

    test 'memoized filtered_labels' do
      Facilitator1920Application::FILTERED_LABELS.clear

      filtered_labels_csd = Facilitator1920Application.filtered_labels('csd')
      assert filtered_labels_csd.key? :csd_csp_lead_summer_workshop_requirement
      refute filtered_labels_csd.key? :csf_good_standing_requirement
      assert_equal ['csd'], Facilitator1920Application::FILTERED_LABELS.keys

      filtered_labels_csf = Facilitator1920Application.filtered_labels('csf')
      refute filtered_labels_csf.key? :csd_csp_lead_summer_workshop_requirement
      assert filtered_labels_csf.key? :csf_good_standing_requirement
      assert_equal ['csd', 'csf'], Facilitator1920Application::FILTERED_LABELS.keys
    end

    test 'locking an application with an auto-email status queues up an email' do
      assert_empty @application.emails
      Facilitator1920Application::AUTO_EMAIL_STATUSES.each do |status|
        @application.unlock!
        @application.update!(status: status)
        @application.expects(:queue_email).with(status)
        @application.lock!
      end
    end

    test 'locking an application with accepted status does not queue up an email' do
      assert_empty @application.emails
      @application.expects(:queue_email).never
      @application.update!(status: 'accepted')
      @application.lock!
    end

    test 'setting status does not queue up a status email' do
      assert_empty @application.emails
      @application.expects(:queue_email).never

      Facilitator1920Application.statuses.each do |status|
        @application.update!(status: status)
      end
    end

    test 'locking an application with an auto-email status deletes unsent emails for the application' do
      Facilitator1920Application::AUTO_EMAIL_STATUSES.each do |status|
        @application.unlock!
        unrelated_email = create :pd_application_email
        associated_sent_email = create :pd_application_email, application: @application, sent_at: Time.now
        associated_unsent_email = create :pd_application_email, application: @application

        @application.update!(status: status)
        @application.lock!
        assert Email.exists?(unrelated_email.id)
        assert Email.exists?(associated_sent_email.id)
        refute Email.exists?(associated_unsent_email.id)
      end
    end

    test 'should_send_decision_email?' do
      application = build :pd_facilitator1920_application, status: :pending

      # no auto-email status: no email
      refute application.should_send_decision_email?

      # auto-email status with no partner: yes email
      application.status = :declined
      assert application.should_send_decision_email?
    end

    test 'queue_email queues up email' do
      application = build :pd_facilitator1920_application, status: 'declined'

      assert_creates Email do
        application.queue_email :declined
      end
    end

    test 'meets_criteria says yes if everything is set to YES, no if anything is NO, and INCOMPLETE if anything is unset' do
      %w(csf csd csp).each do |course|
        application = create :pd_facilitator1920_application, course: course
        score_hash = SCOREABLE_QUESTIONS["criteria_score_questions_#{course}".to_sym].map {|key| [key, YES]}.to_h

        application.update(
          response_scores: {meets_minimum_criteria_scores: score_hash}.to_json
        )

        assert_equal YES, application.meets_criteria

        application.update(
          response_scores: {meets_minimum_criteria_scores: score_hash.merge({teaching_experience: NO})}.to_json
        )

        assert_equal NO, application.meets_criteria

        application.update(
          response_scores: {meets_minimum_criteria_scores: score_hash.merge({teaching_experience: nil})}.to_json
        )

        assert_equal REVIEWING_INCOMPLETE, application.meets_criteria
      end
    end

    test 'scoring works as expected' do
      @application.update(
        response_scores: @application.default_response_score_hash.deep_merge(
          {
            bonus_points_scores: {
              currently_involved_in_cs_education: 5,
              grades_taught: 5,
              experience_teaching_this_course: 5,
              why_should_all_have_access: 5,
              skills_areas_to_improve: 5,
              inquiry_based_learning: 5,
              why_interested: 5,
              question_1: 5,
              question_2: 5,
              question_3: 5,
              question_4: 5,
              question_5: 5
            }
          }
        ).to_json
      )

      assert_equal(
        {
          total_score: "60 / 60",
          application_score: "35 / 35",
          interview_score: "25 / 25",
          teaching_experience_score: "10 / 10",
          leadership_score: "5 / 5",
          champion_for_cs_score: "5 / 5",
          equity_score: "15 / 15",
          growth_minded_score: "15 / 15",
          content_knowledge_score: "5 / 5",
          program_commitment_score: "5 / 5"
        }, @application.all_scores
      )
    end

    test 'clear out extraneous csd and csp answers for a csf application' do
      application_hash = build :pd_facilitator1920_application_hash_common, :csf, :with_csd_csp_specific_fields

      application = create :pd_facilitator1920_application, course: 'csf', form_data_hash: application_hash

      application_hash = application.sanitize_form_data_hash

      assert Pd::Facilitator1920ApplicationConstants::CSF_SPECIFIC_KEYS.any? {|x| application_hash.key? x}
      assert Pd::Facilitator1920ApplicationConstants::CSD_SPECIFIC_KEYS.none? {|x| application_hash.key? x}
      refute application_hash.key? :csp_training_requirement
    end

    test 'clear out extraneous csf answers for a csd application' do
      application_hash = build :pd_facilitator1920_application_hash_common, :csd, :with_csf_specific_fields

      application = create :pd_facilitator1920_application, course: 'csd', form_data_hash: application_hash

      application_hash = application.sanitize_form_data_hash

      assert Pd::Facilitator1920ApplicationConstants::CSF_SPECIFIC_KEYS.none? {|x| application_hash.key? x}
      assert Pd::Facilitator1920ApplicationConstants::CSD_SPECIFIC_KEYS.any? {|x| application_hash.key? x}
      refute application_hash.key? :csp_training_requirement
    end

    test 'clear out extraneous csf answers for a csp application' do
      application_hash = build :pd_facilitator1920_application_hash_common, :csp, :with_csf_specific_fields

      application = create :pd_facilitator1920_application, course: 'csp', form_data_hash: application_hash

      application_hash = application.sanitize_form_data_hash

      assert Pd::Facilitator1920ApplicationConstants::CSF_SPECIFIC_KEYS.none? {|x| application_hash.key? x}
      assert Pd::Facilitator1920ApplicationConstants::CSD_SPECIFIC_KEYS.any? {|x| application_hash.key? x}
      assert application_hash.key? :csp_training_requirement
    end

    test 'associated models cache prefetch' do
      workshop = create :workshop
      fit_workshop = create :fit_workshop
      application = create :pd_facilitator1920_application, pd_workshop_id: workshop.id, fit_workshop_id: fit_workshop.id
      # Workshops, Sessions, Enrollments
      assert_queries 3 do
        Facilitator1920Application.prefetch_associated_models([application])
      end

      assert_queries 0 do
        assert_equal workshop, application.workshop
      end
    end

    test 'enroll_user creates enrollment' do
      fit_workshop = create :fit_workshop
      application = create :pd_facilitator1920_application, fit_workshop_id: fit_workshop.id

      assert_nil application.auto_assigned_fit_enrollment_id
      assert_creates(Pd::Enrollment) do
        application.enroll_user
      end

      assert application.auto_assigned_fit_enrollment_id
    end

    test 'enroll_user for a different workshop deletes previous enrollment' do
      original_fit_workshop = create :fit_workshop
      new_fit_workshop = create :fit_workshop
      application = create :pd_facilitator1920_application, fit_workshop_id: original_fit_workshop.id

      application.enroll_user
      original_enrollment = Pd::Enrollment.find(application.auto_assigned_fit_enrollment_id)
      assert_equal original_fit_workshop.id, original_enrollment.pd_workshop_id

      application.fit_workshop_id = new_fit_workshop.id

      # actually creates a new enrollment and destroys the old one,
      # and this method checks that the total enrollment count does not change
      refute_creates_or_destroys(Pd::Enrollment) do
        application.enroll_user
      end
      new_enrollment = Pd::Enrollment.find(application.auto_assigned_fit_enrollment_id)
      assert_equal new_fit_workshop.id, new_enrollment.pd_workshop_id
    end

    private

    def assert_status_log(expected, application)
      assert_equal JSON.parse(expected.to_json), application.status_log
    end
  end
end
