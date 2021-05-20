require 'test_helper'

module Pd::Application
  class TeacherApplicationTest < ActiveSupport::TestCase
    include Pd::TeacherApplicationConstants
    include ApplicationConstants
    include RegionalPartnerTeacherconMapping

    freeze_time

    test 'application guid is generated on create' do
      teacher_application = build :pd_teacher_application
      assert_nil teacher_application.application_guid

      teacher_application.save!
      assert_not_nil teacher_application.application_guid
    end

    test 'existing guid is preserved' do
      guid = SecureRandom.uuid
      teacher_application = create :pd_teacher_application, application_guid: guid
      assert_equal guid, teacher_application.application_guid

      # save again
      teacher_application.save!
      assert_equal guid, teacher_application.application_guid
    end

    test 'principal_approval_url' do
      teacher_application = build :pd_teacher_application
      assert_nil teacher_application.principal_approval_url

      # save to generate guid and therefore principal approval url
      teacher_application.save!
      assert teacher_application.principal_approval_url
    end

    test 'principal_greeting' do
      hash_with_principal_title = build :pd_teacher_application_hash
      hash_without_principal_title = build :pd_teacher_application_hash, principal_title: nil

      application_with_principal_title = build :pd_teacher_application, form_data_hash: hash_with_principal_title
      application_without_principal_title = build :pd_teacher_application, form_data_hash: hash_without_principal_title

      assert_equal 'Dr. Dumbledore', application_with_principal_title.principal_greeting
      assert_equal 'Albus Dumbledore', application_without_principal_title.principal_greeting
    end

    test 'meets criteria says an application meets critera when all YES_NO fields are marked yes' do
      teacher_application = build :pd_teacher_application, course: 'csd',
                                  response_scores: {
                                    meets_minimum_criteria_scores: SCOREABLE_QUESTIONS[:criteria_score_questions_csd].map {|x| [x, 'Yes']}.to_h
                                  }.to_json
      assert_equal 'Yes', teacher_application.meets_criteria

      teacher_application = build :pd_teacher_application, course: 'csp',
                                  response_scores: {
                                    meets_minimum_criteria_scores: SCOREABLE_QUESTIONS[:criteria_score_questions_csp].map {|x| [x, 'Yes']}.to_h
                                  }.to_json
      assert_equal 'Yes', teacher_application.meets_criteria
    end

    test 'meets criteria says an application does not meet criteria when any YES_NO fields are marked NO' do
      teacher_application = build :pd_teacher_application, response_scores: {
        meets_minimum_criteria_scores: {
          committed: 'No'
        }
      }.to_json
      assert_equal 'No', teacher_application.meets_criteria
    end

    test 'meets criteria returns incomplete when an application does not have YES on all YES_NO fields but has no NOs' do
      teacher_application = build :pd_teacher_application, response_scores: {
        meets_minimum_criteria_scores: {
          committed: 'Yes'
        }
      }.to_json
      assert_equal Pd::Application::Teacher2122Application::REVIEWING_INCOMPLETE, teacher_application.meets_criteria
    end

    test 'accepted_at updates times' do
      today = Date.today.to_time
      tomorrow = Date.tomorrow.to_time
      application = create :pd_teacher_application
      assert_nil application.accepted_at

      Timecop.freeze(today) do
        application.update!(status: 'accepted_not_notified')
        assert_equal today, application.accepted_at.to_time

        application.update!(status: 'declined')
        assert_nil application.accepted_at
      end

      Timecop.freeze(tomorrow) do
        application.update!(status: 'accepted_not_notified')
        assert_equal tomorrow, application.accepted_at.to_time
      end
    end

    test 'school_info_attr for specific school' do
      school = create :school
      form_data_hash = build :pd_teacher_application_hash, school: school
      application = create :pd_teacher_application, form_data_hash: form_data_hash
      assert_equal({school_id: school.id}, application.school_info_attr)
    end

    test 'school_info_attr for custom school' do
      application = create :pd_teacher_application, form_data_hash: (
      build :pd_teacher_application_hash,
        :with_custom_school,
        school_name: 'Code.org',
        school_address: '1501 4th Ave',
        school_city: 'Seattle',
        school_state: 'Washington',
        school_zip_code: '98101',
        school_type: 'Public school'
      )
      assert_equal(
        {
          country: 'US',
          school_type: 'public',
          state: 'Washington',
          zip: '98101',
          school_name: 'Code.org',
          full_address: '1501 4th Ave',
          validation_type: SchoolInfo::VALIDATION_COMPLETE
        },
        application.school_info_attr
      )
    end

    test 'update_user_school_info with specific school overwrites user school info' do
      user = create :teacher, school_info: create(:school_info)
      application_school_info = create :school_info
      application = create :pd_teacher_application, user: user, form_data_hash: (
      build :pd_teacher_application_hash, school: application_school_info.school
      )

      application.update_user_school_info!
      assert_equal application_school_info, user.school_info
    end

    test 'update_user_school_info with custom school does nothing when the user already a specific school' do
      original_school_info = create :school_info
      user = create :teacher, school_info: original_school_info
      application = create :pd_teacher_application, user: user, form_data_hash: (
      build :pd_teacher_application_hash, :with_custom_school
      )

      application.update_user_school_info!
      assert_equal original_school_info, user.school_info
    end

    test 'update_user_school_info with custom school updates user info when user does not have a specific school' do
      original_school_info = create :school_info_us_other
      user = create :teacher, school_info: original_school_info
      application = create :pd_teacher_application, user: user, form_data_hash: (
      build :pd_teacher_application_hash, :with_custom_school
      )

      application.update_user_school_info!
      refute_equal original_school_info.id, user.school_info_id
      assert_not_nil user.school_info_id
    end

    test 'get_first_selected_workshop single local workshop' do
      Pd::Workshop.any_instance.stubs(:process_location)

      workshop = create :workshop, location_address: 'Address', sessions_from: Date.today, num_sessions: 1
      application = create :pd_teacher_application, form_data_hash: (
      build :pd_teacher_application_hash,
        regional_partner_workshop_ids: [workshop.id],
        able_to_attend_multiple: ["#{Date.today.strftime '%B %-d, %Y'} in Address"]
      )

      assert_equal workshop, application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop multiple local workshops' do
      workshops = (1..3).map {|i| create :workshop, num_sessions: 2, sessions_from: Date.today + i, location_address: %w(tba TBA tba)[i - 1]}

      application = create :pd_teacher_application, form_data_hash: (
      build(:pd_teacher_application_hash, :with_multiple_workshops,
        regional_partner_workshop_ids: workshops.map(&:id),
        able_to_attend_multiple: (
        # Select all but the first. Expect the first selected to be returned below
        workshops[1..-1].map do |workshop|
          "#{workshop.friendly_date_range} in #{workshop.location_address} hosted by Code.org"
        end
        )
      )
      )
      assert_equal workshops[1], application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop multiple local workshops no selection returns first' do
      workshops = (1..2).map {|i| create :workshop, num_sessions: 2, sessions_from: Date.today + i}

      application = create :pd_teacher_application, form_data_hash: (
      build(:pd_teacher_application_hash, :with_multiple_workshops,
        regional_partner_workshop_ids: workshops.map(&:id),
        able_to_attend_multiple: ['Not a workshop', 'Not a workshop 2']
      )
      )
      assert_equal workshops.first, application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop with no workshops returns nil' do
      application = create :pd_teacher_application, form_data_hash: (
      build(:pd_teacher_application_hash, :with_multiple_workshops,
        regional_partner_workshop_ids: []
      )
      )
      assert_nil application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop ignores single deleted workshops' do
      Pd::Workshop.any_instance.stubs(:process_location)

      workshop = create :summer_workshop, location_address: 'Buffalo, NY', sessions_from: Date.new(2020, 1, 1)
      application = create :pd_teacher_application, form_data_hash: (
      build(:pd_teacher_application_hash,
        regional_partner_workshop_ids: [workshop.id],
        able_to_attend_multiple: ['January 1-5, 2020 in Buffalo, NY']
      )
      )

      workshop.destroy
      assert_nil application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop ignores deleted workshop from multiple list' do
      workshops = (1..2).map {|i| create :workshop, num_sessions: 2, sessions_from: Date.today + i}

      application = create :pd_teacher_application, form_data_hash: (
      build(:pd_teacher_application_hash, :with_multiple_workshops,
        regional_partner_workshop_ids: workshops.map(&:id),
        able_to_attend: [workshops.first.id, workshops.second.id]
      )
      )

      workshops[0].destroy
      assert_equal workshops[1], application.get_first_selected_workshop

      workshops[1].destroy
      assert_nil application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop picks correct workshop even when multiple are on the same day' do
      workshop_1 = create :workshop, num_sessions: 2, sessions_from: Date.today + 2
      workshop_2 = create :workshop, num_sessions: 2, sessions_from: Date.today + 2
      workshop_1.update_column(:location_address, 'Location 1')
      workshop_2.update_column(:location_address, 'Location 2')

      application = create :pd_teacher_application, form_data_hash: (
      build(:pd_teacher_application_hash, :with_multiple_workshops,
        regional_partner_workshop_ids: [workshop_1.id, workshop_2.id],
        able_to_attend_multiple: ["#{workshop_2.friendly_date_range} in Location 2 hosted by Code.org"]
      )
      )

      assert_equal workshop_2, application.get_first_selected_workshop

      application_2 = create :pd_teacher_application, form_data_hash: (
      build(:pd_teacher_application_hash, :with_multiple_workshops,
        regional_partner_workshop_ids: [workshop_1.id, workshop_2.id],
        able_to_attend_multiple: ["#{workshop_2.friendly_date_range} in Location 1 hosted by Code.org"]
      )
      )

      assert_equal workshop_1, application_2.get_first_selected_workshop
    end

    test 'can_see_locked_status? is always false' do
      teacher = create :teacher
      g1_program_manager = create :program_manager, regional_partner: create(:regional_partner, group: 1)
      g3_program_manager = create :program_manager, regional_partner: create(:regional_partner, group: 3)
      workshop_admin = create :workshop_admin

      [teacher, g1_program_manager, g3_program_manager, workshop_admin].each do |user|
        refute Teacher2122Application.can_see_locked_status?(user)
      end
    end

    test 'columns_to_remove' do
      ['csp', 'csd'].each do |course|
        columns = Teacher2122Application.columns_to_remove(course)
        columns.keys.each do |k|
          columns[k].each {|c| refute c.to_s.include?(course)}
        end
      end
    end

    test 'csv_filtered_labels' do
      csv_filtered_labels_csd = Teacher2122Application.csv_filtered_labels('csd')
      assert csv_filtered_labels_csd[:teacher].include? :csd_which_grades
      refute csv_filtered_labels_csd[:teacher].include? :csp_which_grades

      csv_filtered_labels_csp = Teacher2122Application.csv_filtered_labels('csp')
      refute csv_filtered_labels_csp[:teacher].include? :csd_which_grades
      assert csv_filtered_labels_csp[:teacher].include? :csp_which_grades
    end

    test 'csv_header' do
      csv_header_csd = CSV.parse(Teacher2122Application.csv_header('csd'))[0]
      assert csv_header_csd.include? "To which grades does your school plan to offer CS Discoveries in the 2021-2022 school year?"
      refute csv_header_csd.include? "To which grades does your school plan to offer CS Principles in the 2021-2022 school year?"
      assert_equal 93, csv_header_csd.length

      csv_header_csp = CSV.parse(Teacher2122Application.csv_header('csp'))[0]
      refute csv_header_csp.include? "To which grades does your school plan to offer CS Discoveries in the 2021-2022 school year?"
      assert csv_header_csp.include? "To which grades does your school plan to offer CS Principles in the 2021-2022 school year?"
      assert_equal 95, csv_header_csp.length
    end

    test 'school cache' do
      school = create :school
      form_data_hash = build :pd_teacher_application_hash, school: school
      application = create :pd_teacher_application, form_data_hash: form_data_hash

      # Original query: School, SchoolDistrict
      assert_queries 2 do
        assert_equal school.name.titleize, application.school_name
        assert_equal school.school_district.name.titleize, application.district_name
      end

      # Cached
      assert_queries 0 do
        assert_equal school.name.titleize, application.school_name
        assert_equal school.school_district.name.titleize, application.district_name
      end
    end

    test 'cache prefetch' do
      school = create :school
      workshop = create :workshop
      form_data_hash = build :pd_teacher_application_hash, school: school
      application = create :pd_teacher_application, form_data_hash: form_data_hash, pd_workshop_id: workshop.id

      # Workshop, Session, Enrollment, School, SchoolDistrict
      assert_queries 5 do
        Teacher2122Application.prefetch_associated_models([application])
      end

      assert_queries 0 do
        assert_equal school.name.titleize, application.school_name
        assert_equal school.school_district.name.titleize, application.district_name
        assert_equal workshop, application.workshop
      end
    end

    test 'memoized filtered_labels' do
      Teacher2122Application::FILTERED_LABELS.clear

      filtered_labels_csd = Teacher2122Application.filtered_labels('csd')
      assert filtered_labels_csd.include? :csd_which_grades
      refute filtered_labels_csd.include? :csp_which_grades
      assert_equal ['csd'], Teacher2122Application::FILTERED_LABELS.keys

      filtered_labels_csd = Teacher2122Application.filtered_labels('csp')
      refute filtered_labels_csd.include? :csd_which_grades
      assert filtered_labels_csd.include? :csp_which_grades
      assert_equal ['csd', 'csp'], Teacher2122Application::FILTERED_LABELS.keys
    end

    test 'status changes are logged' do
      application = build :pd_teacher_application
      assert_nil application.status_log

      application.save!
      assert application.status_log.is_a? Array
      assert_status_log [{status: 'unreviewed', at: Time.zone.now}], application

      # update unrelated field
      Timecop.freeze 1
      application.update!(notes: 'some notes')
      assert_equal Time.zone.now, application.updated_at
      assert_equal 1, application.status_log.count

      Timecop.freeze 1
      application.update!(status: 'pending')
      assert_status_log(
        [
          {status: 'unreviewed', at: Time.zone.now - 2.seconds},
          {status: 'pending', at: Time.zone.now}
        ],
        application
      )
    end

    test 'setting an auto-email status queues up an email' do
      application = create :pd_teacher_application
      assert_empty application.emails

      application.expects(:queue_email).with('accepted_no_cost_registration')
      application.update!(status: 'accepted_no_cost_registration')
    end

    test 'setting an non auto-email status does not queue up a status email' do
      application = create :pd_teacher_application
      assert_empty application.emails

      application.expects(:queue_email).never
      application.update!(status: 'pending')
    end

    test 'setting an auto-email status deletes unsent emails for the application' do
      unrelated_email = create :pd_application_email
      application = create :pd_teacher_application
      associated_sent_email = create :pd_application_email, application: application, sent_at: Time.now
      associated_unsent_email = create :pd_application_email, application: application

      application.update!(status: 'waitlisted')
      assert Email.exists?(unrelated_email.id)
      assert Email.exists?(associated_sent_email.id)
      refute Email.exists?(associated_unsent_email.id)
    end

    test 'test non course dynamically required fields' do
      application_hash = build :pd_teacher_application_hash,
        regional_partner_id: create(:regional_partner).id,
        completing_on_behalf_of_someone_else: YES,
        pay_fee: TEXT_FIELDS[:no_pay_fee],
        regional_partner_workshop_ids: [1, 2, 3],
        able_to_attend_multiple: [TEXT_FIELDS[:unable_to_attend]]

      application = build :pd_teacher_application, form_data_hash: application_hash
      assert_nil application.formatted_partner_contact_email

      refute application.valid?
      assert_equal %w(completingOnBehalfOfName scholarshipReasons), application.errors.messages[:form_data]
    end

    test 'test csd dynamically required fields' do
      application_hash = build :pd_teacher_application_hash_common,
        :csd,
        csd_which_grades: nil

      application = build :pd_teacher_application, form_data_hash: application_hash
      refute application.valid?
      assert_equal ['csdWhichGrades'], application.errors.messages[:form_data]
    end

    test 'test csp dynamically required fields' do
      application_hash = build :pd_teacher_application_hash_common,
        :csp,
        csp_which_grades: nil,
        csp_how_offer: nil

      application = build :pd_teacher_application, form_data_hash: application_hash
      refute application.valid?
      assert_equal %w(cspWhichGrades cspHowOffer), application.errors.messages[:form_data]
    end

    test 'should_send_decision_email?' do
      application = build :pd_teacher_application, status: :pending

      # no auto-email status: no email
      refute application.should_send_decision_email?

      # auto-email status with no partner: yes email
      application.status = :accepted_no_cost_registration
      assert application.should_send_decision_email?

      # auto-email status, partner with sent_by_system: yes email
      application.regional_partner = build(:regional_partner, applications_decision_emails: RegionalPartner::SENT_BY_SYSTEM)
      assert application.should_send_decision_email?

      # auto-email status, partner with sent_by_partner: no email
      application.regional_partner.applications_decision_emails = RegionalPartner::SENT_BY_PARTNER
      refute application.should_send_decision_email?
    end

    test 'autoscore with everything getting positive response for csd' do
      options = Pd::Application::Teacher2122Application.options
      principal_options = Pd::Application::PrincipalApproval2122Application.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplicationBase::PROGRAMS[:csd],
        csd_which_grades: ['6'],
        csd_which_units: ['Unit 1: Problem Solving'],
        previous_yearlong_cdo_pd: ['CS Principles'],
        plan_to_teach: options[:plan_to_teach].first,
        replace_existing: options[:replace_existing].second,
        committed: options[:committed].first,
        race: options[:race].first(2),
        principal_approval: principal_options[:do_you_approve].first,
        principal_schedule_confirmed: principal_options[:committed_to_master_schedule].first,
        principal_diversity_recruitment: principal_options[:committed_to_diversity].first,
        principal_free_lunch_percent: 50,
        principal_underrepresented_minority_percent: 50,
        principal_wont_replace_existing_course: principal_options[:replace_course].second

      application = create :pd_teacher_application, regional_partner: (create :regional_partner), form_data_hash: application_hash
      application.auto_score!

      assert_equal(
        {
          meets_minimum_criteria_scores: {
            csd_which_grades: YES,
            plan_to_teach: YES,
            committed: YES,
            previous_yearlong_cdo_pd: YES,
            replace_existing: YES,
            principal_approval: YES,
            principal_schedule_confirmed: YES,
          },
          meets_scholarship_criteria_scores: {
            free_lunch_percent: YES,
            underrepresented_minority_percent: YES,
          },
        }.deep_stringify_keys,
        JSON.parse(application.response_scores)
      )
    end

    test 'autoscore with everything getting a positive response for csp' do
      options = Pd::Application::Teacher2122Application.options
      principal_options = Pd::Application::PrincipalApproval2122Application.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplicationBase::PROGRAMS[:csp],
        csp_which_grades: ['12'],
        previous_yearlong_cdo_pd: ['CS Discoveries'],
        csp_how_offer: options[:csp_how_offer].last,
        plan_to_teach: options[:plan_to_teach].first,
        replace_existing: options[:replace_existing].second,
        committed: options[:committed].first,
        race: options[:race].first(2),
        principal_approval: principal_options[:do_you_approve].first,
        principal_schedule_confirmed: principal_options[:committed_to_master_schedule].first,
        principal_diversity_recruitment: principal_options[:committed_to_diversity].first,
        principal_free_lunch_percent: 50,
        principal_underrepresented_minority_percent: 50,
        principal_wont_replace_existing_course: principal_options[:replace_course].second

      application = create :pd_teacher_application, regional_partner: (create :regional_partner), form_data_hash: application_hash
      application.auto_score!

      assert_equal(
        {
          meets_minimum_criteria_scores: {
            csp_which_grades: YES,
            plan_to_teach: YES,
            committed: YES,
            previous_yearlong_cdo_pd: YES,
            replace_existing: YES,
            principal_approval: YES,
            principal_schedule_confirmed: YES,
          },
          meets_scholarship_criteria_scores: {
            free_lunch_percent: YES,
            underrepresented_minority_percent: YES,
          },
        }.deep_stringify_keys,
        JSON.parse(application.response_scores)
      )
    end

    test 'autoscore works before principal approval' do
      options = Pd::Application::Teacher2122Application.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplicationBase::PROGRAMS[:csp],
        csp_which_grades: ['12'],
        previous_yearlong_cdo_pd: ['CS Discoveries'],
        csp_how_offer: options[:csp_how_offer].last,
        plan_to_teach: options[:plan_to_teach].first,
        replace_existing: options[:replace_existing].second,
        committed: options[:committed].first,
        race: [options[:race].second]

      application = create :pd_teacher_application, regional_partner: (create :regional_partner), form_data_hash: application_hash
      application.auto_score!

      assert_equal(
        {
          meets_minimum_criteria_scores: {
            csp_which_grades: YES,
            plan_to_teach: YES,
            committed: YES,
            previous_yearlong_cdo_pd: YES,
            replace_existing: YES,
          },
          meets_scholarship_criteria_scores: {},
        }.deep_stringify_keys,
        JSON.parse(application.response_scores)
      )
    end

    test 'autoscore with everything getting negative response for csd' do
      options = Pd::Application::Teacher2122Application.options
      principal_options = Pd::Application::PrincipalApproval2122Application.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplicationBase::PROGRAMS[:csd],
        csd_which_grades: %w(11 12),
        csd_which_units: ['Unit 1: Problem Solving'],
        previous_yearlong_cdo_pd: ['CS Discoveries'],
        plan_to_teach: options[:plan_to_teach].last,
        replace_existing: options[:replace_existing].first,
        committed: options[:committed].last,
        race: [options[:race].first],
        principal_approval: principal_options[:do_you_approve].last,
        principal_schedule_confirmed: principal_options[:committed_to_master_schedule].third,
        principal_diversity_recruitment: principal_options[:committed_to_diversity].last,
        principal_free_lunch_percent: 49,
        principal_underrepresented_minority_percent: 49,
        principal_wont_replace_existing_course: principal_options[:replace_course].first

      application = create :pd_teacher_application, regional_partner: nil, form_data_hash: application_hash
      application.auto_score!

      assert_equal(
        {
          meets_minimum_criteria_scores: {
            csd_which_grades: NO,
            committed: NO,
            previous_yearlong_cdo_pd: NO,
            replace_existing: NO,
            principal_approval: NO,
            principal_schedule_confirmed: NO,
          },
          meets_scholarship_criteria_scores: {
            free_lunch_percent: NO,
            underrepresented_minority_percent: NO,
          },
        }.deep_stringify_keys,
        JSON.parse(application.response_scores)
      )
    end

    test 'autoscore with everything getting negative response for csp' do
      options = Pd::Application::Teacher2122Application.options
      principal_options = Pd::Application::PrincipalApproval2122Application.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplicationBase::PROGRAMS[:csp],
        csp_which_grades: [options[:csp_which_grades].last],
        previous_yearlong_cdo_pd: 'CS Principles',
        csp_how_offer: options[:csp_how_offer].first,
        plan_to_teach: options[:plan_to_teach].last,
        replace_existing: options[:replace_existing].first,
        committed: options[:committed].last,
        race: [options[:race].first],
        principal_approval: principal_options[:do_you_approve].last,
        principal_schedule_confirmed: principal_options[:committed_to_master_schedule].third,
        principal_diversity_recruitment: principal_options[:committed_to_diversity].last,
        principal_free_lunch_percent: 49,
        principal_underrepresented_minority_percent: 49,
        principal_wont_replace_existing_course: principal_options[:replace_course].first

      application = create :pd_teacher_application, regional_partner: nil, form_data_hash: application_hash
      application.auto_score!

      assert_equal(
        {
          meets_minimum_criteria_scores: {
            csp_which_grades: NO,
            committed: NO,
            previous_yearlong_cdo_pd: NO,
            replace_existing: NO,
            principal_approval: NO,
            principal_schedule_confirmed: NO,
          },
          meets_scholarship_criteria_scores: {
            free_lunch_percent: NO,
            underrepresented_minority_percent: NO,
          },
        }.deep_stringify_keys,
        JSON.parse(application.response_scores)
      )
    end

    test 'autoscore principal responses override teacher responses' do
      options = Pd::Application::Teacher2122Application.options
      principal_options = Pd::Application::PrincipalApproval2122Application.options

      application_hash = build :pd_teacher_application_hash,
        replace_existing: options[:replace_existing].first

      application = create :pd_teacher_application, form_data_hash: application_hash

      application.auto_score!

      assert_equal NO,
        application.response_scores_hash[:meets_minimum_criteria_scores][:replace_existing]

      application.update_form_data_hash(
        {
          principal_approval: principal_options[:do_you_approve].first,
          principal_wont_replace_existing_course: principal_options[:replace_course].second
        }
      )

      application.auto_score!

      assert_equal YES,
        application.response_scores_hash[:meets_minimum_criteria_scores][:replace_existing]
    end

    test 'autoscore principal responses for replace_existing question' do
      principal_options = Pd::Application::PrincipalApproval2122Application.options

      test_cases = [
        # If the answer for replace_course is 'Yes', the application does not meet requirement
        {
          principal_answers: {replace_course: principal_options[:replace_course].first},
          meet_requirement: NO
        },
        {
          principal_answers: {
            replace_course: principal_options[:replace_course].first,
            replace_which_course_csp: principal_options[:replace_which_course_csp].first
          },
          meet_requirement: NO
        },
        # If the answer for replace_course is 'No...', the application meets requirement
        {
          principal_answers: {replace_course: principal_options[:replace_course].second},
          meet_requirement: YES
        },
        {
          principal_answers: {replace_course: principal_options[:replace_course].third},
          meet_requirement: YES
        },
        # If the answer for replace_course is 'I don't know...', the verdict is inconclusive
        {
          principal_answers: {replace_course: principal_options[:replace_course].last},
          meet_requirement: nil
        }
      ]

      # Creates a teacher application with an inconclusive replace_existing answer.
      # The principal's responses will override teacher's responses anyway.
      application = build :pd_teacher_application,
        form_data_hash: (
        build :pd_teacher_application_hash, replace_existing: TEXT_FIELDS[:i_dont_know_explain]
        )
      application.auto_score!
      assert_nil application.response_scores_hash[:meets_minimum_criteria_scores][:replace_existing]

      # For each test case, creates an principal approval application and re-scores the
      # teacher application.
      test_cases.each_with_index do |test_case, index|
        principal_approval = build :pd_principal_approval2122_application,
          teacher_application: application,
          form_data_hash: (
          build :pd_principal_approval2122_application_hash_common, test_case[:principal_answers]
          )

        # Updates the application with principal's responses and run auto_score! again
        application.on_successful_principal_approval_create(principal_approval)

        assert_equal test_case[:meet_requirement],
          application.response_scores_hash[:meets_minimum_criteria_scores][:replace_existing],
          "Test case index #{index} failed"
      end
    end

    test 'autoscore nil results when applicable' do
      options = Pd::Application::Teacher2122Application.options
      principal_options = Pd::Application::PrincipalApproval2122Application.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplicationBase::PROGRAMS[:csp],
        plan_to_teach: options[:plan_to_teach].last,
        replace_existing: options[:replace_existing].first,
        principal_approval: principal_options[:do_you_approve].first,
        principal_schedule_confirmed: principal_options[:committed_to_master_schedule].fourth,
        principal_wont_replace_existing_course: principal_options[:replace_course].last

      application = create :pd_teacher_application, form_data_hash: application_hash

      application.auto_score!

      response_scores_hash = application.response_scores_hash

      assert_nil response_scores_hash[:meets_minimum_criteria_scores][:principal_schedule_confirmed]
      assert_nil response_scores_hash[:meets_minimum_criteria_scores][:replace_existing]
    end

    test 'principal_approval_state' do
      application = create :pd_teacher_application
      assert_nil application.principal_approval_state

      incomplete = "Incomplete - Principal email sent on Oct 8"
      Timecop.freeze Date.new(2020, 10, 8) do
        application.stubs(:deliver_email)
        application.queue_email :principal_approval, deliver_now: true
        assert_equal incomplete, application.reload.principal_approval_state
      end

      # even if it's not required, when an email was sent display incomplete
      application.update!(principal_approval_not_required: true)
      assert_equal incomplete, application.reload.principal_approval_state

      application.emails.last.destroy
      assert_equal 'Not required', application.reload.principal_approval_state

      create :pd_principal_approval2122_application, teacher_application: application, approved: 'Yes'
      assert_equal 'Complete - Yes', application.reload.principal_approval_state
    end

    test 'require assigned workshop for registration-related statuses when emails sent by system' do
      statuses = Teacher2122Application::WORKSHOP_REQUIRED_STATUSES
      partner = build :regional_partner, applications_decision_emails: RegionalPartner::SENT_BY_SYSTEM
      workshop = create :workshop
      application = create :pd_teacher_application, {
        regional_partner: partner
      }

      statuses.each do |status|
        application.status = status
        refute application.valid?
        assert_equal ["#{status} requires workshop to be assigned"], application.errors.messages[:status]
      end

      application.pd_workshop_id = workshop.id
      statuses.each do |status|
        application.status = status
        assert application.valid?
      end
    end

    test 'do not require assigned workshop for registration-related statuses if emails sent by partner' do
      statuses = Teacher2122Application::WORKSHOP_REQUIRED_STATUSES
      partner = build :regional_partner, applications_decision_emails: RegionalPartner::SENT_BY_PARTNER
      application = create :pd_teacher_application, {
        regional_partner: partner
      }

      statuses.each do |status|
        application.status = status
        assert application.valid?
      end
    end

    test 'do not require workshop for non-registration-related statuses' do
      statuses = Teacher2122Application.statuses - Teacher2122Application::WORKSHOP_REQUIRED_STATUSES
      partner = build :regional_partner, applications_decision_emails: RegionalPartner::SENT_BY_PARTNER
      application = create :pd_teacher_application, {
        regional_partner: partner
      }

      statuses.each do |status|
        application.status = status
        assert application.valid?
      end
    end

    test 'meets_scholarship_criteria' do
      application = create :pd_teacher_application
      test_cases = [
        {underrepresented_minority_percent: YES, free_lunch_percent: YES, verdict: YES},
        {underrepresented_minority_percent: YES, free_lunch_percent: nil, verdict: YES},
        {underrepresented_minority_percent: YES, free_lunch_percent: NO, verdict: YES},
        {underrepresented_minority_percent: nil, free_lunch_percent: YES, verdict: YES},
        {underrepresented_minority_percent: nil, free_lunch_percent: nil, verdict: REVIEWING_INCOMPLETE},
        {underrepresented_minority_percent: nil, free_lunch_percent: NO, verdict: REVIEWING_INCOMPLETE},
        {underrepresented_minority_percent: NO, free_lunch_percent: YES, verdict: YES},
        {underrepresented_minority_percent: NO, free_lunch_percent: nil, verdict: REVIEWING_INCOMPLETE},
        {underrepresented_minority_percent: NO, free_lunch_percent: NO, verdict: NO}
      ]

      test_cases.each do |test_case|
        input = test_case.slice(:underrepresented_minority_percent, :free_lunch_percent)
        application.update(response_scores: {meets_scholarship_criteria_scores: input}.to_json)

        output = application.meets_scholarship_criteria
        assert_equal test_case[:verdict], output, "Wrong result for case #{input}"
      end
    end

    test 'update scholarship status' do
      application = create :pd_teacher_application
      assert_nil application.scholarship_status

      application.update_scholarship_status(Pd::ScholarshipInfoConstants::NO)
      assert_equal Pd::ScholarshipInfoConstants::NO, application.scholarship_status

      refute application.update_scholarship_status 'invalid status'
      assert_equal Pd::ScholarshipInfoConstants::NO, application.scholarship_status

      application.update_scholarship_status(Pd::ScholarshipInfoConstants::YES_OTHER)
      assert_equal Pd::ScholarshipInfoConstants::YES_OTHER, application.scholarship_status
    end

    test 'course-specific scholarship status valid for CSP application' do
      application = create :pd_teacher_application
      assert_nil application.scholarship_status

      application.update_scholarship_status(Pd::ScholarshipInfoConstants::YES_EIR)
      assert application.valid?
    end

    test 'course-specific scholarship statuses invalid for CSD application' do
      application = create :pd_teacher_application, course: 'csd'
      assert_nil application.scholarship_status

      # This application status is only valid for CSP applications
      # Asserting this application status can't be assigned to a CSD application
      application.update_scholarship_status(Pd::ScholarshipInfoConstants::YES_EIR)
      assert_nil application.scholarship_status
    end

    test 'associated models cache prefetch' do
      workshop = create :workshop
      application = create :pd_teacher_application, pd_workshop_id: workshop.id
      # Workshops, Sessions, Enrollments, Schools, School districts
      assert_queries 5 do
        Teacher2122Application.prefetch_associated_models([application])
      end

      assert_queries 0 do
        assert_equal workshop, application.workshop
      end
    end

    private

    test 'test allow_sending_principal_email?' do
      # By default we can send.
      application = create :pd_teacher_application
      assert application.allow_sending_principal_email?

      # If we are unreviewed, we can send.
      application = create :pd_teacher_application
      application.update!(status: 'unreviewed')
      assert application.allow_sending_principal_email?

      # If we are pending, we can send.
      application = create :pd_teacher_application
      application.update!(status: 'pending')
      assert application.allow_sending_principal_email?

      # If we are waitlisted, we can send.
      application = create :pd_teacher_application
      application.update!(status: 'waitlisted')
      assert application.allow_sending_principal_email?

      # If we're no longer unreviewed/pending/waitlisted, we can't send.
      application = create :pd_teacher_application
      application.update!(status: 'accepted_no_cost_registration')
      refute application.allow_sending_principal_email?

      # If principal approval is not required, we can't send.
      application = create :pd_teacher_application
      application.update!(principal_approval_not_required: true)
      refute application.allow_sending_principal_email?

      # If we already have a principal response, we can't send.
      application = create :pd_teacher_application
      create :pd_principal_approval2122_application, teacher_application: application
      refute application.allow_sending_principal_email?

      # If we created a principal email < 5 days ago, we can't send.
      application = create :pd_teacher_application
      create :pd_application_email, application: application, email_type: 'principal_approval', created_at: 1.day.ago
      refute application.allow_sending_principal_email?

      # If we created a principal email >= 5 days ago, we can send.
      application = create :pd_teacher_application
      create :pd_application_email, application: application, email_type: 'principal_approval', created_at: 6.days.ago
      assert application.allow_sending_principal_email?
    end

    test 'test allow_sending_principal_approval_teacher_reminder_email?' do
      # By default we can't send.
      application = create :pd_teacher_application
      refute application.allow_sending_principal_approval_teacher_reminder_email?

      # If we are unreviewed, we can send.
      application = create :pd_teacher_application
      application.update!(status: 'unreviewed')
      create :pd_application_email, application: application, email_type: 'principal_approval', created_at: 6.days.ago
      assert application.allow_sending_principal_approval_teacher_reminder_email?

      # If we are pending, we can send.
      application = create :pd_teacher_application
      application.update!(status: 'pending')
      create :pd_application_email, application: application, email_type: 'principal_approval', created_at: 6.days.ago
      assert application.allow_sending_principal_approval_teacher_reminder_email?

      # If we are waitlisted, we can't send.
      application = create :pd_teacher_application
      application.update!(status: 'waitlisted')
      create :pd_application_email, application: application, email_type: 'principal_approval', created_at: 6.days.ago
      refute application.allow_sending_principal_approval_teacher_reminder_email?

      # If we're no longer unreviewed/pending, we can't send.
      application = create :pd_teacher_application
      application.update!(status: 'accepted_no_cost_registration')
      create :pd_application_email, application: application, email_type: 'principal_approval', created_at: 6.days.ago
      refute application.allow_sending_principal_approval_teacher_reminder_email?

      # If we created a teacher reminder email any time before, we can't send.
      application = create :pd_teacher_application
      create :pd_application_email, application: application, email_type: 'principal_approval_teacher_reminder', created_at: 14.days.ago
      create :pd_application_email, application: application, email_type: 'principal_approval', created_at: 6.days.ago
      refute application.allow_sending_principal_approval_teacher_reminder_email?

      # If principal approval is not required, we can't send.
      application = create :pd_teacher_application
      application.update!(principal_approval_not_required: true)
      create :pd_application_email, application: application, email_type: 'principal_approval', created_at: 6.days.ago
      refute application.allow_sending_principal_approval_teacher_reminder_email?

      # If we already have a principal response, we can't send.
      application = create :pd_teacher_application
      create :pd_principal_approval2122_application, teacher_application: application
      create :pd_application_email, application: application, email_type: 'principal_approval', created_at: 6.days.ago
      refute application.allow_sending_principal_approval_teacher_reminder_email?

      # If we created a principal email < 5 days ago, we can't send.
      application = create :pd_teacher_application
      create :pd_application_email, application: application, email_type: 'principal_approval', created_at: 1.day.ago
      refute application.allow_sending_principal_approval_teacher_reminder_email?

      # If we created a principal email >= 5 days ago, we can send.
      application = create :pd_teacher_application
      create :pd_application_email, application: application, email_type: 'principal_approval', created_at: 6.days.ago
      assert application.allow_sending_principal_approval_teacher_reminder_email?
    end

    def assert_status_log(expected, application)
      assert_equal JSON.parse(expected.to_json), application.status_log
    end
  end
end
