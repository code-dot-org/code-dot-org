require 'test_helper'
module Ops
  class CohortsControllerTest < ::ActionController::TestCase
    include Devise::TestHelpers
    API = ::OPS::API

    setup do
      @request.headers['Accept'] = 'application/json'
      @admin = create :admin
      sign_in @admin
      @cohort = create(:cohort)
    end

    test 'District Contact can add teachers to a cohort' do
      #87054720 (part 1)
      #can click "Add Teacher" button to add a teacher
      assert_routing({ path: "#{API}/cohorts/1", method: :patch }, { controller: 'ops/cohorts', action: 'update', id: '1' })

      district = @cohort.districts.first

      teacher_params = @cohort.teachers.map {|teacher| {ops_first_name: teacher.name, email: teacher.email, id: teacher.id}}
      teacher_params += [
                         {ops_first_name: 'Laurel', ops_last_name: 'X', email: 'laurel_x@example.xx', district_name: district.name},
                         {ops_first_name: 'Laurel', ops_last_name: 'Y', email: 'laurel_y@example.xx', district_name: district.name}
                        ]

      assert_difference('@cohort.reload.teachers.count', 2) do
        assert_difference('User.count', 2) do
          patch :update, id: @cohort.id, cohort: {teachers: teacher_params}
        end
      end

      assert_response :success
    end

    test 'District Contact can drop teachers in their district from a cohort' do
      assert_routing({ path: "#{API}/cohorts/1/teachers/2", method: :delete }, { controller: 'ops/cohorts', id: '1', teacher_id: '2', action: 'destroy_teacher' })

      assert_difference ->{@cohort.teachers.count}, -1 do
        delete :destroy_teacher, id: @cohort.id, teacher_id: @cohort.teachers.first.id
      end
      assert_response :success
    end

    test 'District Contact cannot add/drop teachers in other districts' do
      #87054720 (part 3)
      # todo
    end

      # Test index + CRUD controller actions

    test 'Ops team can list all cohorts' do
      assert_routing({ path: "#{API}/cohorts", method: :get }, { controller: 'ops/cohorts', action: 'index' })

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
      post :create, cohort: {name: 'x'}
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
      assert_routing({ path: "#{API}/cohorts", method: :post }, { controller: 'ops/cohorts', action: 'create' })

      assert_difference 'Cohort.count' do
        post :create, cohort: {name: 'Cohort name'}
      end
      assert_response :success
    end

    def teacher_params
      (1..5).map do |x|
        {ops_first_name: 'Teacher', ops_last_name: "#{x}", email: "teacher_#{x}@school.edu", district: @cohort.districts.first.name}
      end
    end

    test 'Ops team can create a Cohort from a list of teacher information' do
      #87054348 (part 2)
      assert_difference 'User.count', 5 do
        assert_difference 'Cohort.count' do
          post :create, cohort: {name: 'Cohort name', district_names: [@cohort.districts.first.name], teachers: teacher_params}
          assert_response :success
        end
      end
      assert_response :success

      # Ensure that the returned Cohort JSON object contains the provided District and teacher info
      cohort_json = JSON.parse(@response.body)
      assert_not_equal @cohort.id, cohort_json[:id]
      assert_equal @cohort.districts.first.id, cohort_json['districts'].first['id']

      assert_equal (1..5).map(&:to_s), cohort_json['teachers'].map {|x| x['ops_last_name']}
    end

    test 'Create Cohort using district_ids instead of district_names' do
      post :create, cohort: {name: 'Cohort name', district_ids: [@cohort.districts.first.id], teachers: teacher_params}
      assert_response :success

      cohort_id = JSON.parse(@response.body)['id']
      cohort = Cohort.find(cohort_id)
      assert_not_equal cohort, @cohort
      assert_equal cohort.districts.first, @cohort.districts.first

      assert_equal (1..5).map {|x| "Teacher #{x}"}, cohort.teachers.map {|x| x[:name]}
    end

    test 'Can create Cohort without providing list of acceptable districts' do
      post :create, cohort: {name: 'Cohort name'}
      assert_response :success

      assert_equal 'Cohort name', assigns(:cohort).name
      assert_equal [], assigns(:cohort).districts
    end

    test 'Create Cohort from a list, including existing teacher account' do
      # Add existing teacher account to teacher info list
      teacher = create(:teacher, district: @cohort.districts.first)
      extra_teacher_params = [{ops_first_name: 'Hey', ops_last_name: 'Blah', email: teacher.email, district: teacher.district.name}]

      # Only 5 new teachers created, not 6
      assert_difference ->{User.count}, 5 do
        assert_difference ->{Cohort.count} do
          post :create, cohort: {name: 'Cohort name',
            district_names: [@cohort.districts.first.name],
            teachers: teacher_params + extra_teacher_params}
        end
      end
      assert_response :success
      teachers = Cohort.last.teachers

      # did not change display name of existing teacher
      assert_equal teacher.name, teacher.reload.name
      
      # Existing teacher added to cohort along with new teachers
      assert_equal (teacher_params + extra_teacher_params).map{|x| x[:ops_first_name]}.sort, teachers.map{|x| x.ops_first_name}.sort
      assert_equal (teacher_params + extra_teacher_params).map{|x| x[:ops_last_name]}.sort, teachers.map{|x| x.ops_last_name}.sort
    end

    test 'read cohort info' do
      assert_routing({ path: "#{API}/cohorts/1", method: :get }, { controller: 'ops/cohorts', action: 'show', id: '1' })

      get :show, id: @cohort.id
      assert_response :success
      response = JSON.parse(@response.body)
      assert_equal response['id'], @cohort.id
      # Ensure extra association info is provided in the right format
      assert_equal response['districts'].map{|d|d['id']}, @cohort.district_ids
    end

    test 'update cohort info' do
      assert_routing({ path: "#{API}/cohorts/1", method: :patch }, { controller: 'ops/cohorts', action: 'update', id: '1' })

      new_name = 'New cohort name'
      patch :update, id: @cohort.id, cohort: {name: new_name}

      get :show, id: @cohort.id
      assert_equal new_name, JSON.parse(@response.body)['name']
      assert_response :success
    end

    test 'delete cohort' do
      assert_routing({ path: "#{API}/cohorts/1", method: :delete }, { controller: 'ops/cohorts', action: 'destroy', id: '1' })

      assert_difference 'Cohort.count', -1 do
        delete :destroy, id: @cohort.id
      end
      assert_response :success
    end
  end
end
