require 'test_helper'

module Pd::Application
  class TeacherApplicationTest < ActiveSupport::TestCase
    include Pd::TeacherApplicationConstants
    include Pd::Application::ActiveApplicationModels
    include ApplicationConstants
    include RegionalPartnerTeacherconMapping

    freeze_time

    test 'application guid is generated on create' do
      teacher_application = build :pd_teacher_application
      assert_nil teacher_application.application_guid

      teacher_application.save!
      refute_nil teacher_application.application_guid
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

    test 'updating form data re-calculates regional partner' do
      partner_1 = create :regional_partner
      partner_2 = create :regional_partner
      hash_with_partner_1 = build TEACHER_APPLICATION_HASH_FACTORY, regional_partner_id: partner_1.id
      hash_with_partner_2 = build TEACHER_APPLICATION_HASH_FACTORY, regional_partner_id: partner_2.id
      application = create :pd_teacher_application

      assert_nil application.regional_partner_id

      application.update(form_data_hash: hash_with_partner_1)
      assert_equal application.reload.regional_partner_id, partner_1.id

      application.update(form_data_hash: hash_with_partner_2)
      assert_equal application.reload.regional_partner_id, partner_2.id
    end

    test 'meets criteria says an application meets criteria when all YES_NO fields are marked yes' do
      teacher_application = build :pd_teacher_application, course: 'csd',
                                  response_scores: {
                                    meets_minimum_criteria_scores: SCOREABLE_QUESTIONS[:criteria_score_questions_csd].index_with('Yes')
                                  }.to_json
      assert_equal 'Yes', teacher_application.meets_criteria

      teacher_application = build :pd_teacher_application, course: 'csp',
                                  response_scores: {
                                    meets_minimum_criteria_scores: SCOREABLE_QUESTIONS[:criteria_score_questions_csp].index_with('Yes')
                                  }.to_json
      assert_equal 'Yes', teacher_application.meets_criteria

      teacher_application = build :pd_teacher_application, course: 'csa',
                                  response_scores: {
                                    meets_minimum_criteria_scores: SCOREABLE_QUESTIONS[:criteria_score_questions_csa].index_with('Yes')
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

    test 'meets criteria returns reviewing incomplete when an application does not have YES on all YES_NO fields but has no NOs' do
      teacher_application = build :pd_teacher_application, response_scores: {
        meets_minimum_criteria_scores: {
          committed: 'Yes'
        }
      }.to_json
      assert_equal Pd::Application::TeacherApplication::REVIEWING_INCOMPLETE, teacher_application.meets_criteria
    end

    test 'accepted_at updates times' do
      today = Time.zone.today.to_time
      tomorrow = Time.zone.tomorrow.to_time
      application = create :pd_teacher_application
      assert_nil application.accepted_at

      Timecop.freeze(today) do
        application.update!(status: 'accepted')
        assert_equal today, application.accepted_at.to_time

        application.update!(status: 'declined')
        assert_nil application.accepted_at
      end

      Timecop.freeze(tomorrow) do
        application.update!(status: 'accepted')
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
        build :pd_teacher_application_hash, :with_custom_school
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
      user = create :teacher
      application_school_info = create :school_info
      original_user_school_info = user.school_info

      application = create :pd_teacher_application, user: user, form_data_hash: (
        build :pd_teacher_application_hash, school: application_school_info.school
      )

      application.update_user_school_info!
      refute_equal original_user_school_info, user.school_info
      assert_equal application_school_info, user.school_info
    end

    test 'update_user_school_info with custom school does nothing when the user already has a specific school' do
      original_school_info = create :school_info
      user = create :teacher, school_info: original_school_info
      application = create :pd_teacher_application, user: user, form_data_hash: (
        build :pd_teacher_application_hash, :with_custom_school
      )

      application.update_user_school_info!
      assert_equal original_school_info, user.school_info
    end

    test 'update_user_school_info with custom school updates user info when user does not have a specific school' do
      user = create :teacher, school_info: nil
      original_user_school_info_id = user.school_info_id
      application = create :pd_teacher_application, user: user, form_data_hash: (
        build :pd_teacher_application_hash, :with_custom_school
      )

      application.update_user_school_info!
      refute_equal original_user_school_info_id, user.school_info_id
      refute_nil user.school_info_id
    end

    test 'update_user_school_info does nothing when user has no school info and does not have enough info for new school' do
      user = create :teacher, school_info: nil
      completed_custom_school_info = {
        school_name: 'Code.org',
        school_address: '1501 4th Ave',
        school_state: 'Washington',
        school_zip_code: '98101',
        school_type: 'Public school'
      }
      %i(school_name school_address school_state school_zip_code school_type).each do |attribute|
        application = create :pd_teacher_application, user: user, form_data_hash: (
          build :pd_teacher_application_hash, :with_no_school, completed_custom_school_info.except(attribute)
        )

        application.update_user_school_info!
        assert_nil user.school_info
      end
    end

    test 'get_first_selected_workshop single local workshop' do
      Pd::Workshop.any_instance.stubs(:process_location)

      workshop = create :workshop, location_address: 'Address', sessions_from: Time.zone.today, num_sessions: 1
      application = create :pd_teacher_application, form_data_hash: (
      build :pd_teacher_application_hash,
        regional_partner_workshop_ids: [workshop.id],
        able_to_attend_multiple: ["#{Time.zone.today.strftime '%B %-d, %Y'} in Address"]
      )

      assert_equal workshop, application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop multiple local workshops' do
      addresses = %w(tba TBA tba)
      workshops = (1..3).map do |i|
        create(
          :workshop,
          num_sessions: 2,
          sessions_from: Time.zone.today + i,
          location_address: addresses[i - 1]
        )
      end

      application = create :pd_teacher_application, form_data_hash:
      build(:pd_teacher_application_hash, :with_multiple_workshops,
        regional_partner_workshop_ids: workshops.map(&:id),
        able_to_attend_multiple: (
        # Select all but the first. Expect the first selected to be returned below
        workshops[1..].map do |workshop|
          "#{workshop.friendly_date_range} in #{workshop.location_address} hosted by Code.org"
        end
        )
      )

      assert_equal workshops[1], application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop multiple local workshops no selection returns first' do
      workshops = (1..2).map {|i| create :workshop, num_sessions: 2, sessions_from: Time.zone.today + i}

      application = create :pd_teacher_application, form_data_hash:
      build(:pd_teacher_application_hash, :with_multiple_workshops,
        regional_partner_workshop_ids: workshops.map(&:id),
        able_to_attend_multiple: ['Not a workshop', 'Not a workshop 2']
      )

      assert_equal workshops.first, application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop with no workshops returns nil' do
      application = create :pd_teacher_application, form_data_hash:
      build(:pd_teacher_application_hash, :with_multiple_workshops,
        regional_partner_workshop_ids: []
      )

      assert_nil application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop ignores single deleted workshops' do
      Pd::Workshop.any_instance.stubs(:process_location)

      workshop = create :summer_workshop, location_address: 'Buffalo, NY', sessions_from: Date.new(2020, 1, 1)
      application = create :pd_teacher_application, form_data_hash:
      build(:pd_teacher_application_hash,
        regional_partner_workshop_ids: [workshop.id],
        able_to_attend_multiple: ['January 1-5, 2020 in Buffalo, NY']
      )

      workshop.destroy
      assert_nil application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop ignores deleted workshop from multiple list' do
      workshops = (1..2).map {|i| create :workshop, num_sessions: 2, sessions_from: Time.zone.today + i}

      application = create :pd_teacher_application, form_data_hash:
      build(:pd_teacher_application_hash, :with_multiple_workshops,
        regional_partner_workshop_ids: workshops.map(&:id),
        able_to_attend: [workshops.first.id, workshops.second.id]
      )

      workshops[0].destroy
      assert_equal workshops[1], application.get_first_selected_workshop

      workshops[1].destroy
      assert_nil application.get_first_selected_workshop
    end

    test 'get_first_selected_workshop picks correct workshop even when multiple are on the same day' do
      workshop_1 = create :workshop, num_sessions: 2, sessions_from: Time.zone.today + 2
      workshop_2 = create :workshop, num_sessions: 2, sessions_from: Time.zone.today + 2
      workshop_1.update_column(:location_address, 'Location 1')
      workshop_2.update_column(:location_address, 'Location 2')

      application = create :pd_teacher_application, form_data_hash:
      build(:pd_teacher_application_hash, :with_multiple_workshops,
        regional_partner_workshop_ids: [workshop_1.id, workshop_2.id],
        able_to_attend_multiple: ["#{workshop_2.friendly_date_range} in Location 2 hosted by Code.org"]
      )

      assert_equal workshop_2, application.get_first_selected_workshop

      application_2 = create :pd_teacher_application, form_data_hash:
      build(:pd_teacher_application_hash, :with_multiple_workshops,
        regional_partner_workshop_ids: [workshop_1.id, workshop_2.id],
        able_to_attend_multiple: ["#{workshop_2.friendly_date_range} in Location 1 hosted by Code.org"]
      )

      assert_equal workshop_1, application_2.get_first_selected_workshop
    end

    test 'columns_to_remove' do
      ['csp', 'csd'].each do |course|
        columns = TeacherApplication.columns_to_remove(course)
        columns.each_key do |k|
          columns[k].each {|c| refute_includes(c.to_s, course)}
        end
      end
    end

    test 'csv_filtered_labels' do
      csv_filtered_labels_csd = TeacherApplication.csv_filtered_labels('csd')
      assert_includes(csv_filtered_labels_csd[:teacher], :csd_which_grades)
      refute_includes(csv_filtered_labels_csd[:teacher], :csp_which_grades)
      refute_includes(csv_filtered_labels_csd[:teacher], :csa_which_grades)

      csv_filtered_labels_csp = TeacherApplication.csv_filtered_labels('csp')
      refute_includes(csv_filtered_labels_csp[:teacher], :csd_which_grades)
      assert_includes(csv_filtered_labels_csp[:teacher], :csp_which_grades)
      refute_includes(csv_filtered_labels_csp[:teacher], :csa_which_grades)

      csv_filtered_labels_csa = TeacherApplication.csv_filtered_labels('csa')
      refute_includes(csv_filtered_labels_csa[:teacher], :csd_which_grades)
      refute_includes(csv_filtered_labels_csa[:teacher], :csp_which_grades)
      assert_includes(csv_filtered_labels_csa[:teacher], :csa_which_grades)
    end

    test 'csv_header' do
      csd_plan_offer_question = "To which grades does your school plan to offer CS Discoveries in the #{APPLICATION_CURRENT_YEAR} school year?"
      csp_plan_offer_question = "To which grades does your school plan to offer CS Principles in the #{APPLICATION_CURRENT_YEAR} school year?"
      csa_plan_offer_question = "To which grades does your school plan to offer CSA in the #{APPLICATION_CURRENT_YEAR} school year?"

      csv_header_csd = CSV.parse(TeacherApplication.csv_header('csd'))[0]
      assert_includes(csv_header_csd, csd_plan_offer_question)
      refute_includes(csv_header_csd, csp_plan_offer_question)
      refute_includes(csv_header_csd, csa_plan_offer_question)
      assert_equal 83, csv_header_csd.length

      csv_header_csp = CSV.parse(TeacherApplication.csv_header('csp'))[0]
      refute_includes(csv_header_csp, csd_plan_offer_question)
      assert_includes(csv_header_csp, csp_plan_offer_question)
      refute_includes(csv_header_csp, csa_plan_offer_question)
      assert_equal 85, csv_header_csp.length

      csv_header_csa = CSV.parse(TeacherApplication.csv_header('csa'))[0]
      refute_includes(csv_header_csa, csd_plan_offer_question)
      refute_includes(csv_header_csd, csp_plan_offer_question)
      assert_includes(csv_header_csa, csa_plan_offer_question)
      assert_equal 87, csv_header_csa.length
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
        TeacherApplication.prefetch_associated_models([application])
      end

      assert_queries 0 do
        assert_equal school.name.titleize, application.school_name
        assert_equal school.school_district.name.titleize, application.district_name
        assert_equal workshop, application.workshop
      end
    end

    test 'memoized filtered_labels' do
      TeacherApplication::FILTERED_LABELS.clear

      filtered_labels_csd = TeacherApplication.filtered_labels('csd')
      assert_includes(filtered_labels_csd, :csd_which_grades)
      refute_includes(filtered_labels_csd, :csp_which_grades)
      refute_includes(filtered_labels_csd, :csa_which_grades)
      assert_equal ['csd'], TeacherApplication::FILTERED_LABELS.keys

      filtered_labels_csp = TeacherApplication.filtered_labels('csp')
      refute_includes(filtered_labels_csp, :csd_which_grades)
      assert_includes(filtered_labels_csp, :csp_which_grades)
      refute_includes(filtered_labels_csp, :csa_which_grades)
      assert_equal ['csd', 'csp'], TeacherApplication::FILTERED_LABELS.keys

      filtered_labels_csa = TeacherApplication.filtered_labels('csa')
      refute_includes(filtered_labels_csa, :csd_which_grades)
      refute_includes(filtered_labels_csa, :csp_which_grades)
      assert_includes(filtered_labels_csa, :csa_which_grades)
      assert_equal ['csd', 'csp', 'csa'], TeacherApplication::FILTERED_LABELS.keys
    end

    test 'status changes are logged' do
      application = build :pd_teacher_application, status: 'incomplete'
      assert_nil application.status_log

      application.save!
      assert application.status_log.is_a? Array
      assert_status_log [{status: 'incomplete', at: Time.zone.now}], application

      # update related field
      Timecop.freeze 1
      application.update!(form_data: application.form_data_hash.merge(firstName: 'Garfunkel').to_json)
      assert_status_log(
        [
          {status: 'incomplete', at: 1.second.ago},
          {status: 'incomplete', at: Time.zone.now}
        ],
        application
      )

      # update unrelated field
      Timecop.freeze 2
      application.update!(notes: 'some notes')
      assert_equal Time.zone.now, application.updated_at
      assert_equal 2, application.status_log.count

      # update related field
      Timecop.freeze 3
      application.update!(status: 'unreviewed')
      assert_equal Time.zone.now, application.updated_at
      assert_equal 3, application.status_log.count
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

    test 'test csa dynamically required fields' do
      application_hash = build :pd_teacher_application_hash_common,
        :csa,
        csa_which_grades: nil,
        csa_how_offer: nil,
        csa_already_know: nil
      application = build :pd_teacher_application, form_data_hash: application_hash
      refute application.valid?
      assert_equal %w(csaWhichGrades csaHowOffer csaAlreadyKnow), application.errors.messages[:form_data]
    end

    test 'should_send_decision_email?' do
      partner = create :regional_partner, applications_decision_emails: RegionalPartner::SENT_BY_SYSTEM
      application_hash = build :pd_teacher_application_hash, regional_partner_id: partner.id
      application = create :pd_teacher_application, form_data_hash: application_hash

      # no auto-email status: no email
      refute application.should_send_decision_email?

      # auto-email status with partner emails sent_by_system: yes email
      application.status = :accepted
      assert application.should_send_decision_email?

      # auto-email status, partner with sent_by_partner: no email
      application.regional_partner.applications_decision_emails = RegionalPartner::SENT_BY_PARTNER
      refute application.should_send_decision_email?
    end

    test 'autoscore with everything getting positive response for csd' do
      options = Pd::Application::TeacherApplication.options
      principal_options = Pd::Application::PrincipalApprovalApplication.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplication::PROGRAMS[:csd],
        will_teach: options[:will_teach].first,
        csd_which_grades: ['6'],
        enough_course_hours: options[:enough_course_hours].first,
        previous_yearlong_cdo_pd: ['CS Principles'],
        committed: options[:committed].first,
        race: options[:race].first(2),
        principal_approval: principal_options[:do_you_approve].first,
        principal_free_lunch_percent: 50,
        principal_underrepresented_minority_percent: 50

      application = create :pd_teacher_application, form_data_hash: application_hash
      create :census_summary, school_year: application.census_year, school_id: application.school_id, teaches_cs: Census::CensusSummary::TEACHES[:NO]
      application.auto_score!

      assert_equal(
        {
          meets_minimum_criteria_scores: {
            csd_which_grades: YES,
            enough_course_hours: YES,
            committed: YES,
            previous_yearlong_cdo_pd: YES,
            principal_approval: YES,
          },
          meets_scholarship_criteria_scores: {
            free_lunch_percent: YES,
            underrepresented_minority_percent: YES,
            school_last_census_status: YES,
          },
        }.deep_stringify_keys,
        JSON.parse(application.response_scores)
      )
    end

    test 'autoscore with everything getting a positive response for csp' do
      options = Pd::Application::TeacherApplication.options
      principal_options = Pd::Application::PrincipalApprovalApplication.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplication::PROGRAMS[:csp],
        will_teach: options[:will_teach].first,
        csp_which_grades: ['12'],
        enough_course_hours: options[:enough_course_hours].first,
        previous_yearlong_cdo_pd: ['CS Discoveries'],
        csp_how_offer: options[:csp_how_offer].last,
        committed: options[:committed].first,
        race: options[:race].first(2),
        principal_approval: principal_options[:do_you_approve].first,
        principal_free_lunch_percent: 50,
        principal_underrepresented_minority_percent: 50

      application = create :pd_teacher_application, form_data_hash: application_hash
      create :census_summary, school_year: application.census_year, school_id: application.school_id, teaches_cs: Census::CensusSummary::TEACHES[:NO]
      application.auto_score!

      assert_equal(
        {
          meets_minimum_criteria_scores: {
            csp_which_grades: YES,
            enough_course_hours: YES,
            committed: YES,
            previous_yearlong_cdo_pd: YES,
            principal_approval: YES,
          },
          meets_scholarship_criteria_scores: {
            free_lunch_percent: YES,
            underrepresented_minority_percent: YES,
            school_last_census_status: YES,
          },
        }.deep_stringify_keys,
        JSON.parse(application.response_scores)
      )
    end

    test 'autoscore with everything getting a positive response for csa' do
      options = Pd::Application::TeacherApplication.options
      principal_options = Pd::Application::PrincipalApprovalApplication.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplication::PROGRAMS[:csa],
        will_teach: options[:will_teach].first,
        csa_already_know: options[:csa_already_know].first,
        csa_phone_screen: options[:csa_phone_screen].first,
        csa_which_grades: ['12'],
        enough_course_hours: options[:enough_course_hours].first,
        previous_yearlong_cdo_pd: ['CS Principles'],
        csa_how_offer: options[:csa_how_offer].last,
        committed: options[:committed].first,
        race: options[:race].first(2),
        principal_approval: principal_options[:do_you_approve].first,
        principal_free_lunch_percent: 50,
        principal_underrepresented_minority_percent: 50

      application = create :pd_teacher_application, form_data_hash: application_hash
      create :census_summary, school_year: application.census_year, school_id: application.school_id, teaches_cs: Census::CensusSummary::TEACHES[:NO]
      application.auto_score!

      assert_equal(
        {
          meets_minimum_criteria_scores: {
            csa_already_know: YES,
            csa_phone_screen: YES,
            csa_which_grades: YES,
            enough_course_hours: YES,
            committed: YES,
            previous_yearlong_cdo_pd: YES,
            principal_approval: YES,
          },
          meets_scholarship_criteria_scores: {
            free_lunch_percent: YES,
            underrepresented_minority_percent: YES,
            school_last_census_status: YES,
          },
        }.deep_stringify_keys,
        JSON.parse(application.response_scores)
      )
    end

    test 'autoscore works before principal approval' do
      options = Pd::Application::TeacherApplication.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplication::PROGRAMS[:csp],
        will_teach: options[:will_teach].first,
        csp_which_grades: ['12'],
        enough_course_hours: options[:enough_course_hours].first,
        previous_yearlong_cdo_pd: ['CS Discoveries'],
        csp_how_offer: options[:csp_how_offer].last,
        committed: options[:committed].first,
        race: [options[:race].second]

      application = create :pd_teacher_application, form_data_hash: application_hash
      application.auto_score!

      assert_equal(
        {
          meets_minimum_criteria_scores: {
            csp_which_grades: YES,
            enough_course_hours: YES,
            committed: YES,
            previous_yearlong_cdo_pd: YES,
          },
          meets_scholarship_criteria_scores: {
            school_last_census_status: YES,
          },
        }.deep_stringify_keys,
        JSON.parse(application.response_scores)
      )
    end

    test 'autoscore with everything getting negative response for csd' do
      options = Pd::Application::TeacherApplication.options
      principal_options = Pd::Application::PrincipalApprovalApplication.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplication::PROGRAMS[:csd],
        will_teach: options[:will_teach].last,
        csd_which_grades: nil,
        enough_course_hours: options[:enough_course_hours].last,
        previous_yearlong_cdo_pd: ['CS Discoveries'],
        committed: options[:committed].last,
        race: [options[:race].first],
        principal_approval: principal_options[:do_you_approve].last,
        principal_free_lunch_percent: 49,
        principal_underrepresented_minority_percent: 49

      application = create :pd_teacher_application, form_data_hash: application_hash
      create :census_summary, school_year: application.census_year, school_id: application.school_id, teaches_cs: Census::CensusSummary::TEACHES[:YES]
      application.auto_score!

      assert_equal(
        {
          meets_minimum_criteria_scores: {
            csd_which_grades: NO,
            enough_course_hours: NO,
            committed: NO,
            previous_yearlong_cdo_pd: NO,
            principal_approval: NO,
          },
          meets_scholarship_criteria_scores: {
            free_lunch_percent: NO,
            underrepresented_minority_percent: NO,
            school_last_census_status: NO,
          },
        }.deep_stringify_keys,
        JSON.parse(application.response_scores)
      )
    end

    test 'autoscore with everything getting negative response for csp' do
      options = Pd::Application::TeacherApplication.options
      principal_options = Pd::Application::PrincipalApprovalApplication.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplication::PROGRAMS[:csp],
        will_teach: options[:will_teach].last,
        csp_which_grades: nil,
        enough_course_hours: options[:enough_course_hours].last,
        previous_yearlong_cdo_pd: 'CS Principles',
        csp_how_offer: options[:csp_how_offer].first,
        committed: options[:committed].last,
        race: [options[:race].first],
        principal_approval: principal_options[:do_you_approve].last,
        principal_free_lunch_percent: 49,
        principal_underrepresented_minority_percent: 49

      application = create :pd_teacher_application, form_data_hash: application_hash
      create :census_summary, school_year: application.census_year, school_id: application.school_id, teaches_cs: Census::CensusSummary::TEACHES[:YES]
      application.auto_score!

      assert_equal(
        {
          meets_minimum_criteria_scores: {
            csp_which_grades: NO,
            enough_course_hours: NO,
            committed: NO,
            previous_yearlong_cdo_pd: NO,
            principal_approval: NO,
          },
          meets_scholarship_criteria_scores: {
            free_lunch_percent: NO,
            underrepresented_minority_percent: NO,
            school_last_census_status: NO,
          },
        }.deep_stringify_keys,
        JSON.parse(application.response_scores)
      )
    end

    test 'autoscore with everything getting negative response for csa' do
      options = Pd::Application::TeacherApplication.options
      principal_options = Pd::Application::PrincipalApprovalApplication.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplication::PROGRAMS[:csa],
        will_teach: options[:will_teach].last,
        csa_already_know: options[:csa_already_know].last,
        csa_phone_screen: options[:csa_phone_screen].last,
        csa_which_grades: nil,
        enough_course_hours: options[:enough_course_hours].last,
        previous_yearlong_cdo_pd: 'Computer Science A (CSA)',
        csa_how_offer: options[:csa_how_offer].first,
        committed: options[:committed].last,
        race: [options[:race].first],
        principal_approval: principal_options[:do_you_approve].last,
        principal_free_lunch_percent: 49,
        principal_underrepresented_minority_percent: 49

      application = create :pd_teacher_application, form_data_hash: application_hash
      create :census_summary, school_year: application.census_year, school_id: application.school_id, teaches_cs: Census::CensusSummary::TEACHES[:YES]
      application.auto_score!

      assert_equal(
        {
          meets_minimum_criteria_scores: {
            csa_already_know: NO,
            csa_which_grades: NO,
            csa_phone_screen: NO,
            enough_course_hours: NO,
            committed: NO,
            previous_yearlong_cdo_pd: NO,
            principal_approval: NO,
          },
          meets_scholarship_criteria_scores: {
            free_lunch_percent: NO,
            underrepresented_minority_percent: NO,
            school_last_census_status: NO,
          },
        }.deep_stringify_keys,
        JSON.parse(application.response_scores)
      )
    end

    test 'autoscore nil results when applicable' do
      principal_options = Pd::Application::PrincipalApprovalApplication.options

      application_hash = build :pd_teacher_application_hash,
        program: Pd::Application::TeacherApplication::PROGRAMS[:csp],
        principal_approval: principal_options[:do_you_approve].first

      application = create :pd_teacher_application, form_data_hash: application_hash

      application.auto_score!

      response_scores_hash = application.response_scores_hash
      assert_nil response_scores_hash[:meets_minimum_criteria_scores][:free_lunch_percent]
    end

    test 'principal_approval_state' do
      application = create :pd_teacher_application
      assert_nil application.principal_approval_state

      incomplete = "Incomplete - Admin email sent on Oct 8"
      Timecop.freeze Date.new(2020, 10, 8) do
        application.stubs(:deliver_email)
        application.send_pd_application_email :admin_approval
        assert_equal incomplete, application.reload.principal_approval_state
      end

      refute application.reload.principal_approval_not_required

      # even if it's not required, when an email was sent display incomplete
      application.update!(principal_approval_not_required: true)
      assert_equal incomplete, application.reload.principal_approval_state

      application.emails.last.destroy
      assert_equal 'Not required', application.reload.principal_approval_state

      create :pd_principal_approval_application, teacher_application: application, approved: 'Yes'
      assert_includes(application.reload.principal_approval_state, 'Complete - Admin said Yes on')
    end

    test 'scholarship criteria uses regional partner set fields when specified' do
      regional_partner = create :regional_partner,
        frl_guardrail_percent: REGIONAL_PARTNER_DEFAULT_GUARDRAILS[:frl_not_rural] + 2,
        urg_guardrail_percent: REGIONAL_PARTNER_DEFAULT_GUARDRAILS[:urg] - 2

      # Does not meet Free and Reduced Lunch criteria but does meet Underrepresented Group criteria
      principal_options = Pd::Application::PrincipalApprovalApplication.options
      application_hash = build TEACHER_APPLICATION_HASH_FACTORY,
        principal_approval: principal_options[:do_you_approve].first,
        principal_free_lunch_percent: REGIONAL_PARTNER_DEFAULT_GUARDRAILS[:frl_not_rural] + 1,
        principal_underrepresented_minority_percent: REGIONAL_PARTNER_DEFAULT_GUARDRAILS[:urg] - 1,
        regional_partner_id: regional_partner.id

      application = create :pd_teacher_application, form_data_hash: application_hash
      application.auto_score!

      # Regional partner defined guardrails: FRL = (default + 2)%, URG = (default - 2)%
      assert_equal(NO, application.response_scores_hash[:meets_scholarship_criteria_scores][:free_lunch_percent])
      assert_equal(YES, application.response_scores_hash[:meets_scholarship_criteria_scores][:underrepresented_minority_percent])
    end

    test 'scholarship criteria uses default guardrails when regional partner does not specify' do
      regional_partner = create :regional_partner

      # Meets Free and Reduced Lunch criteria but not Underrepresented Group criteria
      principal_options = Pd::Application::PrincipalApprovalApplication.options
      application_hash = build :pd_teacher_application_hash,
        principal_approval: principal_options[:do_you_approve].first,
        principal_free_lunch_percent: REGIONAL_PARTNER_DEFAULT_GUARDRAILS[:frl_not_rural],
        principal_underrepresented_minority_percent: REGIONAL_PARTNER_DEFAULT_GUARDRAILS[:urg] - 1,
        regional_partner_id: regional_partner.id

      application = create :pd_teacher_application, form_data_hash: application_hash
      application.auto_score!

      # Regional partner did not set guardrails, default to 50% for both (40% for FRL for rural schools)
      assert_equal(YES, application.response_scores_hash[:meets_scholarship_criteria_scores][:free_lunch_percent])
      assert_equal(NO, application.response_scores_hash[:meets_scholarship_criteria_scores][:underrepresented_minority_percent])
    end

    test 'scholarship criteria uses default guardrails when matched to No Partner' do
      # Meets Free and Reduced Lunch criteria but not Underrepresented Group criteria
      principal_options = Pd::Application::PrincipalApprovalApplication.options
      application_hash = build :pd_teacher_application_hash,
        principal_approval: principal_options[:do_you_approve].first,
        principal_free_lunch_percent: REGIONAL_PARTNER_DEFAULT_GUARDRAILS[:frl_not_rural],
        principal_underrepresented_minority_percent: REGIONAL_PARTNER_DEFAULT_GUARDRAILS[:urg] - 1

      application = create :pd_teacher_application, form_data_hash: application_hash
      application.auto_score!

      # No partner guardrails default to 50% for both (40% for FRL for rural schools)
      assert_equal(YES, application.response_scores_hash[:meets_scholarship_criteria_scores][:free_lunch_percent])
      assert_equal(NO, application.response_scores_hash[:meets_scholarship_criteria_scores][:underrepresented_minority_percent])
    end

    test 'require assigned workshop for registration-related statuses when emails sent by system' do
      workshop_required_statuses = TeacherApplication::WORKSHOP_REQUIRED_STATUSES
      partner = create :regional_partner, applications_decision_emails: RegionalPartner::SENT_BY_SYSTEM
      workshop = create :workshop
      hash_with_partner = build TEACHER_APPLICATION_HASH_FACTORY, regional_partner_id: partner.id
      application = create :pd_teacher_application, {
        form_data_hash: hash_with_partner
      }

      workshop_required_statuses.each do |status|
        application.status = status
        refute application.valid?
        assert_equal ["#{status} requires workshop to be assigned"], application.errors.messages[:status]
      end

      application.pd_workshop_id = workshop.id
      workshop_required_statuses.each do |status|
        application.status = status
        assert application.valid?
      end
    end

    test 'do not require assigned workshop for registration-related statuses if emails sent by partner' do
      statuses = TeacherApplication::WORKSHOP_REQUIRED_STATUSES
      partner = create :regional_partner, applications_decision_emails: RegionalPartner::SENT_BY_PARTNER
      form_data_with_partner = build TEACHER_APPLICATION_HASH_FACTORY, regional_partner_id: partner.id
      application = create :pd_teacher_application, {
        form_data_hash: form_data_with_partner
      }

      statuses.each do |status|
        application.status = status
        assert application.valid?
      end
    end

    test 'do not require workshop for non-registration-related statuses' do
      statuses = TeacherApplication.statuses - TeacherApplication::WORKSHOP_REQUIRED_STATUSES
      partner = create :regional_partner, applications_decision_emails: RegionalPartner::SENT_BY_PARTNER
      form_data_with_partner = build TEACHER_APPLICATION_HASH_FACTORY, regional_partner_id: partner.id
      application = create :pd_teacher_application, {
        form_data_hash: form_data_with_partner
      }

      statuses.each do |status|
        application.status = status
        assert application.valid?
      end
    end

    test 'meets_scholarship_criteria' do
      application = create :pd_teacher_application
      test_cases = [
        {underrepresented_minority_percent: YES, free_lunch_percent: YES, school_last_census_status: YES, verdict: YES},
        {underrepresented_minority_percent: YES, free_lunch_percent: YES, school_last_census_status: NO, verdict: YES},
        {underrepresented_minority_percent: YES, free_lunch_percent: NO, school_last_census_status: YES, verdict: YES},
        {underrepresented_minority_percent: NO, free_lunch_percent: YES, school_last_census_status: YES, verdict: YES},
        {underrepresented_minority_percent: YES, free_lunch_percent: YES, school_last_census_status: nil, verdict: YES},
        {underrepresented_minority_percent: YES, free_lunch_percent: nil, school_last_census_status: YES, verdict: YES},
        {underrepresented_minority_percent: nil, free_lunch_percent: YES, school_last_census_status: YES, verdict: YES},
        {underrepresented_minority_percent: YES, free_lunch_percent: NO, school_last_census_status: NO, verdict: YES},
        {underrepresented_minority_percent: nil, free_lunch_percent: nil, school_last_census_status: nil, verdict: REVIEWING_INCOMPLETE},
        {underrepresented_minority_percent: nil, free_lunch_percent: NO, school_last_census_status: NO, verdict: REVIEWING_INCOMPLETE},
        {underrepresented_minority_percent: NO, free_lunch_percent: nil, school_last_census_status: NO, verdict: REVIEWING_INCOMPLETE},
        {underrepresented_minority_percent: NO, free_lunch_percent: NO, school_last_census_status: NO, verdict: NO},
      ]

      test_cases.each do |test_case|
        input = test_case.slice(:underrepresented_minority_percent, :free_lunch_percent, :school_last_census_status)
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

    test 'course-specific scholarship statuses invalid for CSA application' do
      application = create :pd_teacher_application, course: 'csa'
      assert_nil application.scholarship_status

      # This application status is only valid for CSP applications
      # Asserting this application status can't be assigned to a CSA application
      application.update_scholarship_status(Pd::ScholarshipInfoConstants::YES_EIR)
      assert_nil application.scholarship_status
    end

    test 'associated models cache prefetch' do
      workshop = create :workshop
      application = create :pd_teacher_application, pd_workshop_id: workshop.id
      # Workshops, Sessions, Enrollments, Schools, School districts
      assert_queries 5 do
        TeacherApplication.prefetch_associated_models([application])
      end

      assert_queries 0 do
        assert_equal workshop, application.workshop
      end
    end

    test 'test allow_sending_principal_email?' do
      # If we are awaiting_admin_approval, we can send.
      application = create :pd_teacher_application
      application.update!(status: 'awaiting_admin_approval')
      assert application.allow_sending_principal_email?

      # If we are unreviewed, we can't send.
      application = create :pd_teacher_application
      application.update!(status: 'unreviewed')
      refute application.allow_sending_principal_email?

      # If we are pending, we can't send.
      application = create :pd_teacher_application
      application.update!(status: 'pending')
      refute application.allow_sending_principal_email?

      # If we are pending_space_availability, we can't send.
      application = create :pd_teacher_application
      application.update!(status: 'pending_space_availability')
      refute application.allow_sending_principal_email?

      # If we're accepted, we can't send.
      application = create :pd_teacher_application
      application.update!(status: 'accepted')
      refute application.allow_sending_principal_email?

      # If principal approval is not required, we can't send.
      application = create :pd_teacher_application
      application.update!(status: 'awaiting_admin_approval')
      application.update!(principal_approval_not_required: true)
      refute application.allow_sending_principal_email?

      # If we already have a principal response, we can't send.
      application = create :pd_teacher_application
      application.update!(status: 'awaiting_admin_approval')
      create :pd_principal_approval_application, teacher_application: application
      refute application.allow_sending_principal_email?

      # If we created a principal email < 5 days ago, we can't send.
      application = create :pd_teacher_application
      application.update!(status: 'awaiting_admin_approval')
      create :pd_application_email, application: application, email_type: 'admin_approval', created_at: 1.day.ago
      refute application.allow_sending_principal_email?

      # If we created a principal email >= 5 days ago, we can send.
      application = create :pd_teacher_application
      application.update!(status: 'awaiting_admin_approval')
      create :pd_application_email, application: application, email_type: 'admin_approval', created_at: 6.days.ago
      assert application.allow_sending_principal_email?
    end

    test 'test send_admin_approval_reminders_to_teachers' do
      TeacherApplication.any_instance.stubs(:deliver_email)

      # If we are any status other than awaiting_admin_approval, we cannot send
      (TeacherApplication.statuses - ['awaiting_admin_approval']).each do |status|
        application = create :pd_teacher_application
        application.update!(status: status)
        create :pd_application_email, application: application, email_type: 'admin_approval', created_at: 6.days.ago
        TeacherApplication.send_admin_approval_reminders_to_teachers
        assert_empty application.emails.where(email_type: 'admin_approval_teacher_reminder')
      end

      # If we are awaiting_admin_approval, we can send.
      application = create :pd_teacher_application
      application.update!(status: 'awaiting_admin_approval')
      create :pd_application_email, application: application, email_type: 'admin_approval', created_at: 6.days.ago
      TeacherApplication.send_admin_approval_reminders_to_teachers
      assert_equal 1, application.emails.where.not(sent_at: nil).where(email_type: 'admin_approval_teacher_reminder').count

      # If we sent a teacher reminder email any time before, we cannot send.
      application = create :pd_teacher_application
      create :pd_application_email, application: application, email_type: 'admin_approval_teacher_reminder', created_at: 14.days.ago, sent_at: 14.days.ago
      create :pd_application_email, application: application, email_type: 'admin_approval', created_at: 14.days.ago, sent_at: 14.days.ago
      assert_equal 1, application.emails.where.not(sent_at: nil).where(email_type: 'admin_approval_teacher_reminder').count
      TeacherApplication.send_admin_approval_reminders_to_teachers
      assert_equal 1, application.emails.where.not(sent_at: nil).where(email_type: 'admin_approval_teacher_reminder').count

      # If principal approval is not required, we can't send.
      application = create :pd_teacher_application
      application.update!(principal_approval_not_required: true)
      create :pd_application_email, application: application, email_type: 'admin_approval', created_at: 6.days.ago
      TeacherApplication.send_admin_approval_reminders_to_teachers
      assert_empty application.emails.where(email_type: 'admin_approval_teacher_reminder')

      # If we already have a principal response, we can't send.
      application = create :pd_teacher_application
      create :pd_principal_approval_application, teacher_application: application
      create :pd_application_email, application: application, email_type: 'admin_approval', created_at: 6.days.ago
      TeacherApplication.send_admin_approval_reminders_to_teachers
      assert_empty application.emails.where(email_type: 'admin_approval_teacher_reminder')

      # If we created a principal email < 5 days ago, we can't send.
      application = create :pd_teacher_application
      application.update!(status: 'awaiting_admin_approval')
      create :pd_application_email, application: application, email_type: 'admin_approval', created_at: 1.day.ago
      TeacherApplication.send_admin_approval_reminders_to_teachers
      assert_empty application.emails.where(email_type: 'admin_approval_teacher_reminder')

      # If we created a principal email >= 5 days ago, we can send.
      application = create :pd_teacher_application
      application.update!(status: 'awaiting_admin_approval')
      create :pd_application_email, application: application, email_type: 'admin_approval', created_at: 6.days.ago
      TeacherApplication.send_admin_approval_reminders_to_teachers
      assert_equal 1, application.emails.where.not(sent_at: nil).where(email_type: 'admin_approval_teacher_reminder').count
    end

    private def assert_status_log(expected, application)
      assert_equal JSON.parse(expected.to_json), application.status_log
    end
  end
end
