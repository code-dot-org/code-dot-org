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
      @regional_partner = create :regional_partner, program_managers: [@workshop_organizer]
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
      @csp_teacher_application = create :pd_teacher1819_application, course: 'csp'
      @csp_facilitator_application = create :pd_facilitator1819_application, course: 'csp'
    end

    test_redirect_to_sign_in_for :index
    test_redirect_to_sign_in_for :show, params: -> {@test_show_params}
    test_redirect_to_sign_in_for :update, params: -> {@test_update_params}
    test_redirect_to_sign_in_for :quick_view, params: -> {@test_quick_view_params}

    # Basic auth for read methods, workshop_organizer is tested explicitly below
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

    test 'regional partners can only see their applications in index' do
      sign_in @workshop_organizer
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

    test 'regional partners can show their applications' do
      sign_in @workshop_organizer
      get :show, params: @test_show_params
      assert_response :success
    end

    test 'regional partners cannot show other applications' do
      sign_in @workshop_organizer
      get :show, params: {id: @csf_facilitator_application_no_partner}
      assert_response :forbidden
    end

    test 'workshop admins can show any application' do
      sign_in @workshop_admin
      get :show, params: {id: @csf_facilitator_application_no_partner}
      assert_response :success
    end

    test 'regional partners can see only their applications in quick_view' do
      sign_in @workshop_organizer
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

    test 'regional partners can edit their applications' do
      sign_in @workshop_organizer
      put :update, params: {id: @csf_facilitator_application_with_partner, application: {status: 'accepted', notes: 'Notes'}}
      assert_response :success
    end

    test 'regional partners cannot edit other applications' do
      sign_in @workshop_organizer
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

    test 'workshop admins and G3 partners can lock and unlock applications' do
      sign_in @workshop_admin
      put :update, params: {id: @csf_facilitator_application_no_partner, application: {status: 'accepted', locked: 'true'}}
      assert_response :success
      data = JSON.parse(response.body)
      assert data['locked']

      g3_organizer = create :workshop_organizer
      create :regional_partner, program_managers: [g3_organizer], group: 3
      sign_in g3_organizer
      put :update, params: {id: @csf_facilitator_application_with_partner, application: {status: 'accepted', locked: 'true'}}
      assert_response :success
      data = JSON.parse(response.body)
      assert data['locked']
    end

    test 'ONLY workdshop admins and G3 partners can lock and unlock applications' do
      sign_in @workshop_organizer
      put :update, params: {id: @csf_facilitator_application_with_partner, application: {status: 'accepted', locked: 'true'}}
      assert_response :success
      data = JSON.parse(response.body)
      refute data['locked']
    end

    test 'csv download for csd teacher returns expected columns' do
      sign_in @workshop_admin

      get :quick_view, format: 'csv', params: {role: 'csd_teachers'}
      assert_response :success
      response_csv = CSV.parse @response.body

      assert Teacher1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csd_which_grades, :csd_course_hours_per_week, :csd_course_hours_per_year, :csd_terms_per_year
      ).values.all? {|x| response_csv.first.include?(x + "\n")}

      assert Teacher1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csp_which_grades, :csp_course_hours_per_week, :csp_course_hours_per_year, :csp_how_offer, :csp_ap_exam
      ).values.any? {|x| response_csv.first.exclude?(x + "\n")}
    end

    test 'csv download for csp teacher returns expected columns' do
      sign_in @workshop_admin

      get :quick_view, format: 'csv', params: {role: 'csp_teachers'}
      assert_response :success
      response_csv = CSV.parse @response.body

      assert Teacher1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csp_which_grades, :csp_course_hours_per_week, :csp_course_hours_per_year, :csp_terms_per_year, :csp_how_offer, :csp_ap_exam
      ).values.all? {|x| response_csv.first.include?(x + "\n")}

      assert Teacher1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csd_which_grades, :csd_course_hours_per_week, :csd_course_hours_per_year
      ).values.any? {|x| response_csv.first.exclude?(x + "\n")}
    end

    test 'csv download for csf facilitator returns expected columns' do
      sign_in @workshop_admin

      get :quick_view, format: 'csv', params: {role: 'csf_facilitators'}
      assert_response :success
      response_csv = CSV.parse @response.body

      assert Facilitator1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csf_availability
      ).values.all? {|x| response_csv.first.include?(x + "\n")}

      assert Facilitator1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csd_csp_teachercon_availability, :csd_csp_fit_availability
      ).values.any? {|x| response_csv.first.exclude?(x + "\n")}
    end

    test 'csv download for csp facilitator returns expected columns' do
      sign_in @workshop_admin

      get :quick_view, format: 'csv', params: {role: 'csp_facilitators'}
      assert_response :success
      response_csv = CSV.parse @response.body

      assert Facilitator1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csd_csp_teachercon_availability, :csd_csp_fit_availability
      ).values.all? {|x| response_csv.first.include?(x + "\n")}

      assert Facilitator1819ApplicationConstants::ALL_LABELS_WITH_OVERRIDES.slice(
        :csf_availability
      ).values.any? {|x| response_csv.first.exclude?(x + "\n")}
    end

    test 'cohort view returns expected columns' do
      application = create(
        :pd_teacher1819_application,
        course: 'csp',
        regional_partner: @regional_partner,
        user: (
          create(
            :teacher,
            email: 'minerva@hogwarts.edu',
            school_info: (
              create(
                :school_info,
                school: (
                  create(
                    :school,
                    name: 'Hogwarts'
                  )
                )
              )
            )
          )
        )
      )

      application.update_form_data_hash({first_name: 'Minerva', last_name: 'McGonagall'})
      application.save
      application.update(status: 'accepted')
      application.lock!

      sign_in @workshop_organizer
      get :cohort_view, params: {role: 'csp_teachers'}
      assert :success

      assert_equal(
        {
          date_accepted: 'Not implemented yet',
          applicant_name: 'Minerva McGonagall',
          district_name: 'A School District',
          school_name: 'Hogwarts',
          email: 'minerva@hogwarts.edu',
          registered_for_summer_workshop: 'Not implemented yet'
        }.stringify_keys, JSON.parse(@response.body).first
      )
    end
  end
end
