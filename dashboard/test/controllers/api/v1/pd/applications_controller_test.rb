require 'test_helper'

module Api::V1::Pd
  class ApplicationsControllerTest < ::ActionController::TestCase
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
  end
end
