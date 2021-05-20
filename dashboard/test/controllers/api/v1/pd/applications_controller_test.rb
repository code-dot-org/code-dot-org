require 'test_helper'

module Api::V1::Pd
  class ApplicationsControllerTest < ::ActionController::TestCase
    include Pd::Application::ActiveApplicationModels

    self.use_transactional_test_case = true

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
      @csp_facilitator_application = create FACILITATOR_APPLICATION_FACTORY, course: 'csp', regional_partner: @regional_partner

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

    test 'update appends to the timestamp log if status is changed' do
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

    test 'update does not append to the timestamp log if status is unchanged' do
      sign_in @program_manager
      @csd_teacher_application_with_partner.update(status_timestamp_change_log: '[]')
      @csd_teacher_application_with_partner.reload

      assert_equal [], @csd_teacher_application_with_partner.sanitize_status_timestamp_change_log

      post :update, params: {id: @csd_teacher_application_with_partner.id, application: {status: @csd_teacher_application_with_partner.status}}
      @csd_teacher_application_with_partner.reload

      assert_equal [], @csd_teacher_application_with_partner.sanitize_status_timestamp_change_log
    end

    test 'update appends to the timestamp log if fit workshop is changed' do
      fit_workshop = create :fit_workshop,
        sessions_from: Date.new(2019, 6, 1),
        processed_location: {city: 'Orchard Park', state: 'NY'}.to_json

      sign_in @program_manager
      @csp_facilitator_application.update(status_timestamp_change_log: '[]')
      @csp_facilitator_application.reload

      assert_equal [], @csp_facilitator_application.sanitize_status_timestamp_change_log

      post :update, params: {id: @csp_facilitator_application.id, application: {fit_workshop_id: fit_workshop.id, status: @csp_facilitator_application.status}}
      @csp_facilitator_application.reload

      assert_equal [
        {
          title: "Fit Workshop: #{@csp_facilitator_application.fit_workshop_date_and_location}",
          changing_user_id: @program_manager.id,
          changing_user_name: @program_manager.name,
          time: Time.zone.now
        }
      ], @csp_facilitator_application.sanitize_status_timestamp_change_log
    end

    test 'update appends to the timestamp log if summer workshop is changed' do
      summer_workshop = create :summer_workshop,
        sessions_from: Date.new(2019, 6, 1),
        processed_location: {city: 'Orchard Park', state: 'NY'}.to_json

      sign_in @program_manager
      @csp_facilitator_application.update(status_timestamp_change_log: '[]')
      @csp_facilitator_application.reload

      assert_equal [], @csp_facilitator_application.sanitize_status_timestamp_change_log

      post :update, params: {id: @csp_facilitator_application.id, application: {pd_workshop_id: summer_workshop.id, status: @csp_facilitator_application.status}}
      @csp_facilitator_application.reload

      assert_equal [
        {
          title: "Summer Workshop: #{@csp_facilitator_application.workshop_date_and_location}",
          changing_user_id: @program_manager.id,
          changing_user_name: @program_manager.name,
          time: Time.zone.now
        }
      ], @csp_facilitator_application.sanitize_status_timestamp_change_log
    end

    test 'update does not append to the timestamp log if fit and summer workshop are not changed' do
      summer_workshop = create :summer_workshop,
        sessions_from: Date.new(2019, 6, 1),
        processed_location: {city: 'Orchard Park', state: 'NY'}.to_json
      fit_workshop = create :fit_workshop,
        sessions_from: Date.new(2019, 6, 1),
        processed_location: {city: 'Orchard Park', state: 'NY'}.to_json

      sign_in @program_manager
      @csp_facilitator_application.update(status_timestamp_change_log: '[]')
      @csp_facilitator_application.reload

      assert_equal [], @csp_facilitator_application.sanitize_status_timestamp_change_log

      post :update, params: {id: @csp_facilitator_application.id, application: {fit_workshop_id: fit_workshop.id, pd_workshop_id: summer_workshop.id, status: @csp_facilitator_application.status}}
      @csp_facilitator_application.reload

      expected_log = [
        {
          title: "Fit Workshop: #{@csp_facilitator_application.fit_workshop_date_and_location}",
          changing_user_id: @program_manager.id,
          changing_user_name: @program_manager.name,
          time: Time.zone.now
        }, {
          title: "Summer Workshop: #{@csp_facilitator_application.workshop_date_and_location}",
          changing_user_id: @program_manager.id,
          changing_user_name: @program_manager.name,
          time: Time.zone.now
        }
      ]

      assert_equal expected_log, @csp_facilitator_application.sanitize_status_timestamp_change_log

      post :update, params: {id: @csp_facilitator_application.id, application: {fit_workshop_id: fit_workshop.id, pd_workshop_id: summer_workshop.id, status: @csp_facilitator_application.status}}

      assert_equal expected_log, @csp_facilitator_application.sanitize_status_timestamp_change_log
    end

    test 'update appends to timestamp log if workshop admin changes application from unlocked to locked' do
      sign_in @workshop_admin
      @csp_facilitator_application.update(status_timestamp_change_log: '[]', locked_at: nil)
      @csp_facilitator_application.reload

      assert_equal [], @csp_facilitator_application.sanitize_status_timestamp_change_log
      refute @csp_facilitator_application.locked?

      # Changing application from unlocked to locked
      post :update, params: {id: @csp_facilitator_application.id, application: {status: @csp_facilitator_application.status, locked: true}}
      @csp_facilitator_application.reload

      expected_log = [
        {
          title: 'Application is locked',
          changing_user_id: @workshop_admin.id,
          changing_user_name: @workshop_admin.name,
          time: Time.zone.now
        }
      ]

      assert_equal expected_log, @csp_facilitator_application.sanitize_status_timestamp_change_log

      # Setting application to locked again
      post :update, params: {id: @csp_facilitator_application.id, application: {status: @csp_facilitator_application.status, locked: true}}
      @csp_facilitator_application.reload

      assert_equal expected_log, @csp_facilitator_application.sanitize_status_timestamp_change_log
    end

    test 'update appends to timestamp log if workshop admin changes application from locked to unlocked' do
      sign_in @workshop_admin
      @csp_facilitator_application.update(status_timestamp_change_log: '[]', locked_at: Time.zone.now)
      @csp_facilitator_application.reload

      assert_equal [], @csp_facilitator_application.sanitize_status_timestamp_change_log
      assert @csp_facilitator_application.locked?

      # Changing application from locked to unlocked
      post :update, params: {id: @csp_facilitator_application.id, application: {status: @csp_facilitator_application.status, locked: false}}
      @csp_facilitator_application.reload

      expected_log = [
        {
          title: 'Application is unlocked',
          changing_user_id: @workshop_admin.id,
          changing_user_name: @workshop_admin.name,
          time: Time.zone.now
        }
      ]

      assert_equal expected_log, @csp_facilitator_application.sanitize_status_timestamp_change_log

      # Setting application to unlocked again
      post :update, params: {id: @csp_facilitator_application.id, application: {status: @csp_facilitator_application.status, locked: false}}
      @csp_facilitator_application.reload

      assert_equal expected_log, @csp_facilitator_application.sanitize_status_timestamp_change_log
    end

    test 'do not re-lock locked applications on update' do
      sign_in @workshop_admin
      @csp_facilitator_application.update(status: 'declined', locked_at: Time.zone.now)
      @csp_facilitator_application.reload
      assert @csp_facilitator_application.locked?

      Pd::Application::Facilitator1920Application.any_instance.expects(:lock!).never

      # edit locked application
      post :update, params: {id: @csp_facilitator_application.id, application: {locked: true}}
    end

    test 'do not re-unlock unlocked applications on update' do
      sign_in @workshop_admin
      @csp_facilitator_application.update(status: 'declined')
      @csp_facilitator_application.reload
      refute @csp_facilitator_application.locked?

      Pd::Application::Facilitator1920Application.any_instance.expects(:unlock!).never

      # edit locked application
      post :update, params: {id: @csp_facilitator_application.id, application: {locked: false}}
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

    test 'cohort view returns teacher applications of correct statuses' do
      expected_applications = []
      teacher_cohort_view_statuses = Pd::SharedApplicationConstants::COHORT_VIEW_STATUSES & TEACHER_APPLICATION_CLASS.statuses
      TEACHER_APPLICATION_CLASS.statuses.each do |status|
        application = create TEACHER_APPLICATION_FACTORY, course: 'csp'
        application.update_column(:status, status)
        if teacher_cohort_view_statuses.include? status
          expected_applications << application
        end
      end

      sign_in @workshop_admin
      get :cohort_view, params: {role: 'csp_teachers', regional_partner_value: 'none'}
      assert_response :success

      assert_equal(
        expected_applications.map {|application| application[:status]}.sort,
        JSON.parse(@response.body).map {|application| application['status']}.sort
      )
    end

    test 'cohort view returns facilitator applications of correct statuses' do
      expected_applications = []
      facilitator_cohort_view_statuses = Pd::SharedApplicationConstants::COHORT_VIEW_STATUSES & FACILITATOR_APPLICATION_CLASS.statuses
      FACILITATOR_APPLICATION_CLASS.statuses.each do |status|
        application = create FACILITATOR_APPLICATION_FACTORY, course: 'csp'
        application.update_column(:status, status)
        if facilitator_cohort_view_statuses.include? status
          expected_applications << application
        end
      end

      sign_in @workshop_admin
      get :cohort_view, params: {role: 'csp_facilitators', regional_partner_value: 'none'}
      assert_response :success

      assert_equal(
        expected_applications.map {|application| application[:status]}.sort,
        JSON.parse(@response.body).map {|application| application['status']}.sort
      )
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'cohort view as a workshop organizer returns expected columns for a teacher' do
      time = Date.new(2020, 3, 15)

      Timecop.freeze(time) do
        workshop = create :summer_workshop,
          sessions_from: Date.new(2020, 1, 1),
          processed_location: {city: 'Orchard Park', state: 'NY'}.to_json
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
            date_accepted: '2020-03-15',
            applicant_name: 'Minerva McGonagall',
            district_name: 'A School District',
            school_name: 'A Seattle Public School',
            email: 'minerva@hogwarts.edu',
            assigned_workshop: 'January 1-5, 2020, Orchard Park NY',
            registered_workshop: 'Yes',
            registered_workshop_id: workshop.id,
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
      time = Date.new(2020, 3, 15)

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
            date_accepted: '2020-03-15',
            applicant_name: 'Minerva McGonagall',
            district_name: 'A School District',
            school_name: 'A Seattle Public School',
            email: 'minerva@hogwarts.edu',
            assigned_workshop: nil,
            registered_workshop: nil,
            registered_workshop_id: nil,
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
      time = Date.new(2020, 3, 15)

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
            date_accepted: '2020-03-15',
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
      time = Date.new(2020, 3, 15)

      Timecop.freeze(time) do
        workshop = create :summer_workshop,
          sessions_from: Date.new(2020, 1, 1),
          processed_location: {city: 'Orchard Park', state: 'NY'}.to_json
        create :pd_enrollment, workshop: workshop, user: @serializing_teacher

        application = create(
          TEACHER_APPLICATION_FACTORY,
          course: 'csp',
          regional_partner: @regional_partner,
          user: @serializing_teacher,
          pd_workshop_id: workshop.id
        )
        application.update_scholarship_status(Pd::ScholarshipInfoConstants::NO)

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
            date_accepted: '2020-03-15',
            applicant_name: 'Minerva McGonagall',
            district_name: 'A School District',
            school_name: 'A Seattle Public School',
            email: 'minerva@hogwarts.edu',
            assigned_workshop: 'January 1-5, 2020, Orchard Park NY',
            registered_workshop: 'Yes',
            registered_workshop_id: workshop.id,
            status: 'accepted_not_notified',
            notes: nil,
            notes_2: nil,
            notes_3: nil,
            notes_4: nil,
            notes_5: nil,
            friendly_scholarship_status:
              Pd::ScholarshipInfo.get_scholarship_label(Pd::ScholarshipInfoConstants::NO, 'csp')
          }.stringify_keys, JSON.parse(@response.body).first
        )
      end
    end

    test 'cohort view returns expected columns for a teacher without a workshop' do
      time = Date.new(2020, 3, 15)

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
            date_accepted: '2020-03-15',
            applicant_name: 'Minerva McGonagall',
            district_name: 'A School District',
            school_name: 'A Seattle Public School',
            email: 'minerva@hogwarts.edu',
            assigned_workshop: nil,
            registered_workshop: nil,
            registered_workshop_id: nil,
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
      time = Date.new(2020, 3, 15)

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
            date_accepted: '2020-03-15',
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
      create PRINCIPAL_APPROVAL_FACTORY, teacher_application: application
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
        "General Notes",
        "Notes 2",
        "Notes 3",
        "Notes 4",
        "Notes 5",
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
        "Link to Application",
        "Home or cell phone",
        "Home zip code",
        "Country",
        "Principal's first name",
        "Principal's last name",
        "Principal's email address",
        "Confirm principal's email address",
        "Principal's phone number",
        "Current role",
        "Are you completing this application on behalf of someone else?",
        "If yes, please include the full name and role of the teacher and why you are applying on behalf of this teacher.",
        "Which professional learning program would you like to join for the #{APPLICATION_CURRENT_YEAR} school year?",
        "To which grades does your school plan to offer CS Principles in the #{APPLICATION_CURRENT_YEAR} school year?",
        "How will you offer CS Principles?",
        "How many minutes will your CS Program class last?",
        "How many days per week will your CS program class be offered to one section of students?",
        "How many weeks during the year will this course be taught to one section of students?",
        "Total course hours",
        "Do you plan to personally teach this course in the #{APPLICATION_CURRENT_YEAR} school year?",
        "Will this course replace an existing computer science course in the master schedule? (Teacher's response)",
        "Which existing course or curriculum will it replace? Mark all that apply.",
        "Have you participated in previous yearlong Code.org Professional Learning Programs?",
        "Are you committed to participating in the entire Professional Learning Program?",
        "Please indicate which workshops you are able to attend.",
        "Do you want to be considered for Code.org’s national virtual academic year workshops?",
        "Will your school be able to pay the fee?",
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
        "Do you approve of this teacher participating in Code.org's #{APPLICATION_CURRENT_YEAR} Professional Learning Program?",
        "Total student enrollment",
        "Percent of students who are eligible to receive free or reduced lunch (Principal's response)",
        "Percent of students from underrepresented racial and ethnic groups (Principal's response)",
        "Percent of student enrollment by race - White",
        "Percent of student enrollment by race - Black or African American",
        "Percent of student enrollment by race - Hispanic or Latino",
        "Percent of student enrollment by race - Asian",
        "Percent of student enrollment by race - Native Hawaiian or other Pacific Islander",
        "Percent of student enrollment by race - American Indian or Native Alaskan",
        "Percent of student enrollment by race - Other",
        "Are you committed to including this course on the master schedule in #{APPLICATION_CURRENT_YEAR} if this teacher is accepted into the program?",
        "Will this course replace an existing computer science course in the master schedule? (Principal's response)",
        "Which existing course or curriculum will CS Principles replace?",
        "How will you implement CS Principles at your school?",
        "Do you commit to recruiting and enrolling a diverse group of students in this course, representative of the overall demographics of your school?",
        "If there is a fee for the program, will your teacher or your school be able to pay for the fee?",
        "Principal authorizes college board to send AP Scores",
        "Contact name for invoicing",
        "Contact email or phone number for invoicing",
        "Title I status code (NCES data)",
        "Rural Status",
        "Total student enrollment (NCES data)",
        "Percent of students who are eligible to receive free or reduced lunch (NCES data)",
        "Percent of students from underrepresented racial and ethnic groups (NCES data)",
        "Percent of student enrollment by race - White (NCES data)",
        "Percent of student enrollment by race - Black or African American (NCES data)",
        "Percent of student enrollment by race - Hispanic or Latino (NCES data)",
        "Percent of student enrollment by race - Asian (NCES data)",
        "Percent of student enrollment by race - Native Hawaiian or other Pacific Islander (NCES data)",
        "Percent of student enrollment by race - American Indian or Native Alaskan (NCES data)",
        "Percent of student enrollment by race - Two or more races (NCES data)"
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
        'Date Applied',
        'Date Accepted',
        'Status',
        'Locked',
        'Meets Minimum Requirements?',
        'Teaching Experience Score',
        'Leadership Score',
        'Champion for CS Score',
        'Equity Score',
        'Growth Minded Score',
        'Content Knowledge Score',
        'Program Commitment Score',
        'Application Total Score',
        'Interview Total Score',
        'Grand Total Score',
        "General Notes",
        "Notes 2",
        "Notes 3",
        "Notes 4",
        "Notes 5",
        "Title",
        "First Name",
        "Last Name",
        "Account Email",
        "Alternate Email",
        "Home or Cell Phone",
        "Home Address",
        "City",
        "State",
        "Zip Code",
        "Gender Identity",
        "Race",
        'Assigned Summer Workshop',
        'Registered Summer Workshop?',
        'Assigned FiT Workshop',
        'Registered FiT Workshop?',
        'Regional Partner',
        'Link to Application',
        'What type of institution do you work for?',
        'Current employer',
        'What is your job title?',
        'Program',
        'Are you currently (or have you been) a Code.org facilitator?',
        'In which years did you work as a Code.org facilitator?',
        'Please check the Code.org programs you currently facilitate, or have facilitated in the past:',
        'Do you have experience as a classroom teacher?',
        'Have you led learning experiences for adults?',
        'Can you commit to attending the 2019 Facilitator Summit (May 17 - 19, 2019)?',
        'Can you commit to facilitating a minimum of 4-6 one-day workshops starting summer 2019 and continuing throughout the 2019-2020 school year?',
        'Can you commit to attending monthly webinars, or watching recordings, and staying up to date through bi-weekly newsletters and online facilitator communities?',
        'Can you commit to engaging in appropriate development and preparation to be ready to lead workshops (time commitment will vary depending on experience with the curriculum and experience as a facilitator)?',
        'Can you commit to remaining in good standing with Code.org and your assigned Regional Partner?',
        'How are you currently involved in CS education?',
        'If you do have classroom teaching experience, what grade levels have you taught? Check all that apply.',
        'Do you have experience teaching the full {{CS Program}} curriculum to students?',
        'Do you plan on teaching this course in the 2019-20 school year?',
        'Have you attended a Code.org CS Fundamentals workshop?',
        'When do you anticipate being able to facilitate? Note that depending on the program, workshops may be hosted on Saturdays or Sundays.',
        Pd::Facilitator1920ApplicationConstants.clean_multiline(
          "Code.org's Professional Learning Programs are open to all teachers, regardless of their experience with CS education.
          Why do you think Code.org believes that all teachers should have access to the opportunity to teach CS?"
        ),
        Pd::Facilitator1920ApplicationConstants.clean_multiline(
          "Please describe a workshop you've led (or a lesson you've taught, if you haven't facilitated a workshop). Include a brief description of the workshop/lesson
          topic and audience (one or two sentences). Then describe two strengths you demonstrated, as well as two facilitation skills you would like to improve.",
        ),
        Pd::Facilitator1920ApplicationConstants.clean_multiline(
          "Code.org Professional Learning experiences incorporate inquiry-based learning into the workshops. Please briefly define  inquiry-based
          learning as you understand it (one or two sentences). Then, if you have led an inquiry-based activity for students, provide a concrete
          example of an inquiry-based lesson or activity you led. If you have not led an inquiry-based lesson, please write 'N/A.'",
        ),
        'Why do you want to become a Code.org facilitator? Please describe what you hope to learn and the impact you hope to make.',
        'Is there anything else you would like us to know? You can provide a link to your resume, LinkedIn profile, website, or summarize your relevant past experience.',
        'How did you hear about this opportunity?',
        "Interview #{Pd::Facilitator1920ApplicationConstants::INTERVIEW_QUESTIONS[:question_1]}",
        "Interview #{Pd::Facilitator1920ApplicationConstants::INTERVIEW_QUESTIONS[:question_2]}",
        "Interview #{Pd::Facilitator1920ApplicationConstants::INTERVIEW_QUESTIONS[:question_3]}",
        "Interview #{Pd::Facilitator1920ApplicationConstants::INTERVIEW_QUESTIONS[:question_4]}",
        "Interview #{Pd::Facilitator1920ApplicationConstants::INTERVIEW_QUESTIONS[:question_5]}",
        "Interview #{Pd::Facilitator1920ApplicationConstants::INTERVIEW_QUESTIONS[:question_6]}",
        "Interview #{Pd::Facilitator1920ApplicationConstants::INTERVIEW_QUESTIONS[:question_7]}"
      ]
      assert_equal expected_headers, response_csv.first
      assert_equal expected_headers.length, response_csv.second.length
    end

    test 'fit_cohort' do
      fit_workshop = create :fit_workshop

      # create some applications to be included in fit_cohort
      create FACILITATOR_APPLICATION_FACTORY, :locked, fit_workshop_id: fit_workshop.id, status: :accepted
      create FACILITATOR_APPLICATION_FACTORY, :locked, fit_workshop_id: fit_workshop.id, status: :withdrawn
      # no workshop
      create FACILITATOR_APPLICATION_FACTORY, :locked, status: :accepted

      # create some applications that won't be included in fit_cohort
      # not locked
      create FACILITATOR_APPLICATION_FACTORY, fit_workshop_id: fit_workshop.id, status: :accepted

      # not accepted or withdrawn
      create FACILITATOR_APPLICATION_FACTORY, fit_workshop_id: fit_workshop.id, status: :waitlisted

      sign_in @workshop_admin

      get :fit_cohort
      assert_response :success

      result = JSON.parse response.body
      actual_applications = result.map {|a| a["id"]}
      expected_applications = FACILITATOR_APPLICATION_CLASS.fit_cohort.map(&:id)

      assert_equal expected_applications, actual_applications
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
