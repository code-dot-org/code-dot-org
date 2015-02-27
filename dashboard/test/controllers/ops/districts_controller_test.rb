require 'test_helper'
module Ops
  class DistrictsControllerTest < ::ActionController::TestCase
    include Devise::TestHelpers
    API = 'dashboardapi'

    setup do
      @request.headers['Accept'] = 'application/json'
      @admin = create :admin
      sign_in @admin
      @district = create(:district)
    end


    test 'District contact can view all teachers in their district' do
      #87054980
      assert_routing({ path: "#{API}/districts/1/teachers", method: :get }, { controller: 'ops/districts', action: 'teachers', id: '1' })
      sign_out @admin
      sign_in @district.contact
      teacher = create(:teacher)
      @district.users << teacher
      get :teachers, id: @district.id
      assert_response :success
      assert_equal teacher.email, JSON.parse(@response.body).first['email']
    end

    # Test index + CRUD controller actions

    test 'Ops team can list all districts' do
      assert_routing({ path: "#{API}/districts", method: :get }, { controller: 'ops/districts', action: 'index' })

      get :index
      assert_response :success
    end

    test 'Anonymous users cannot affect districts' do
      sign_out @admin
      all_forbidden
    end

    test 'Logged-in teachers cannot affect districts' do
      sign_out @admin
      sign_in create(:user)
      all_forbidden
    end

    def all_forbidden
      get :index
      assert_response :forbidden
      post :create, district: {name: 'test'}
      assert_response :forbidden
      get :show, id: @district.id
      assert_response :forbidden
      patch :update, id: @district.id, district: {name: 'name'}
      assert_response :forbidden
      delete :destroy, id: @district.id
      assert_response :forbidden
    end

    test 'Ops team can create Districts' do
      #87053952
      assert_routing({ path: "#{API}/districts", method: :post }, { controller: 'ops/districts', action: 'create' })

      assert_difference 'District.count' do
        post :create, district: {name: 'test district'}
      end
      assert_response :success
    end

    test 'read district info' do
      assert_routing({ path: "#{API}/districts/1", method: :get }, { controller: 'ops/districts', action: 'show', id: '1' })

      get :show, id: @district.id
      assert_response :success
    end

    test 'update district info' do
      assert_routing({ path: "#{API}/districts/1", method: :patch }, { controller: 'ops/districts', action: 'update', id: '1' })

      new_name = 'New district name'
      patch :update, id: @district.id, district: {name: new_name}

      get :show, id: @district.id
      assert_equal new_name, JSON.parse(@response.body)['name']
      assert_response :success
    end

    test 'Ops team can assign District Contact to District' do
      #87053900
      assert_routing({ path: "#{API}/districts/1", method: :put }, { controller: 'ops/districts', action: 'update', id: '1' })
      teacher = create(:teacher)
      put :update, id: @district.id, district: {contact_id: teacher.id}
      get :show, id: @district.id
      assert_equal teacher.id, JSON.parse(@response.body)['contact_id']
      assert_response :success
    end

    test 'delete district' do
      assert_routing({ path: "#{API}/districts/1", method: :delete }, { controller: 'ops/districts', action: 'destroy', id: '1' })

      assert_difference 'District.count', -1 do
        delete :destroy, id: @district.id
      end
      assert_response :success
    end
  end
end
