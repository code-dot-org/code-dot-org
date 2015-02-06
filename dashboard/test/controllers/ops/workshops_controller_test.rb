require 'test_helper'
module Ops
  class WorkshopsControllerTest < ::ActionController::TestCase
    include Devise::TestHelpers

    setup do
      @admin = create(:admin)
      sign_in @admin
      @workshop = create(:workshop)
      @cohort = create(:cohort)
      @facilitator = create(:facilitator)
    end

    test 'Facilitators can view all workshops they are facilitating' do
      #87055150
      sign_out @admin
      sign_in @workshop.facilitators.first
      get :index
      assert_response :success
      assert_equal 1, JSON.parse(@response.body).length
    end

    test 'District contacts can view all workshops in all cohorts in their district' do
      #87054994 (part 1)
      sign_out @admin
      sign_in @workshop.districts.first.contact
      get :index
      assert_response :success
      assert_equal 1, JSON.parse(@response.body).length
    end

    # Test index + CRUD controller actions

    test 'list all workshops' do
      assert_routing({ path: 'ops/workshops', method: :get }, { controller: 'ops/workshops', action: 'index' })

      get :index
      assert_response :success
    end

    test 'create workshop' do
      assert_routing({ path: 'ops/workshops', method: :post }, { controller: 'ops/workshops', action: 'create' })

      assert_difference 'Workshop.count' do
        post :create, workshop: {name: 'test workshop', program_type: 'CSP', cohort_id: @cohort, facilitator_ids: [@facilitator]}
      end
      assert_response :success
    end

    test 'read workshop info' do
      assert_routing({ path: 'ops/workshops/1', method: :get }, { controller: 'ops/workshops', action: 'show', id: '1' })

      get :show, id: @workshop.id
      assert_response :success
    end

    test 'update workshop info' do
      assert_routing({ path: 'ops/workshops/1', method: :patch }, { controller: 'ops/workshops', action: 'update', id: '1' })

      new_name = 'New workshop name'
      patch :update, id: @workshop.id, workshop: {name: new_name}

      get :show, id: @workshop.id
      p @response.body
      assert_equal new_name, JSON.parse(@response.body)['name']
      assert_response :success
    end

    test 'delete workshop' do
      assert_routing({ path: 'ops/workshops/1', method: :delete }, { controller: 'ops/workshops', action: 'destroy', id: '1' })

      assert_difference 'Workshop.count', -1 do
        get :destroy, id: @workshop.id
      end
      assert_response :success
    end

    # Access tests
    test 'Anonymous users cannot affect workshops' do
      sign_out @admin
      all_forbidden
    end

    test 'Logged-in teachers cannot affect workshops' do
      sign_out @admin
      sign_in create(:user)
      all_forbidden
    end

    def all_forbidden
      get :index
      assert_response :forbidden
      get :show, id: @workshop.id
      assert_response :forbidden
    end

  end
end
