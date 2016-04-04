require 'test_helper'
module Ops
  class DistrictsControllerTest < ::ActionController::TestCase
    include Devise::TestHelpers
    API = ::OPS::API

    setup do
      @admin = create :admin
      sign_in @admin
      @district = create(:district)
    end

    test 'just return json whatever you ask for' do
      @request.headers['Accept'] = 'text/html'
      get :index, format: :html
      assert_response :success

      # it's a json list
      assert_equal 1, JSON.parse(@response.body).count
    end

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

    test 'Ops team can create District with district contact' do
      #87053952
      assert_routing({ path: "#{API}/districts", method: :post }, { controller: 'ops/districts', action: 'create' })

      assert_creates(District, User) do
        post :create, district: {name: 'test district', contact: {ops_first_name: 'New', ops_last_name: 'user', email: 'new_teacher@email.xx'}}
      end
      assert_response :success

      dc = User.last
      district = District.last

      # new user is a district contact
      assert_equal 'new_teacher@email.xx', dc.email
      assert dc.teacher?
      assert dc.district_contact?
      assert_equal district, dc.district_as_contact
      assert dc.invitation_token
      assert dc.teacher?
      assert_equal 'New', dc.ops_first_name
      assert_equal 'user', dc.ops_last_name
      assert dc.invited_by == @admin

      # new district knows about the contact
      assert_equal dc, district.contact
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

    test 'assigning district contact to district creates new user' do
      old_district_contact = @district.contact

      assert_routing({ path: "#{API}/districts/1", method: :put }, { controller: 'ops/districts', action: 'update', id: '1' })
      assert_creates(User) do
        put :update, id: @district.id, district: {contact: {ops_first_name: 'New', ops_last_name: 'Teacher', email: 'new_teacher@email.xx'}}
      end

      # user is a district contact
      dc = User.last
      assert_equal 'new_teacher@email.xx', dc.email
      assert dc.teacher?
      assert dc.district_contact?
      assert_equal @district, dc.district_as_contact

      # district knows about the contact
      @district = @district.reload
      assert_equal dc, @district.contact

      # old district contact is no longer a district contact
      assert !old_district_contact.district_contact?
    end

    test 'assigning district contact to district upgrades existing user' do
      old_district_contact = @district.contact

      dc = create :teacher, email: 'existing@teacher.xx'
      assert dc.teacher?
      assert !dc.district_contact?

      assert_routing({ path: "#{API}/districts/1", method: :put }, { controller: 'ops/districts', action: 'update', id: '1' })
      assert_does_not_create(User) do
        put :update, id: @district.id, district: {contact: {name: 'Existing Teacher', email: 'existing@teacher.xx'}}
      end

      # user is a district contact
      dc = dc.reload
      assert dc.teacher?
      assert dc.district_contact? # upgrade
      assert_equal @district, dc.district_as_contact

      # district knows about the contact
      @district = @district.reload
      assert_equal dc, @district.contact

      # old district contact is no longer a district contact
      assert !old_district_contact.district_contact?
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
