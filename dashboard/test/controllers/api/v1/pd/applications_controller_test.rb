require 'test_helper'

module Api::V1::Pd
  class ApplicationsControllerTest < ::ActionController::TestCase
    include Pd::Application::ActiveApplicationModels

    self.use_transactional_test_case = true

    freeze_time

    setup_all do
      @workshop_admin = create :workshop_admin
      @workshop_organizer = create :workshop_organizer
      @program_manager = create :teacher
      @regional_partner = create :regional_partner,
        program_managers: [@workshop_organizer, @program_manager],
        cohort_capacity_csd: 25,
        cohort_capacity_csp: 50

      @hash_csd_with_rp = build TEACHER_APPLICATION_HASH_FACTORY, :csd, regional_partner_id: @regional_partner.id
      @csd_teacher_application = create TEACHER_APPLICATION_FACTORY, course: 'csd'
      @csd_teacher_application_with_partner = create TEACHER_APPLICATION_FACTORY,
          form_data_hash: @hash_csd_with_rp
      @csd_incomplete_application_with_partner = create TEACHER_APPLICATION_FACTORY,
          form_data_hash: @hash_csd_with_rp,
          status: 'incomplete'
      @csp_teacher_application = create TEACHER_APPLICATION_FACTORY, course: 'csp'

      @test_show_params = {
        id: @csd_teacher_application_with_partner.id
      }
      @test_update_params = {
        application: {
          notes: 'Notes!'
        },
        id: @csd_teacher_application_with_partner.id
      }
      @test_quick_view_params = {
        role: 'csd_teachers'
      }

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

    # Auth for incomplete applications
    {
      program_manager: :forbidden,
      workshop_admin: :success
    }.each do |user, response|
      test_user_gets_response_for :show,
        name: "#{user} gets #{response} when showing incomplete applications",
        user: user,
        params: -> {{id: @csd_incomplete_application_with_partner.id}},
        response: response
    end

    {
      program_manager: :forbidden,
      workshop_admin: :success
    }.each do |user, response|
      test_user_gets_response_for :destroy,
        name: "#{user} gets #{response} when deleting incomplete applications",
        user: user,
        params: -> {{id: @csd_incomplete_application_with_partner.id}},
        response: response
    end

    {
      program_manager: :forbidden,
      workshop_admin: :success
    }.each do |user, response|
      test_user_gets_response_for :update,
        name: "#{user} gets #{response} when updating incomplete applications",
        user: user,
        params: -> {{application: {notes: 'Notes!'}, id: @csd_incomplete_application_with_partner.id}},
        response: response
    end

    test "quick view returns appropriate application type" do
      create TEACHER_APPLICATION_FACTORY, course: 'csp'
      create TEACHER_APPLICATION_FACTORY, course: 'csd'
      user = create :workshop_admin
      sign_in user

      get :quick_view, params: @test_quick_view_params
      assert_response :success
      assert_equal TEACHER_APPLICATION_CLASS.csd.count, JSON.parse(@response.body).length
    end

    test "quick view returns applications with appropriate regional partner filter" do
      sign_in @workshop_admin
      get :quick_view, params: {role: 'csd_teachers', regional_partner_value: @regional_partner.id}
      assert_response :success
      assert_equal [@csd_teacher_application_with_partner.id, @csd_incomplete_application_with_partner.id],
        JSON.parse(@response.body).map {|r| r['id']}
    end

    test 'quick view if not admin returns applications without incomplete apps and with filter' do
      sign_in @program_manager
      get :quick_view, params: {role: 'csd_teachers', regional_partner_value: @regional_partner.id}
      assert_response :success
      assert_equal [@csd_teacher_application_with_partner.id], JSON.parse(@response.body).map {|r| r['id']}
    end

    test "quick view returns applications with regional partner filter unset" do
      sign_in @workshop_admin
      get :quick_view, params: {role: 'csd_teachers'}
      assert_response :success
      assert_equal [
        @csd_teacher_application.id,
        @csd_teacher_application_with_partner.id,
        @csd_incomplete_application_with_partner.id
      ],
        JSON.parse(@response.body).map {|r| r['id']}
    end

    test "quick view returns applications with regional partner filter set to no partner" do
      sign_in @workshop_admin
      get :quick_view, params: {role: 'csd_teachers', regional_partner_value: 'none'}
      assert_response :success
      assert_equal [@csd_teacher_application.id], JSON.parse(@response.body).map {|r| r['id']}
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'regional partners can only see their applications in index as workshop organizers' do
      sign_in @workshop_organizer
      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 1, data['csd_teachers']['unreviewed']['total']
    end

    test 'regional partners can only see their applications in index' do
      sign_in @program_manager
      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 1, data['csd_teachers']['unreviewed']['total']
    end

    test 'workshop admins can only see their applications in index' do
      sign_in @workshop_admin
      get :index
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 2, data['csd_teachers']['unreviewed']['total']
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
      get :show, params: {id: @csd_teacher_application}
      assert_response :forbidden
    end

    test 'regional partners can show their applications' do
      sign_in @program_manager
      get :show, params: @test_show_params
      assert_response :success
    end

    test 'regional partners cannot show other applications' do
      sign_in @program_manager
      get :show, params: {id: @csd_teacher_application}
      assert_response :forbidden
    end

    test 'workshop admins can show any application' do
      sign_in @workshop_admin
      get :show, params: {id: @csd_teacher_application}
      assert_response :success
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'regional partners can see only their applications in quick_view as workshop organizers' do
      sign_in @workshop_organizer
      get :quick_view, params: @test_quick_view_params
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 1, data.length
      assert_equal @csd_teacher_application_with_partner.id, data[0]['id']
    end

    test 'regional partners can see only their applications in quick_view' do
      sign_in @program_manager
      get :quick_view, params: @test_quick_view_params
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 1, data.length
      assert_equal @csd_teacher_application_with_partner.id, data[0]['id']
    end

    test 'workshop admins see all applications in quick view' do
      sign_in @workshop_admin
      get :quick_view, params: @test_quick_view_params
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal TEACHER_APPLICATION_CLASS.csd.count, data.length
      expected_ids = TEACHER_APPLICATION_CLASS.csd.map(&:id).sort
      assert_equal expected_ids, data.map {|a| a['id']}.sort
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'regional partners can edit their applications as workshop organizers' do
      sign_in @workshop_organizer
      Pd::Application::TeacherApplication.any_instance.stubs(:deliver_email)

      put :update, params: {id: @csd_teacher_application_with_partner, application: {status: 'accepted', notes: 'Notes'}}
      assert_response :success
    end

    # TODO: remove this test when workshop_organizer is deprecated
    test 'regional partners cannot edit other applications as workshop organizers' do
      sign_in @workshop_organizer
      put :update, params: {id: @csd_teacher_application, application: {status: 'accepted', notes: 'Notes'}}
      assert_response :forbidden
    end

    test 'regional partners can edit their applications' do
      sign_in @program_manager
      Pd::Application::TeacherApplication.any_instance.stubs(:deliver_email)

      put :update, params: {id: @csd_teacher_application_with_partner, application: {status: 'accepted', notes: 'Notes'}}
      assert_response :success
    end

    test 'regional partners cannot edit other applications' do
      sign_in @program_manager
      put :update, params: {id: @csd_teacher_application, application: {status: 'accepted', notes: 'Notes'}}
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

    test 'update appends to the timestamp log if summer workshop is changed' do
      summer_workshop = create :summer_workshop,
        sessions_from: Date.new(2019, 6, 1),
        processed_location: {city: 'Orchard Park', state: 'NY'}.to_json

      sign_in @program_manager
      @csd_teacher_application_with_partner.update(status_timestamp_change_log: '[]')
      @csd_teacher_application_with_partner.reload

      assert_equal [], @csd_teacher_application_with_partner.sanitize_status_timestamp_change_log

      post :update, params: {id: @csd_teacher_application_with_partner.id, application: {pd_workshop_id: summer_workshop.id, status: @csd_teacher_application_with_partner.status}}
      @csd_teacher_application_with_partner.reload

      assert_equal [
        {
          title: "Summer Workshop: #{@csd_teacher_application_with_partner.workshop_date_and_location}",
          changing_user_id: @program_manager.id,
          changing_user_name: @program_manager.name,
          time: Time.zone.now
        }
      ], @csd_teacher_application_with_partner.sanitize_status_timestamp_change_log
    end

    test 'update does not append to the timestamp log if summer workshop is not changed' do
      summer_workshop = create :summer_workshop,
        sessions_from: Date.new(2019, 6, 1),
        processed_location: {city: 'Orchard Park', state: 'NY'}.to_json

      sign_in @program_manager
      @csd_teacher_application_with_partner.update(status_timestamp_change_log: '[]')
      @csd_teacher_application_with_partner.reload

      assert_equal [], @csd_teacher_application_with_partner.sanitize_status_timestamp_change_log

      params_for_update = {id: @csd_teacher_application_with_partner.id, application: {
        pd_workshop_id: summer_workshop.id, status: @csd_teacher_application_with_partner.status
      }}
      post :update, params: params_for_update
      @csd_teacher_application_with_partner.reload

      expected_log = [
        {
          title: "Summer Workshop: #{@csd_teacher_application_with_partner.workshop_date_and_location}",
          changing_user_id: @program_manager.id,
          changing_user_name: @program_manager.name,
          time: Time.zone.now
        }
      ]

      assert_equal expected_log, @csd_teacher_application_with_partner.sanitize_status_timestamp_change_log

      post :update, params: params_for_update

      assert_equal expected_log, @csd_teacher_application_with_partner.sanitize_status_timestamp_change_log
    end

    test 'update sends a decision email once if status changed to decision and if associated with an RP' do
      sign_in @program_manager
      Pd::Application::TeacherApplicationMailer.expects(:accepted).
        with(instance_of(TEACHER_APPLICATION_CLASS)).
        returns(mock {|mail| mail.expects(:deliver_now)})

      post :update, params: {id: @csd_teacher_application_with_partner.id, application: {
        status: 'accepted'
      }}

      # A different update does not trigger another decision email sent
      post :update, params: {id: @csd_teacher_application_with_partner.id, application: {
        notes: 'More notes'
      }}
    end

    test 'update does not send a decision email if status changed to decision but no RP' do
      sign_in @program_manager
      Pd::Application::TeacherApplicationMailer.expects(:accepted).never

      post :update, params: {id: @csd_teacher_application.id, application: {
        status: 'accepted'
      }}
    end

    test 'update does not send a decision email if status changed to non-decision even with an RP' do
      hash_csp_with_rp = build TEACHER_APPLICATION_HASH_FACTORY, :csp, regional_partner_id: @regional_partner.id
      csp_teacher_application_with_partner = create TEACHER_APPLICATION_FACTORY, form_data_hash: hash_csp_with_rp

      sign_in @program_manager
      Pd::Application::TeacherApplicationMailer.expects(:accepted).never

      csp_teacher_application_with_partner.expects(:send_pd_application_email).never
      post :update, params: {id: csp_teacher_application_with_partner.id, application: {
        status: 'pending'
      }}
    end

    test 'workshop admins can update form_data' do
      sign_in @workshop_admin
      updated_form_data = @csd_teacher_application_with_partner.form_data_hash.merge('alternateEmail' => 'my.other@email.net')
      put :update, params: {id: @csd_teacher_application_with_partner.id, application: {form_data: updated_form_data}}
      assert_response :success
      data = JSON.parse(response.body)
      assert_equal 'my.other@email.net', data['form_data']['alternateEmail']

      # Make sure partner is retained
      assert_equal @regional_partner, @csd_teacher_application_with_partner.reload.regional_partner
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
    test 'Regional partners cannot update form_data as workshop organizers' do
      sign_in @workshop_organizer
      updated_form_data = @csd_teacher_application_with_partner.form_data_hash.merge('alternateEmail' => 'my.other@email.net')
      put :update, params: {id: @csd_teacher_application_with_partner.id, application: {form_data: updated_form_data}}
      assert_response :success
      data = JSON.parse(response.body)
      refute_equal 'my.other@email.net', data['form_data']['alternateEmail']
    end

    test 'Regional partners cannot update form_data' do
      sign_in @program_manager
      updated_form_data = @csd_teacher_application_with_partner.form_data_hash.merge('alternateEmail' => 'my.other@email.net')
      put :update, params: {id: @csd_teacher_application_with_partner.id, application: {form_data: updated_form_data}}
      assert_response :success
      data = JSON.parse(response.body)
      refute_equal 'my.other@email.net', data['form_data']['alternateEmail']
    end

    test 'notes field will strip pandas' do
      sign_in @program_manager
      put :update, params: {id: @csd_teacher_application_with_partner.id, application: {notes: panda_panda}}
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
        refute_includes(response_csv.first, column)
      end

      column = TEACHER_APPLICATION_CLASS.csv_filtered_labels('csd')[:teacher][:csd_which_grades]
      assert_includes(response_csv.first, column)
    end

    test 'csv download for csp teacher returns expected columns' do
      sign_in @workshop_admin

      get :quick_view, format: 'csv', params: {role: 'csp_teachers'}
      assert_response :success
      response_csv = CSV.parse @response.body

      [:csp_which_grades, :csp_how_offer].each do |key|
        column = TEACHER_APPLICATION_CLASS.csv_filtered_labels('csp')[:teacher][key]
        assert_includes(response_csv.first, column)
      end

      column = TEACHER_APPLICATION_CLASS.csv_filtered_labels('csd')[:teacher][:csd_which_grades]
      refute_includes(response_csv.first, column)
    end

    test 'cohort view returns teacher applications of correct statuses' do
      expected_applications = []
      teacher_cohort_view_statuses = Pd::SharedApplicationConstants::COHORT_CALCULATOR_STATUSES & TEACHER_APPLICATION_CLASS.statuses
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
          course: 'csd',
          form_data_hash: @hash_csd_with_rp,
          user: @serializing_teacher,
          pd_workshop_id: workshop.id
        )

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.save!
        application.status = 'accepted'
        application.save!

        sign_in @workshop_organizer
        get :cohort_view, params: {role: 'csd_teachers'}
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
            status: 'accepted',
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
          form_data_hash: @hash_csd_with_rp,
          user: @serializing_teacher,
        )

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.save!
        application.status = 'accepted'
        application.save!

        sign_in @workshop_organizer
        get :cohort_view, params: {role: 'csd_teachers'}
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
            status: 'accepted',
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

    test 'cohort view returns expected columns for a teacher' do
      time = Date.new(2020, 3, 15)

      Timecop.freeze(time) do
        workshop = create :summer_workshop,
          sessions_from: Date.new(2020, 1, 1),
          processed_location: {city: 'Orchard Park', state: 'NY'}.to_json
        create :pd_enrollment, workshop: workshop, user: @serializing_teacher

        application = create(
          TEACHER_APPLICATION_FACTORY,
          form_data_hash: @hash_csd_with_rp,
          user: @serializing_teacher,
          pd_workshop_id: workshop.id
        )
        application.update_scholarship_status(Pd::ScholarshipInfoConstants::NO)

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.save!
        application.status = 'accepted'
        application.save!

        sign_in @program_manager
        get :cohort_view, params: {role: 'csd_teachers'}
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
            status: 'accepted',
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
          form_data_hash: @hash_csd_with_rp,
          user: @serializing_teacher
        )

        application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
        application.save!
        application.status = 'accepted'
        application.save!

        sign_in @program_manager
        get :cohort_view, params: {role: 'csd_teachers'}
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
            status: 'accepted',
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

    test 'cohort csv download returns expected columns for teachers' do
      application = create TEACHER_APPLICATION_FACTORY, course: 'csp'
      create PRINCIPAL_APPROVAL_FACTORY, teacher_application: application
      application.update(status: 'accepted')
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
        "Administrator/School Leader's Role",
        "Administrator/School Leader's first name",
        "Administrator/School Leader's last name",
        "Administrator/School Leader's email address",
        "Confirm Administrator/School Leader's email address",
        "Administrator/School Leader's phone number",
        "Current role",
        "Are you completing this application on behalf of someone else?",
        "If yes, please include the full name and role of the teacher and why you are applying on behalf of this teacher.",
        "Which professional learning program would you like to join for the #{APPLICATION_CURRENT_YEAR} school year?",
        "To which grades does your school plan to offer CS Principles in the #{APPLICATION_CURRENT_YEAR} school year?",
        "How will you offer CS Principles?",
        "Will you have more than {{min hours}} hours with your {{CS program}} section(s)?",
        "Will this course replace an existing computer science course in the master schedule? (Teacher's response)",
        "Have you participated in previous yearlong Code.org Professional Learning Programs?",
        "Are you committed to participating in the entire Professional Learning Program?",
        "Please indicate which workshops you are able to attend.",
        "Will your school be able to pay the fee?",
        "Please provide any additional information you'd like to share about why your application should be considered for a scholarship.",
        "Teacher's gender identity",
        "Teacher's race",
        "How did you hear about this program? (Teacher's response)",
        "Administrator/School Leader Approval Form URL",
        "Home street address",
        "Home city",
        "Home state",
        "Administrator/School Leader's title (provided by principal)",
        "Administrator/School Leader's first name (provided by principal)",
        "Administrator/School Leader's last name (provided by principal)",
        "Administrator/School Leader's email address (provided by principal)",
        "Can we email you about updates to our courses, local opportunities, or other computer science news? (roughly once a month)",
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
        "How will you implement CS Principles at your school?",
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

    test 'search does not reveal applications incomplete applications if not workshop admin' do
      sign_in @program_manager
      get :search, params: {email: @csd_incomplete_application_with_partner.user.email}
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
  end
end
