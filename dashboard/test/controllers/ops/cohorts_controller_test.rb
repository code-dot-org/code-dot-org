require 'test_helper'
module Ops
  class CohortsControllerTest < ::ActionController::TestCase
    include Devise::TestHelpers

    setup do
      @admin = create :admin
      sign_in @admin
      @cohort = create(:cohort)
    end

    # Test index + CRUD controller actions

    test 'Ops team can list all cohorts' do
      assert_routing({ path: 'ops/cohorts', method: :get }, { controller: 'ops/cohorts', action: 'index' })

      get :index
      assert_response :success
    end

    test 'Anonymous users cannot affect cohorts' do
      sign_out @admin
      all_forbidden
    end

    test 'Logged-in teachers cannot affect cohorts' do
      sign_out @admin
      sign_in create(:user)
      all_forbidden
    end

    def all_forbidden
      get :index
      assert_response :forbidden
      post :create
      assert_response :forbidden
      get :show, id: @cohort.id
      assert_response :forbidden
      patch :update, id: @cohort.id, cohort: {name: 'name'}
      assert_response :forbidden
      delete :destroy, id: @cohort.id
      assert_response :forbidden
    end

    test 'Ops team can create Cohorts' do
      #87054348
      assert_routing({ path: 'ops/cohorts', method: :post }, { controller: 'ops/cohorts', action: 'create' })

      assert_difference 'Cohort.count' do
        post :create
      end
      assert_response :success
    end

    test 'Ops team can create a Cohort from a list of teacher ids' do
      #87054348 (part 1)
      teachers = create_list(:teacher, 5)
      assert_difference 'Cohort.count' do
        post :create, cohort: {name: 'Cohort name', teacher_ids: teachers.map(&:id)}
      end
      assert_response :success
      assert_equal Cohort.last.teachers, teachers
    end

    test 'Ops team can create a Cohort from a list of teacher information' do
      #87054348 (part 2)
      teacher_info = (1..5).map{|x| {name: "Teacher #{x}", email: "teacher_#{x}@school.edu", district: @cohort.districts.first.name}}
      assert_difference ->{User.count}, 5 do
        assert_difference ->{Cohort.count} do
          post :create, cohort: {name: 'Cohort name', teacher_info: teacher_info}
        end
      end
      assert_response :success
      teachers = Cohort.last.teachers
      assert_equal teachers.map{|x|x.name}, teacher_info.map{|x|x[:name]}
    end

    test 'read cohort info' do
      assert_routing({ path: 'ops/cohorts/1', method: :get }, { controller: 'ops/cohorts', action: 'show', id: '1' })

      get :show, id: @cohort.id
      assert_response :success
    end

    test 'update cohort info' do
      assert_routing({ path: 'ops/cohorts/1', method: :patch }, { controller: 'ops/cohorts', action: 'update', id: '1' })

      new_name = 'New cohort name'
      patch :update, id: @cohort.id, cohort: {name: new_name}

      get :show, id: @cohort.id
      assert_equal new_name, JSON.parse(@response.body)['name']
      assert_response :success
    end

    test 'delete cohort' do
      assert_routing({ path: 'ops/cohorts/1', method: :delete }, { controller: 'ops/cohorts', action: 'destroy', id: '1' })

      assert_difference 'Cohort.count', -1 do
        delete :destroy, id: @cohort.id
      end
      assert_response :success
    end
  end
end
