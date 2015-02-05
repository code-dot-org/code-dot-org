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

    # Test index + CRUD controller actions

    test 'list all workshops' do
      assert_routing({ path: 'ops/workshops', method: :get }, { controller: 'ops/workshops', action: 'index' })

      get :index
      assert_response :success
    end

    test 'create workshop' do
      assert_routing({ path: 'ops/workshops', method: :post }, { controller: 'ops/workshops', action: 'create' })

      assert_difference 'Workshop.count' do
        post :create, workshop: {name: 'test workshop', program_type: 'CSP', cohort_id: @cohort, facilitator_id: @facilitator}
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
  end
end
