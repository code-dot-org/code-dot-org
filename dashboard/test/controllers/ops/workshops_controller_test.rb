require 'test_helper'
module Ops
  class WorkshopsControllerTest < ::ActionController::TestCase
    include Devise::TestHelpers
    API = ::OPS::API

    setup do
      @request.headers['Accept'] = 'application/json'
      @admin = create(:admin)
      sign_in @admin
      @workshop = create(:workshop)
      @cohort = @workshop.cohort
      @cohort_district = create(:cohorts_district, cohort: @cohort)
      @cohort = @cohort.reload
      @district = @cohort_district.district
      @facilitator = create(:facilitator)

      # add teachers to cohort
      @cohort.teachers << create(:teacher)
      @cohort.teachers << create(:teacher)
      @cohort.save!

    end

    test 'Facilitators can view all workshops they are facilitating' do
      # GET /ops/workshops
      #87055150 (part 1)
      sign_out @admin
      sign_in @workshop.facilitators.first
      get :index
      assert_response :success
      assert_equal 1, JSON.parse(@response.body).length
    end

    test "Facilitators can list all teachers in their workshop's cohort" do
      #87055150 (part 2)
      # first name, last name, email, district, gender and any workshop details that are available for teachers
      assert_routing({ path: "#{API}/workshops/1/teachers", method: :get }, { controller: 'ops/workshops', action: 'teachers', id: '1' })

      sign_in @workshop.facilitators.first
      get :teachers, id: @workshop.id
      assert_response :success

    end

    test "Facilitators can add teachers the day of a workshop" do
      #87055064
      # todo
    end

    test 'District contacts can view all workshops in all cohorts in their district' do
      #87054994 (part 1)
      sign_out @admin
      sign_in @district.contact
      get :index
      assert_response :success
      assert_equal 1, JSON.parse(@response.body).length
    end

    # Test index + CRUD controller actions

    test 'list all workshops' do
      assert_routing({ path: "#{API}/workshops", method: :get }, { controller: 'ops/workshops', action: 'index' })

      get :index
      assert_response :success
    end

    test 'Ops team can create workshops' do
      #87054134
      assert_routing({ path: "#{API}/workshops", method: :post }, { controller: 'ops/workshops', action: 'create' })

      assert_difference 'Workshop.count' do
        post :create, workshop: {name: 'test workshop', program_type: '1', cohort_id: @cohort, facilitator_ids: [@facilitator]}
      end
      assert_response :success
    end

    test 'read workshop info' do
      assert_routing({ path: "#{API}/workshops/1", method: :get }, { controller: 'ops/workshops', action: 'show', id: '1' })

      get :show, id: @workshop.id
      assert_response :success
    end

    test 'update workshop info' do
      assert_routing({ path: "#{API}/workshops/1", method: :patch }, { controller: 'ops/workshops', action: 'update', id: '1' })

      new_name = 'New workshop name'
      patch :update, id: @workshop.id, workshop: {name: new_name}

      get :show, id: @workshop.id
      assert_equal new_name, JSON.parse(@response.body)['name']
      assert_response :success
    end

    test 'delete workshop' do
      assert_routing({ path: "#{API}/workshops/1", method: :delete }, { controller: 'ops/workshops', action: 'destroy', id: '1' })

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
