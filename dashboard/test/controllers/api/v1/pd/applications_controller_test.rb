require 'test_helper'

module Api::V1::Pd
  class ApplicationsControllerTest < ::ActionController::TestCase
    include Pd::Application::ActiveApplicationModels

    freeze_time

    setup_all do
      csf_facilitator_application_hash = build FACILITATOR_APPLICATION_HASH_FACTORY,
        program: Pd::Application::Facilitator1819Application::PROGRAMS[:csf]

      @csf_facilitator_application_no_partner = create FACILITATOR_APPLICATION_FACTORY,
        form_data_hash: csf_facilitator_application_hash

      @workshop_admin = create :workshop_admin
      @workshop_organizer = create :workshop_organizer
      @program_manager = create :teacher
      @regional_partner = create :regional_partner,
        program_managers: [@workshop_organizer, @program_manager],
        cohort_capacity_csd: 25,
        cohort_capacity_csp: 50
      @csf_facilitator_application_with_partner = create FACILITATOR_APPLICATION_FACTORY,
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

      @csd_teacher_application = create TEACHER_APPLICATION_FACTORY, course: 'csd'
      @csd_teacher_application_with_partner = create TEACHER_APPLICATION_FACTORY, course: 'csd', regional_partner: @regional_partner
      @csp_teacher_application = create TEACHER_APPLICATION_FACTORY, course: 'csp'
      @csp_facilitator_application = create FACILITATOR_APPLICATION_FACTORY, course: 'csp'

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

      @markdown = Redcarpet::Markdown.new(Redcarpet::Render::StripDown)
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
      create FACILITATOR_APPLICATION_FACTORY, course: 'csf'
      create FACILITATOR_APPLICATION_FACTORY, course: 'csp'
      user = create :workshop_admin
      sign_in user

      get :quick_view, params: @test_quick_view_params
      assert_response :success
      assert_equal FACILITATOR_APPLICATION_CLASS.csf.count, JSON.parse(@response.body).length
    end

    test "quick view returns applications with appropriate regional partner filter" do
      sign_in @workshop_admin
      get :quick_view, params: {role: 'csd_teachers', regional_partner_value: @regional_partner.id}
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
      get :quick_view, params: {role: 'csd_teachers', regional_partner_value: 'none'}
      assert_response :success
      assert_equal [@csd_teacher_application.id], JSON.parse(@response.body).map {|r| r['id']}
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test "index shows multiple locked applications for workshop organizer" do
      program_manager = create :workshop_organizer
      regional_partner = create :regional_partner, program_managers: [program_manager]
      sign_in program_manager

      create_list FACILITATOR_APPLICATION_FACTORY, 3, :locked, regional_partner: regional_partner
      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 3, data['csp_facilitators']['accepted']['locked']
    end

    test "index shows multiple locked applications" do
      program_manager = create :teacher
      regional_partner = create :regional_partner, program_managers: [program_manager]
      sign_in program_manager

      create_list FACILITATOR_APPLICATION_FACTORY, 3, :locked, regional_partner: regional_partner
      get :index
      assert_response :success
      data = JSON.parse(response.body)

      assert_equal 3, data['csp_facilitators']['accepted']['locked']
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test "index with applications of different statuses correctly shows locked applications for workshop organizer" do
      program_manager = create :workshop_organizer
      regional_partner = create :regional_partner, program_managers: [program_manager]
      sign_in program_manager

      create_list FACILITATOR_APPLICATION_FACTORY, 3, :locked, regional_partner: regional_partner
      create_list FACILITATOR_APPLICATION_FACTORY, 2, regional_partner: regional_partner

      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 3, data['csp_facilitators']['accepted']['locked']
      assert_equal 0, data['csp_facilitators']['unreviewed']['locked']
      assert_equal 2, data['csp_facilitators']['unreviewed']['total']
    end

    test "index with applications of different statuses correctly shows locked applications" do
      program_manager = create :teacher
      regional_partner = create :regional_partner, program_managers: [program_manager]
      sign_in program_manager

      create_list FACILITATOR_APPLICATION_FACTORY, 3, :locked, regional_partner: regional_partner
      create_list FACILITATOR_APPLICATION_FACTORY, 2, regional_partner: regional_partner

      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 3, data['csp_facilitators']['accepted']['locked']
      assert_equal 3, data['csp_facilitators']['accepted']['total']
      assert_equal 0, data['csp_facilitators']['unreviewed']['locked']
      assert_equal 2, data['csp_facilitators']['unreviewed']['total']
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'regional partners can only see their applications in index as workshop organizers' do
      sign_in @workshop_organizer
      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 1, data['csf_facilitators']['unreviewed']['total']
    end

    test 'regional partners can only see their applications in index' do
      sign_in @program_manager
      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 1, data['csf_facilitators']['unreviewed']['total']
    end

    test 'workshop admins can only see their applications in index' do
      sign_in @workshop_admin
      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 2, data['csf_facilitators']['unreviewed']['total']
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
      application = create TEACHER_APPLICATION_FACTORY
      put :update, params: {id: application.id, application: {response_scores: {regionalPartnerName: 'Yes'}.to_json}}

      assert_response :success
      application.reload
      assert_equal({regional_partner_name: 'Yes'}, application.response_scores_hash)
    end

    test 'update appends to the status changed log if status is changed' do
      sign_in @program_manager

      assert_equal [], @csd_teacher_application_with_partner.sanitize_status_timestamp_change_log

      post :update, params: {id: @csd_teacher_application_with_partner.id, application: {status: 'pending'}}
      @csd_teacher_application_with_partner.reload

      assert_equal [
        {
          title: 'pending',
          changing_user_id: @program_manager.id,
          changing_user_name: @program_manager.name,
          time: Time.zone.now
        }
      ], @csd_teacher_application_with_partner.sanitize_status_timestamp_change_log
    end

    test 'update does not append to the status changed log if status is unchanged' do
      sign_in @program_manager
      @csd_teacher_application_with_partner.update(status_timestamp_change_log: '[]')
      @csd_teacher_application_with_partner.reload

      assert_equal [], @csd_teacher_application_with_partner.sanitize_status_timestamp_change_log

      post :update, params: {id: @csd_teacher_application_with_partner.id, application: {status: @csd_teacher_application_with_partner.status}}
      @csd_teacher_application_with_partner.reload

      assert_equal [], @csd_teacher_application_with_partner.sanitize_status_timestamp_change_log
    end

    test 'workshop admins can lock and unlock applications' do
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

    test 'workshop admins can update scholarship status' do
      scholarship_status = 'no'
      sign_in @workshop_admin
      put :update, params: {id: @csp_teacher_application.id, application: {scholarship_status: 'no'}}
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal scholarship_status, data['scholarship_status']

      # Make sure scholarship status is retained
      assert_equal scholarship_status, @csp_teacher_application.reload.scholarship_status
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

      [:csp_which_grades, :csp_how_offer].each do |key|
        column = TEACHER_APPLICATION_CLASS.csv_filtered_labels('csp')[:teacher][key]
        refute response_csv.first.include?(column)
      end

      column = TEACHER_APPLICATION_CLASS.csv_filtered_labels('csd')[:teacher][:csd_which_grades]
      assert response_csv.first.include?(column)
    end

    test 'csv download for csp teacher returns expected columns' do
      sign_in @workshop_admin

      get :quick_view, format: 'csv', params: {role: 'csp_teachers'}
      assert_response :success
      response_csv = CSV.parse @response.body

      [:csp_which_grades, :csp_how_offer].each do |key|
        column = TEACHER_APPLICATION_CLASS.csv_filtered_labels('csp')[:teacher][key]
        assert response_csv.first.include?(column)
      end

      column = TEACHER_APPLICATION_CLASS.csv_filtered_labels('csd')[:teacher][:csd_which_grades]
      refute response_csv.first.include?(column)
    end

    test 'csv download for csf facilitator returns expected columns' do
      sign_in @workshop_admin

      get :quick_view, format: 'csv', params: {role: 'csf_facilitators'}
      assert_response :success
      response_csv = CSV.parse @response.body

      assert Pd::Facilitator1920ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csf_availability
      ).values.all? {|x| response_csv.first.include?(x)}

      assert Pd::Facilitator1920ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csd_csp_teachercon_availability, :csd_csp_fit_availability
      ).values.any? {|x| response_csv.first.exclude?(x)}
    end

    test 'csv download for csp facilitator returns expected columns' do
      sign_in @workshop_admin

      get :quick_view, format: 'csv', params: {role: 'csp_facilitators'}
      assert_response :success
      response_csv = CSV.parse @response.body

      assert Pd::Facilitator1920ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csd_csp_teachercon_availability, :csd_csp_fit_availability
      ).values.all? {|x| response_csv.first.include?(x)}

      assert Pd::Facilitator1920ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csf_availability
      ).values.any? {|x| response_csv.first.exclude?(x)}
    end

    test 'cohort view returns applications that are accepted and withdrawn' do
      expected_applications = []
      (Pd::Application::ApplicationBase.statuses - ['interview']).each do |status|
        application = create TEACHER_APPLICATION_FACTORY, course: 'csp'
        application.update_column(:status, status)
        if ['accepted', 'withdrawn'].include? status
          expected_applications << application
        end
      end

      sign_in @workshop_admin
      get :cohort_view, params: {role: 'csp_teachers', regional_partner_value: 'none'}
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
        workshop = create :pd_workshop, :local_summer_workshop, num_sessions: 3, sessions_from: Date.new(2017, 1, 1), processed_location: {city: 'Orchard Park', state: 'NY'}.to_json
        create :pd_enrollment, workshop: workshop, user: @serializing_teacher

        application = create(
          TEACHER_APPLICATION_FACTORY,
          course: 'csp',
          regional_partner: @regional_partner,
          user: @serializing_teacher,
          pd_workshop_id: workshop.id
        )

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.status = 'accepted_not_notified'
        application.save!

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
            assigned_workshop: 'January 1-3, 2017, Orchard Park NY',
            registered_workshop: 'Yes',
            status: 'accepted_not_notified',
            notes: nil,
            notes_2: nil,
            notes_3: nil,
            notes_4: nil,
            notes_5: nil,
            friendly_scholarship_status: nil
          }.stringify_keys, JSON.parse(@response.body).first
        )
      end
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'cohort view as a workshop organizer returns expected columns for a teacher without a workshop' do
      time = Date.new(2017, 3, 15)

      Timecop.freeze(time) do
        application = create(
          TEACHER_APPLICATION_FACTORY,
          course: 'csp',
          regional_partner: @regional_partner,
          user: @serializing_teacher,
        )

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.status = 'accepted_not_notified'
        application.save!

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
            assigned_workshop: nil,
            registered_workshop: nil,
            status: 'accepted_not_notified',
            notes: nil,
            notes_2: nil,
            notes_3: nil,
            notes_4: nil,
            notes_5: nil,
            friendly_scholarship_status: nil
          }.stringify_keys, JSON.parse(@response.body).first
        )
      end
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'cohort view as a workshop organizer returns expected columns for a facilitator' do
      time = Date.new(2017, 3, 15)

      Timecop.freeze(time) do
        application = create(
          FACILITATOR_APPLICATION_FACTORY,
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
            assigned_workshop: nil,
            registered_workshop: nil,
            status: 'accepted',
            notes: nil,
            notes_2: nil,
            notes_3: nil,
            notes_4: nil,
            notes_5: nil,
            assigned_fit: nil,
            registered_fit: 'No',
            locked: true
          }.stringify_keys, JSON.parse(@response.body).first
        )
      end
    end

    test 'cohort view returns expected columns for a teacher' do
      time = Date.new(2017, 3, 15)

      Timecop.freeze(time) do
        workshop = create :pd_workshop, :local_summer_workshop, num_sessions: 3, sessions_from: Date.new(2017, 1, 1), processed_location: {city: 'Orchard Park', state: 'NY'}.to_json
        create :pd_enrollment, workshop: workshop, user: @serializing_teacher

        application = create(
          TEACHER_APPLICATION_FACTORY,
          course: 'csp',
          regional_partner: @regional_partner,
          user: @serializing_teacher,
          pd_workshop_id: workshop.id,
          scholarship_status: 'no'
        )

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.status = 'accepted_not_notified'
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
            status: 'accepted_not_notified',
            notes: nil,
            notes_2: nil,
            notes_3: nil,
            notes_4: nil,
            notes_5: nil,
            friendly_scholarship_status: 'No'
          }.stringify_keys, JSON.parse(@response.body).first
        )
      end
    end

    test 'cohort view returns expected columns for a teacher without a workshop' do
      time = Date.new(2017, 3, 15)

      Timecop.freeze(time) do
        application = create(
          TEACHER_APPLICATION_FACTORY,
          course: 'csp',
          regional_partner: @regional_partner,
          user: @serializing_teacher,
        )

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.status = 'accepted_not_notified'
        application.save!

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
            registered_workshop: nil,
            status: 'accepted_not_notified',
            notes: nil,
            notes_2: nil,
            notes_3: nil,
            notes_4: nil,
            notes_5: nil,
            friendly_scholarship_status: nil
          }.stringify_keys, JSON.parse(@response.body).first
        )
      end
    end

    test 'cohort view returns expected columns for a facilitator' do
      time = Date.new(2017, 3, 15)

      Timecop.freeze(time) do
        application = create(
          FACILITATOR_APPLICATION_FACTORY,
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
            registered_workshop: nil,
            assigned_fit: nil,
            registered_fit: 'No',
            status: 'accepted',
            notes: nil,
            notes_2: nil,
            notes_3: nil,
            notes_4: nil,
            notes_5: nil,
            locked: true
          }.stringify_keys, JSON.parse(@response.body).first
        )
      end
    end

    test 'cohort csv download returns expected columns for teachers' do
      application = create TEACHER_APPLICATION_FACTORY, course: 'csp'
      create :pd_principal_approval1920_application, teacher_application: application
      application.update(status: 'accepted_not_notified')
      sign_in @workshop_admin
      get :cohort_view, format: 'csv', params: {role: 'csp_teachers'}
      assert_response :success
      response_csv = CSV.parse @response.body

      expected_headers = [
        "Date Applied",
        "Date Accepted",
        "Status",
        "Meets minimum requirements?",
        "Meets scholarship requirements?",
        "Scholarship teacher?",
        "Bonus Points",
        "Notes",
        "Notes 2",
        "Notes 3",
        "Notes 4",
        "Notes 5",
        "Title",
        "First name",
        "Last name",
        "Account email",
        "Alternate email",
        "School type",
        "School name",
        "School district",
        "School address",
        "School city",
        "School state",
        "School zip code",
        "Assigned Workshop",
        "Registered for workshop?",
        "Regional Partner",
        "Home or cell phone",
        "Home address",
        "City",
        "State",
        "Zip code",
        "Country",
        "Principal's first name",
        "Principal's last name",
        "Principal's email address",
        "Confirm principal's email address",
        "Principal's phone number",
        "Current role",
        "Are you completing this application on behalf of someone else?",
        "If yes, please include the full name and role of the teacher and why you are applying on behalf of this teacher.",
        "Which professional learning program would you like to join for the 2018-19 school year?",
        "To which grades does your school plan to offer CS Principles in the 2019-20 school year?",
        "How will you offer CS Principles?",
        "How many minutes will your CS Program class last?",
        "How many days per week will your CS program class be offered to one section of students?",
        "How many weeks during the year will this course be taught to one section of students?",
        "Total course hours",
        "How will you be offering this CS program course to students?",
        "Do you plan to personally teach this course in the 2019-20 school year?",
        "Will this course replace an existing computer science course in the master schedule? (Teacher's response)",
        "If yes, please describe the course it will be replacing and why:",
        "What subjects are you teaching this year (2018-19)?",
        "Does your school district require any specific licenses, certifications, or endorsements to teach computer science?",
        "What license, certification, or endorsement is required?",
        "Do you have the required licenses, certifications, or endorsements to teach computer science in your district?",
        "Which subject area(s) are you currently licensed to teach?",
        "Have you taught computer science courses or activities in the past?",
        "Have you participated in previous yearlong Code.org Professional Learning Programs?",
        "What computer science courses or activities are currently offered at your school?",
        "Are you committed to participating in the entire Professional Learning Program?",
        "Please indicate which workshops you are able to attend.",
        "If you are unable to make any of the above workshop dates, would you be open to traveling to another region for your local summer workshop?",
        "How far would you be willing to travel to academic year workshops?",
        "Are you interested in this online program for school year workshops?",
        "Will you or your school be able to pay the fee?",
        "Please provide any additional information you'd like to share about why your application should be considered for a scholarship.",
        "Teacher's gender identity",
        "Teacher's race",
        "How did you hear about this program? (Teacher's response)",
        "Principal Approval Form URL",
        "Principal's title (provided by principal)",
        "Principal's first name (provided by principal)",
        "Principal's last name (provided by principal)",
        "Principal's email address (provided by principal)",
        "School name (provided by principal)",
        "School district (provided by principal)",
        "Do you approve of this teacher participating in Code.org's 2019-20 Professional Learning Program?",
        "Is this teacher planning to teach this course in the 2019-20 school year?",
        "Total student enrollment",
        "Percentage of students who are eligible to receive free or reduced lunch (Principal's response)",
        "Percentage of underrepresented minority students (Principal's response)",
        "Percentage of student enrollment by race - White",
        "Percentage of student enrollment by race - Black or African American",
        "Percentage of student enrollment by race - Hispanic or Latino",
        "Percentage of student enrollment by race - Asian",
        "Percentage of student enrollment by race - Native Hawaiian or other Pacific Islander",
        "Percentage of student enrollment by race - American Indian or Native Alaskan",
        "Percentage of student enrollment by race - Other",
        "Are you committed to including this course on the master schedule in 2019-20 if this teacher is accepted into the program?",
        "Will this course replace an existing computer science course in the master schedule? (Principal's response)",
        "Which existing course or curriculum will CS Principles replace?",
        "How will you implement CS Principles at your school?",
        "Do you commit to recruiting and enrolling a diverse group of students in this course, representative of the overall demographics of your school?",
        "If there is a fee for the program, will your teacher or your school be able to pay for the fee?",
        "How did you hear about this program? (Principal's response)",
        "Principal authorizes college board to send AP Scores",
        "Title I status code (NCES data)",
        "Total student enrollment (NCES data)",
        "Percentage of students who are eligible to receive free or reduced lunch (NCES data)",
        "Percentage of underrepresented minority students (NCES data)",
        "Percentage of student enrollment by race - White (NCES data)",
        "Percentage of student enrollment by race - Black or African American (NCES data)",
        "Percentage of student enrollment by race - Hispanic or Latino (NCES data)",
        "Percentage of student enrollment by race - Asian (NCES data)",
        "Percentage of student enrollment by race - Native Hawaiian or other Pacific Islander (NCES data)",
        "Percentage of student enrollment by race - American Indian or Native Alaskan (NCES data)",
        "Percentage of student enrollment by race - Two or more races (NCES data)"
      ]
      assert_equal expected_headers, response_csv.first
      assert_equal expected_headers.length, response_csv.second.length
    end

    test 'cohort csv download returns expected columns for facilitators' do
      create FACILITATOR_APPLICATION_FACTORY, :locked, course: 'csf'
      sign_in @workshop_admin
      get :cohort_view, format: 'csv', params: {role: 'csf_facilitators'}
      assert_response :success
      response_csv = CSV.parse @response.body

      expected_headers = [
        'Date Accepted',
        'Name',
        'School District',
        'School Name',
        'Email',
        'Status',
        'Assigned Workshop',
        'Notes',
        'Notes 2',
        'Notes 3',
        'Notes 4',
        'Notes 5'
      ]
      assert_equal expected_headers, response_csv.first
      assert_equal expected_headers.length, response_csv.second.length
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

    test 'destroy deletes application' do
      sign_in @workshop_admin
      application = create TEACHER_APPLICATION_FACTORY
      assert_destroys(TEACHER_APPLICATION_CLASS) do
        delete :destroy, params: {id: application.id}
      end
    end

    test 'group 3 partner cannot call delete api' do
      application = create TEACHER_APPLICATION_FACTORY
      group_3_partner = create :regional_partner, group: 3
      group_3_program_manager = create :teacher
      create :regional_partner_program_manager, regional_partner: group_3_partner, program_manager: group_3_program_manager

      sign_in group_3_program_manager
      assert_does_not_destroy(TEACHER_APPLICATION_CLASS) do
        delete :destroy, params: {id: application.id}
      end
    end
  end
end
