require 'test_helper'

module Api::V1::Pd
  class ApplicationsControllerTest < ::ActionController::TestCase
    include Teacher1819ApplicationConstants
    include Facilitator1819ApplicationConstants

    setup_all do
      csf_facilitator_application_hash = build :pd_facilitator1819_application_hash,
        program: Pd::Application::Facilitator1819Application::PROGRAMS[:csf]

      @csf_facilitator_application_no_partner = create :pd_facilitator1819_application,
        form_data_hash: csf_facilitator_application_hash

      @workshop_admin = create :workshop_admin
      @workshop_organizer = create :workshop_organizer
      @program_manager = create :teacher
      @regional_partner = create :regional_partner,
        program_managers: [@workshop_organizer, @program_manager],
        cohort_capacity_csd: 25,
        cohort_capacity_csp: 50
      @csf_facilitator_application_with_partner = create :pd_facilitator1819_application,
        regional_partner: @regional_partner, form_data_hash: csf_facilitator_application_hash

      @test_show_params = {
        id: @csf_facilitator_application_with_partner.id
      }
      @test_update_params = {
        application: {
          notes: 'Notes!'
        },
        id: @csf_facilitator_application_with_partner.id
      }
      @test_quick_view_params = {
        role: 'csf_facilitators'
      }

      @csd_teacher_application = create :pd_teacher1819_application, course: 'csd'
      @csd_teacher_application_with_partner = create :pd_teacher1819_application, course: 'csd', regional_partner: @regional_partner
      @csp_teacher_application = create :pd_teacher1819_application, course: 'csp'
      @csp_facilitator_application = create :pd_facilitator1819_application, course: 'csp'

      @serializing_teacher = create(:teacher,
        email: 'minerva@hogwarts.edu',
        school_info: create(
          :school_info,
          school: create(
            :school,
            name: 'Hogwarts'
          )
        )
      )
    end

    test_redirect_to_sign_in_for :index
    test_redirect_to_sign_in_for :show, params: -> {@test_show_params}
    test_redirect_to_sign_in_for :update, params: -> {@test_update_params}
    test_redirect_to_sign_in_for :quick_view, params: -> {@test_quick_view_params}

    # Basic auth for read methods, workshop_organizer and program_manager are tested explicitly below
    {
      student: :forbidden,
      teacher: :forbidden,
      facilitator: :forbidden,
      workshop_admin: :success
    }.each do |user, response|
      test_user_gets_response_for :index, user: user, response: response
      test_user_gets_response_for :show, params: -> {@test_show_params}, user: user, response: response
      test_user_gets_response_for :quick_view, params: -> {@test_quick_view_params}, user: user, response: response
    end

    # Basic auth for write methods
    {
      student: :forbidden,
      teacher: :forbidden,
      facilitator: :forbidden,
      workshop_organizer: :forbidden,
      program_manager: :forbidden,
      workshop_admin: :success
    }.each do |user, response|
      test_user_gets_response_for :update, params: -> {@test_update_params}, user: user, response: response
    end

    test "quick view returns appropriate application type" do
      create :pd_facilitator1819_application, course: 'csf'
      create :pd_facilitator1819_application, course: 'csp'
      user = create :workshop_admin
      sign_in user

      get :quick_view, params: @test_quick_view_params
      assert_response :success
      assert_equal Pd::Application::Facilitator1819Application.csf.count, JSON.parse(@response.body).length
    end

    test "quick view returns applications with appropriate regional partner filter" do
      sign_in @workshop_admin
      get :quick_view, params: {role: 'csd_teachers', regional_partner_filter: @regional_partner.id}
      assert_response :success
      assert_equal [@csd_teacher_application_with_partner.id], JSON.parse(@response.body).map {|r| r['id']}
    end

    test "quick view returns applications with regional partner filter unset" do
      sign_in @workshop_admin
      get :quick_view, params: {role: 'csd_teachers'}
      assert_response :success
      assert_equal [@csd_teacher_application.id, @csd_teacher_application_with_partner.id], JSON.parse(@response.body).map {|r| r['id']}
    end

    test "quick view returns applications with regional partner filter set to no partner" do
      sign_in @workshop_admin
      get :quick_view, params: {role: 'csd_teachers', regional_partner_filter: 'none'}
      assert_response :success
      assert_equal [@csd_teacher_application.id], JSON.parse(@response.body).map {|r| r['id']}
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test "index shows multiple locked applications for workshop organizer" do
      program_manager = create :workshop_organizer
      regional_partner = create :regional_partner, program_managers: [program_manager]
      sign_in program_manager

      create_list :pd_teacher1819_application, 3, :locked, regional_partner: regional_partner
      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 3, data['csp_teachers']['accepted']['locked']
    end

    test "index shows multiple locked applications" do
      program_manager = create :teacher
      regional_partner = create :regional_partner, program_managers: [program_manager]
      sign_in program_manager

      create_list :pd_teacher1819_application, 3, :locked, regional_partner: regional_partner
      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 3, data['csp_teachers']['accepted']['locked']
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test "index with applications of different statuses correctly shows locked applications for workshop organizer" do
      program_manager = create :workshop_organizer
      regional_partner = create :regional_partner, program_managers: [program_manager]
      sign_in program_manager

      create_list :pd_teacher1819_application, 3, :locked, regional_partner: regional_partner
      create_list :pd_teacher1819_application, 2, regional_partner: regional_partner

      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 3, data['csp_teachers']['accepted']['locked']
      assert_equal 2, data['csp_teachers']['unreviewed']['unlocked']
    end

    test "index with applications of different statuses correctly shows locked applications" do
      program_manager = create :teacher
      regional_partner = create :regional_partner, program_managers: [program_manager]
      sign_in program_manager

      create_list :pd_teacher1819_application, 3, :locked, regional_partner: regional_partner
      create_list :pd_teacher1819_application, 2, regional_partner: regional_partner

      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 3, data['csp_teachers']['accepted']['locked']
      assert_equal 2, data['csp_teachers']['unreviewed']['unlocked']
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'regional partners can only see their applications in index as workshop organizers' do
      sign_in @workshop_organizer
      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 1, data['csf_facilitators']['unreviewed']['unlocked']
    end

    test 'regional partners can only see their applications in index' do
      sign_in @program_manager
      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 1, data['csf_facilitators']['unreviewed']['unlocked']
    end

    test 'workshop admins can only see their applications in index' do
      sign_in @workshop_admin
      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 2, data['csf_facilitators']['unreviewed']['unlocked']
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'regional partners can show their applications as workshop organizers' do
      sign_in @workshop_organizer
      get :show, params: @test_show_params
      assert_response :success
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'regional partners cannot show other applications as workshop organizers' do
      sign_in @workshop_organizer
      get :show, params: {id: @csf_facilitator_application_no_partner}
      assert_response :forbidden
    end

    test 'regional partners can show their applications' do
      sign_in @program_manager
      get :show, params: @test_show_params
      assert_response :success
    end

    test 'regional partners cannot show other applications' do
      sign_in @program_manager
      get :show, params: {id: @csf_facilitator_application_no_partner}
      assert_response :forbidden
    end

    test 'workshop admins can show any application' do
      sign_in @workshop_admin
      get :show, params: {id: @csf_facilitator_application_no_partner}
      assert_response :success
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'regional partners can see only their applications in quick_view as workshop organizers' do
      sign_in @workshop_organizer
      get :quick_view, params: @test_quick_view_params
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 1, data.length
      assert_equal @csf_facilitator_application_with_partner.id, data[0]['id']
    end

    test 'regional partners can see only their applications in quick_view' do
      sign_in @program_manager
      get :quick_view, params: @test_quick_view_params
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 1, data.length
      assert_equal @csf_facilitator_application_with_partner.id, data[0]['id']
    end

    test 'workshop admins see all applications in quick view' do
      sign_in @workshop_admin
      get :quick_view, params: @test_quick_view_params
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 2, data.length
      expected_ids = [@csf_facilitator_application_no_partner, @csf_facilitator_application_with_partner].map(&:id).sort
      assert_equal expected_ids, data.map {|a| a['id']}.sort
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'regional partners can edit their applications as workshop organizers' do
      sign_in @workshop_organizer
      put :update, params: {id: @csf_facilitator_application_with_partner, application: {status: 'accepted', notes: 'Notes'}}
      assert_response :success
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'regional partners cannot edit other applications as workshop organizers' do
      sign_in @workshop_organizer
      put :update, params: {id: @csf_facilitator_application_no_partner, application: {status: 'accepted', notes: 'Notes'}}
      assert_response :forbidden
    end

    test 'regional partners can edit their applications' do
      sign_in @program_manager
      put :update, params: {id: @csf_facilitator_application_with_partner, application: {status: 'accepted', notes: 'Notes'}}
      assert_response :success
    end

    test 'regional partners cannot edit other applications' do
      sign_in @program_manager
      put :update, params: {id: @csf_facilitator_application_no_partner, application: {status: 'accepted', notes: 'Notes'}}
      assert_response :forbidden
    end

    test 'editing scores converts fields to underscore case' do
      sign_in @workshop_admin
      application = create :pd_teacher1819_application
      put :update, params: {id: application.id, application: {response_scores: {regionalPartnerName: 'Yes'}.to_json}}

      assert_response :success
      application.reload
      assert_equal({regional_partner_name: 'Yes'}, application.response_scores_hash)
    end

    test 'workshop admins can and unlock applications' do
      sign_in @workshop_admin
      put :update, params: {id: @csf_facilitator_application_no_partner, application: {status: 'accepted', locked: 'true'}}
      assert_response :success
      data = JSON.parse(response.body)
      assert data['locked']
    end

    test 'workshop admins can update form_data' do
      sign_in @workshop_admin
      updated_form_data = @csf_facilitator_application_with_partner.form_data_hash.merge('alternateEmail' => 'my.other@email.net')
      put :update, params: {id: @csf_facilitator_application_with_partner.id, application: {form_data: updated_form_data}}
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 'my.other@email.net', data['form_data']['alternateEmail']

      # Make sure partner is retained
      assert_equal @regional_partner, @csf_facilitator_application_with_partner.reload.regional_partner
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'Regional partners cannot lock and unlock applications as workshop organizers' do
      sign_in @workshop_organizer
      put :update, params: {id: @csf_facilitator_application_with_partner.id, application: {status: 'accepted', locked: 'true'}}
      assert_response :success
      data = JSON.parse(response.body)
      refute data['locked']
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'Regional partners cannot update form_data as workshop organizers' do
      sign_in @workshop_organizer
      updated_form_data = @csf_facilitator_application_with_partner.form_data_hash.merge('alternateEmail' => 'my.other@email.net')
      put :update, params: {id: @csf_facilitator_application_with_partner.id, application: {form_data: updated_form_data}}
      assert_response :success
      data = JSON.parse(response.body)
      refute_equal 'my.other@email.net', data['form_data']['alternateEmail']
    end

    test 'Regional partners cannot lock and unlock applications' do
      sign_in @program_manager
      put :update, params: {id: @csf_facilitator_application_with_partner.id, application: {status: 'accepted', locked: 'true'}}
      assert_response :success
      data = JSON.parse(response.body)
      refute data['locked']
    end

    test 'Regional partners cannot update form_data' do
      sign_in @program_manager
      updated_form_data = @csf_facilitator_application_with_partner.form_data_hash.merge('alternateEmail' => 'my.other@email.net')
      put :update, params: {id: @csf_facilitator_application_with_partner.id, application: {form_data: updated_form_data}}
      assert_response :success
      data = JSON.parse(response.body)
      refute_equal 'my.other@email.net', data['form_data']['alternateEmail']
    end

    test 'notes field will strip pandas' do
      sign_in @program_manager
      put :update, params: {id: @csf_facilitator_application_with_partner.id, application: {notes: panda_panda}}
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal data['notes'], "Panda"
    end

    test 'csv download for csd teacher returns expected columns' do
      sign_in @workshop_admin

      get :quick_view, format: 'csv', params: {role: 'csd_teachers'}
      assert_response :success
      response_csv = CSV.parse @response.body

      assert Teacher1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csd_which_grades, :csd_course_hours_per_week, :csd_course_hours_per_year, :csd_terms_per_year
      ).values.all? {|x| response_csv.first.include?(x)}

      assert Teacher1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csp_which_grades, :csp_course_hours_per_week, :csp_course_hours_per_year, :csp_how_offer, :csp_ap_exam
      ).values.any? {|x| response_csv.first.exclude?(x)}
    end

    test 'csv download for csp teacher returns expected columns' do
      sign_in @workshop_admin

      get :quick_view, format: 'csv', params: {role: 'csp_teachers'}
      assert_response :success
      response_csv = CSV.parse @response.body

      assert Teacher1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csp_which_grades, :csp_course_hours_per_week, :csp_course_hours_per_year, :csp_terms_per_year, :csp_how_offer, :csp_ap_exam
      ).values.all? {|x| response_csv.first.include?(x)}

      assert Teacher1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csd_which_grades, :csd_course_hours_per_week, :csd_course_hours_per_year
      ).values.any? {|x| response_csv.first.exclude?(x)}
    end

    test 'csv download for csf facilitator returns expected columns' do
      sign_in @workshop_admin

      get :quick_view, format: 'csv', params: {role: 'csf_facilitators'}
      assert_response :success
      response_csv = CSV.parse @response.body

      assert Facilitator1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csf_availability
      ).values.all? {|x| response_csv.first.include?(x)}

      assert Facilitator1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csd_csp_teachercon_availability, :csd_csp_fit_availability
      ).values.any? {|x| response_csv.first.exclude?(x)}
    end

    test 'csv download for csp facilitator returns expected columns' do
      sign_in @workshop_admin

      get :quick_view, format: 'csv', params: {role: 'csp_facilitators'}
      assert_response :success
      response_csv = CSV.parse @response.body

      assert Facilitator1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csd_csp_teachercon_availability, :csd_csp_fit_availability
      ).values.all? {|x| response_csv.first.include?(x)}

      assert Facilitator1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csf_availability
      ).values.any? {|x| response_csv.first.exclude?(x)}
    end

    test 'cohort view returns applications that are accepted and withdrawn' do
      expected_applications = []
      (Pd::Application::ApplicationBase.statuses.values - ['interview']).each do |status|
        application = create :pd_teacher1819_application, course: 'csp'
        application.update_column(:status, status)
        if ['accepted', 'withdrawn'].include? status
          expected_applications << application
        end
      end

      sign_in @workshop_admin
      get :cohort_view, params: {role: 'csp_teachers', regional_partner_filter: 'none'}
      assert_response :success

      assert_equal(
        expected_applications.map {|application| application[:id]}.sort,
        JSON.parse(@response.body).map {|application| application['id']}.sort
      )
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'cohort view as a workshop organizer returns expected columns for a teacher' do
      time = Date.new(2017, 3, 15)

      Timecop.freeze(time) do
        workshop = create :pd_workshop, num_sessions: 3, sessions_from: Date.new(2017, 1, 1), processed_location: {city: 'Orchard Park', state: 'NY'}.to_json
        create :pd_enrollment, workshop: workshop, user: @serializing_teacher

        application = create(
          :pd_teacher1819_application,
          course: 'csp',
          regional_partner: @regional_partner,
          user: @serializing_teacher,
          pd_workshop_id: workshop.id
        )

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.status = 'accepted'
        application.save!
        application.lock!

        sign_in @workshop_organizer
        get :cohort_view, params: {role: 'csp_teachers'}
        assert_response :success

        assert_equal(
          {
            id: application.id,
            date_accepted: '2017-03-15',
            applicant_name: 'Minerva McGonagall',
            district_name: 'A School District',
            school_name: 'A Seattle Public School',
            email: 'minerva@hogwarts.edu',
            status: 'accepted',
            assigned_workshop: 'January 1-3, 2017, Orchard Park NY',
            registered_workshop: 'Yes'
          }.stringify_keys, JSON.parse(@response.body).first
        )
      end
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'cohort view as a workshop organizer returns expected columns for a teacher without a workshop' do
      time = Date.new(2017, 3, 15)

      Timecop.freeze(time) do
        application = create(
          :pd_teacher1819_application,
          course: 'csp',
          regional_partner: @regional_partner,
          user: @serializing_teacher,
        )

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.status = 'accepted'
        application.save!
        application.lock!

        sign_in @workshop_organizer
        get :cohort_view, params: {role: 'csp_teachers'}
        assert_response :success

        assert_equal(
          {
            id: application.id,
            date_accepted: '2017-03-15',
            applicant_name: 'Minerva McGonagall',
            district_name: 'A School District',
            school_name: 'A Seattle Public School',
            email: 'minerva@hogwarts.edu',
            status: 'accepted',
            assigned_workshop: nil,
            registered_workshop: 'No'
          }.stringify_keys, JSON.parse(@response.body).first
        )
      end
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'cohort view as a workshop organizer returns expected columns for a facilitator' do
      time = Date.new(2017, 3, 15)

      Timecop.freeze(time) do
        application = create(
          :pd_facilitator1819_application,
          course: 'csp',
          regional_partner: @regional_partner,
          user: @serializing_teacher
        )

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.status = 'accepted'
        application.save!
        application.lock!

        sign_in @workshop_organizer
        get :cohort_view, params: {role: 'csp_facilitators'}
        assert_response :success

        assert_equal(
          {
            id: application.id,
            date_accepted: '2017-03-15',
            applicant_name: 'Minerva McGonagall',
            district_name: 'A School District',
            school_name: 'Hogwarts',
            email: 'minerva@hogwarts.edu',
            status: 'accepted',
            locked: true,
            assigned_workshop: nil,
            registered_workshop: 'No',
            assigned_fit: nil,
            registered_fit: 'No'
          }.stringify_keys, JSON.parse(@response.body).first
        )
      end
    end

    test 'cohort view returns expected columns for a teacher' do
      time = Date.new(2017, 3, 15)

      Timecop.freeze(time) do
        workshop = create :pd_workshop, num_sessions: 3, sessions_from: Date.new(2017, 1, 1), processed_location: {city: 'Orchard Park', state: 'NY'}.to_json
        create :pd_enrollment, workshop: workshop, user: @serializing_teacher

        application = create(
          :pd_teacher1819_application,
          course: 'csp',
          regional_partner: @regional_partner,
          user: @serializing_teacher,
          pd_workshop_id: workshop.id
        )

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.status = 'accepted'
        application.save!
        application.lock!

        sign_in @program_manager
        get :cohort_view, params: {role: 'csp_teachers'}
        assert_response :success

        assert_equal(
          {
            id: application.id,
            date_accepted: '2017-03-15',
            applicant_name: 'Minerva McGonagall',
            district_name: 'A School District',
            school_name: 'A Seattle Public School',
            email: 'minerva@hogwarts.edu',
            assigned_workshop: 'January 1-3, 2017, Orchard Park NY',
            registered_workshop: 'Yes',
            status: 'accepted'
          }.stringify_keys, JSON.parse(@response.body).first
        )
      end
    end

    test 'cohort view returns expected columns for a teacher without a workshop' do
      time = Date.new(2017, 3, 15)

      Timecop.freeze(time) do
        application = create(
          :pd_teacher1819_application,
          course: 'csp',
          regional_partner: @regional_partner,
          user: @serializing_teacher,
        )

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.status = 'accepted'
        application.save!
        application.lock!

        sign_in @program_manager
        get :cohort_view, params: {role: 'csp_teachers'}
        assert_response :success

        assert_equal(
          {
            id: application.id,
            date_accepted: '2017-03-15',
            applicant_name: 'Minerva McGonagall',
            district_name: 'A School District',
            school_name: 'A Seattle Public School',
            email: 'minerva@hogwarts.edu',
            assigned_workshop: nil,
            registered_workshop: 'No',
            status: 'accepted'
          }.stringify_keys, JSON.parse(@response.body).first
        )
      end
    end

    test 'cohort view returns expected columns for a facilitator' do
      time = Date.new(2017, 3, 15)

      Timecop.freeze(time) do
        application = create(
          :pd_facilitator1819_application,
          course: 'csp',
          regional_partner: @regional_partner,
          user: @serializing_teacher
        )

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.status = 'accepted'
        application.save!
        application.lock!

        sign_in @program_manager
        get :cohort_view, params: {role: 'csp_facilitators'}
        assert_response :success

        assert_equal(
          {
            id: application.id,
            date_accepted: '2017-03-15',
            applicant_name: 'Minerva McGonagall',
            district_name: 'A School District',
            school_name: 'Hogwarts',
            email: 'minerva@hogwarts.edu',
            assigned_workshop: nil,
            registered_workshop: 'No',
            assigned_fit: nil,
            registered_fit: 'No',
            status: 'accepted',
            locked: true
          }.stringify_keys, JSON.parse(@response.body).first
        )
      end
    end

    test 'cohort csv download returns expected columns for teachers' do
      sign_in @workshop_admin
      get :cohort_view, format: 'csv', params: {role: 'csd_teachers'}
      assert_response :success
      response_csv = CSV.parse @response.body

      assert_equal ['Date Accepted', 'Applicant Name', 'District Name', 'School Name', 'Email', 'Assigned Workshop', 'Registered Workshop'], response_csv.first
    end

    test 'cohort csv download returns expected columns for facilitators' do
      sign_in @workshop_admin
      get :cohort_view, format: 'csv', params: {role: 'csf_facilitators'}
      assert_response :success
      response_csv = CSV.parse @response.body

      assert_equal ['Date Accepted', 'Name', 'School District', 'School Name', 'Email', 'Status'], response_csv.first
    end

    test 'search finds applications by email for workshop admins' do
      sign_in @workshop_admin
      get :search, params: {email: @csd_teacher_application.user.email}
      assert_response :success
      result = JSON.parse response.body
      expected = [{
        id: @csd_teacher_application.id,
        application_type: 'Teacher',
        course: 'csd'
      }.stringify_keys]
      assert_equal expected, result
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'search as workshop organizer finds applications by email for the relevant regional partner' do
      sign_in @workshop_organizer
      get :search, params: {email: @csd_teacher_application_with_partner.user.email}
      assert_response :success
      result = JSON.parse response.body
      expected = [{
        id: @csd_teacher_application_with_partner.id,
        application_type: 'Teacher',
        course: 'csd'
      }.stringify_keys]
      assert_equal expected, result
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'search as workshop organizer does not reveal applications outside the regional partners cohort' do
      sign_in @workshop_organizer
      get :search, params: {email: @csd_teacher_application.user.email}
      assert_response :success
      result = JSON.parse response.body
      assert_equal [], result
    end

    test 'search finds applications by email for the relevant regional partner' do
      sign_in @program_manager
      get :search, params: {email: @csd_teacher_application_with_partner.user.email}
      assert_response :success
      result = JSON.parse response.body
      expected = [{
        id: @csd_teacher_application_with_partner.id,
        application_type: 'Teacher',
        course: 'csd'
      }.stringify_keys]
      assert_equal expected, result
    end

    test 'search does not reveal applications outside the regional partners cohort' do
      sign_in @program_manager
      get :search, params: {email: @csd_teacher_application.user.email}
      assert_response :success
      result = JSON.parse response.body
      assert_equal [], result
    end
  end
end
