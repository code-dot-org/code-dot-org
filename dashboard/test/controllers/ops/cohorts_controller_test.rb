require 'test_helper'
module Ops
  class CohortsControllerTest < ::ActionController::TestCase
    include Devise::TestHelpers
    API = ::OPS::API

    setup do
      @admin = create :admin
      @cohorts_district = create(:cohorts_district)
      @cohort = @cohorts_district.cohort
      @district = @cohorts_district.district
    end

    test 'district contact can add teachers to a cohort' do
      @cohort.teachers << create(:teacher, district_id: @district.id)
      @cohort.save!

      new_cohorts_district = create(:cohorts_district, cohort: @cohort)
      new_district = new_cohorts_district.district

      @cohort.reload

      # we already have a teacher from the old district
      assert_equal 1, @cohort.teachers.count
      assert_equal 2, @cohort.districts.count

      sign_in new_district.contact
      #87054720 (part 1)
      #can click "Add Teacher" button to add a teacher
      assert_routing({ path: "#{API}/cohorts/1", method: :patch }, { controller: 'ops/cohorts', action: 'update', id: '1' })

      teacher_params = [
                         {ops_first_name: 'Laurel', ops_last_name: 'X', email: 'laurel_x@example.xx', district: new_district.name, ops_school: 'Washington Elementary', ops_gender: 'Female'},
                         {ops_first_name: 'Laurel', ops_last_name: 'Y', email: 'laurel_y@example.xx', district: new_district.name, ops_school: 'Jefferson Middle School', ops_gender: 'Male'}
                        ]

      # we add these two new teachers and did not remove the old ones
      assert_difference('@cohort.reload.teachers.count', 2) do
        assert_difference('User.count', 2) do
          assert_no_difference('@cohort.reload.districts.count') do
            patch :update, id: @cohort.id, cohort: {teachers: teacher_params}
          end
        end
      end

      assert_response :success

      last_user = User.last
      assert_equal 'Male', last_user.ops_gender
      assert_equal 'Jefferson Middle School', last_user.ops_school
      assert_equal 'Jefferson Middle School', last_user.school

      assert !ActionMailer::Base.deliveries.empty?

      # the notification to the ops team
      mail = ActionMailer::Base.deliveries.last
      assert_equal ['ops@code.org'], mail.to
      assert_equal "[ops notification] #{@district.contact.ops_first_name} #{@district.contact.ops_last_name} modified #{@cohort.name}", mail.subject
    end

    test 'adding existing under 13 user to a cohort makes them adult and teacher' do
      sign_in @district.contact
      #87054720 (part 1)
      #can click "Add Teacher" button to add a teacher
      assert_routing({ path: "#{API}/cohorts/1", method: :patch }, { controller: 'ops/cohorts', action: 'update', id: '1' })

      existing_email = "existing@email.xx"
      under_13_user = create(:student, age: 10, email: existing_email)
      assert under_13_user.email.blank?
      assert under_13_user.hashed_email.present?

      teacher_params = @cohort.teachers.map {|teacher| {ops_first_name: teacher.name, email: teacher.email, id: teacher.id}}
      teacher_params += [
                         {ops_first_name: 'Laurel', ops_last_name: 'X', email: existing_email, district: @district.name, ops_school: 'Washington Elementary', ops_gender: 'Female'}]

      assert_difference('@cohort.reload.teachers.count', 1) do
        assert_difference('User.count', 0) do
          patch :update, id: @cohort.id, cohort: {teachers: teacher_params}
        end
      end

      assert_response :success

      under_13_user = under_13_user.reload
      assert_equal '21+', under_13_user.age
      assert under_13_user.teacher?
      assert_equal existing_email, under_13_user.email
    end

    test 'district contact can drop teachers in their district from a cohort' do
      sign_in @district.contact

      @cohort.teachers << create(:teacher)
      @cohort.save!

      assert_difference '@cohort.teachers.count', -1 do
        assert_difference '@cohort.deleted_teachers.count', 1 do
          delete :destroy_teacher, id: @cohort.id, teacher_id: @cohort.teachers.first.id
        end
      end
      assert_response :success

      assert !ActionMailer::Base.deliveries.empty?

      # the notification to the ops team
      mail = ActionMailer::Base.deliveries.last
      assert_equal ['ops@code.org'], mail.to
      assert_equal "[ops notification] #{@district.contact.ops_first_name} #{@district.contact.ops_last_name} modified #{@cohort.name}", mail.subject
    end

    test 'district contact can re-add teachers in their district from deleted teachers' do
      sign_in @district.contact

      teacher = create(:teacher)
      @cohort.deleted_teachers << teacher
      @cohort.teachers << create(:teacher)
      @cohort.teachers << create(:teacher)
      @cohort.save!

      teacher_params = (@cohort.teachers + [teacher]).map {|t| {ops_first_name: t.name, email: t.email, id: t.id}}

      assert_difference '@cohort.teachers.count', 1 do # added to teachers
        assert_difference '@cohort.deleted_teachers.count', -1 do # removed from deleted teachers
          patch :update, id: @cohort.id, cohort: {teachers: teacher_params}
        end
      end
      assert_response :success

      assert !ActionMailer::Base.deliveries.empty?

      # the notification to the ops team
      mail = ActionMailer::Base.deliveries.last
      assert_equal ['ops@code.org'], mail.to
      assert_equal "[ops notification] #{@district.contact.ops_first_name} #{@district.contact.ops_last_name} modified #{@cohort.name}", mail.subject
    end

    test 'district contact cannot add/drop teachers in other districts' do
      sign_in @district.contact
      #87054720 (part 3)
      # todo
    end

      # Test index + CRUD controller actions

    test 'Ops team can list all cohorts' do
      sign_in @admin

      cohorts = [create(:cohort), create(:cohort), create(:cohort)]
      assert_routing({ path: "#{API}/cohorts", method: :get }, { controller: 'ops/cohorts', action: 'index' })

      get :index
      assert_response :success

      assert_equal cohorts.count + 1, assigns(:cohorts).count # cohorts created in this test + cohort created in setup
    end

    test 'district contact can list their districts cohorts' do
      cd = create :cohorts_district
      cohort = cd.cohort

      # 2nd that we will add the same district as the 1st
      cohort2 = create :cohort
      cohort2 = cohort2.reload
      cohort2.districts << cohort.districts.first
      cohort2.save!

      dc = cohort.districts.first.contact
      assert dc

      sign_in dc

      get :index
      assert_response :success
      assert_equal [cohort, cohort2], assigns(:cohorts) # only the cohorts for this district
    end

    test 'district contact can show their districts cohorts and see only their district' do
      # set up a cohort with 2 districts and 2 teachers from different districts

      cd = create :cohorts_district
      cohort = cd.cohort
      contact = cd.district.contact
      assert contact

      invisible_cd = create(:cohorts_district, cohort: cohort)
      assert contact != invisible_cd.district.contact

      cohort = cohort.reload
      assert_equal 2, cohort.districts.count

      cohort.teachers << create(:teacher, district_id: cd.district.id)
      cohort.teachers << create(:teacher, district_id: invisible_cd.district.id)

      cohort.deleted_teachers << create(:teacher, district_id: cd.district.id)
      cohort.deleted_teachers << create(:teacher, district_id: cd.district.id)
      cohort.deleted_teachers << create(:teacher, district_id: invisible_cd.district.id)
      cohort.save!

      cohort = cohort.reload
      assert_equal 2, cohort.teachers.count
      assert_equal 3, cohort.deleted_teachers.count

      sign_in contact

      assert_no_difference('cohort.reload.districts.count') do
        get :show, id: cohort.id
      end
      assert_response :success
      assert_equal cohort, assigns(:cohort)

      cohort_json = JSON.parse(@response.body)

      # cohort has 2 districts but we only see 1
      assert_equal 1, cohort_json['districts'].count

      # cohort has 2 teachers but we only see 1
      assert_equal 1, cohort_json['teachers'].count

      # cohort has 3 deleted teachers but we only see 2
      assert_equal 2, cohort_json['deleted_teachers'].count

    end

    test 'district contact cannot show cohorts without their district' do
      create :cohort # this one is not accessible

      cd = create :cohorts_district
      cohort = cd.cohort

      dc = cohort.districts.first.contact
      assert dc

      sign_in dc

      get :show, id: @cohort.id # not accessible
      assert_response :forbidden
    end

    test 'Anonymous users cannot affect cohorts' do
      all_forbidden
    end

    test 'Logged-in teachers cannot affect cohorts' do
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
      sign_in @admin
      #87054348
      assert_routing({ path: "#{API}/cohorts", method: :post }, { controller: 'ops/cohorts', action: 'create' })

      assert_difference 'Cohort.count' do
        post :create, cohort: {name: 'Cohort name'}
      end
      assert_response :success
    end

    def teacher_params
      (1..5).map do |x|
        {ops_first_name: 'Teacher', ops_last_name: "#{x}", email: "teacher_#{x}@school.edu", district: @district.name}
      end
    end

    test 'Ops team can create a Cohort from a list of teacher information' do
      sign_in @admin
      #87054348 (part 2)
      assert_difference 'User.count', 5 do
        assert_creates(Cohort, CohortsDistrict) do
          post :create, cohort: {name: 'Cohort name', districts: [{id: @district.id}], teachers: teacher_params}
        end
      end
      assert_response :success

      # Ensure that the returned Cohort JSON object contains the provided District and teacher info
      cohort_json = JSON.parse(@response.body)
      assert_not_equal @cohort.id, cohort_json[:id]
      assert_equal @district.id, cohort_json['districts'].first['id']

      assert_equal (1..5).map(&:to_s), cohort_json['teachers'].map {|x| x['ops_last_name']}

      # district info is included
      expected_district = {'name' => @district.name, 'id' => @district.id, 'location' => @district.location}
      assert_equal expected_district, cohort_json['teachers'].first['district']

      # no notification to the ops team
      assert ActionMailer::Base.deliveries.collect(&:subject).none? {|subject| subject.include? '[ops notification]'}
      # all account confirmation instructions
      assert ActionMailer::Base.deliveries.collect(&:subject).all? {|subject| subject =~ /instructions/}
    end

    test 'Create Cohort with districts' do
      sign_in @admin

      d1 = create(:district)
      d2 = create(:district)

      post :create, cohort: {name: 'Cohort name', districts: [{id: d1.id, max_teachers: 3}, {id: d2.id, max_teachers: 5}], teachers: teacher_params}
      assert_response :success

      cohort_id = JSON.parse(@response.body)['id']
      cohort = Cohort.find(cohort_id)
      assert_not_equal cohort, @cohort

      # new teachers
      assert_equal (1..5).map {|x| "Teacher #{x}"}, cohort.teachers.map {|x| x[:name]}

      # only the two new destricts
      assert_equal [d1, d2], cohort.districts
    end

    test 'update Cohort with districts' do
      sign_in @admin

      d1 = create(:district)
      d2 = create(:district)

      put :update, id: @cohort.id, cohort: {name: 'Cohort name', districts: [{id: @district.id, _destroy: 1}, {id: d1.id, max_teachers: 3}, {id: d2.id, max_teachers: 5}]}
      assert_response :success

      # only the two new districts
      assert_equal [d1, d2], @cohort.reload.districts.to_a
    end

    test 'district contact cannot update cohort districts' do
      sign_in @district.contact

      old_districts = @cohort.districts.to_a
      d1 = create(:district)
      d2 = create(:district)

      assert_no_difference('@cohort.reload.districts.count') do
        assert_no_difference('CohortsDistrict.count') do
          put :update, id: @cohort.id, cohort: {name: 'Cohort name', districts: [{id: @district.id, _destroy: 1}, {id: d1.id, max_teachers: 3}, {id: d2.id, max_teachers: 5}]}
        end
      end
      assert_response :success

      # only the two new districts
      assert_equal old_districts, @cohort.reload.districts
    end

    test 'updating Cohort with existing district updates count' do
      sign_in @admin

      put :update, id: @cohort.id, cohort: {name: 'Cohort name', districts: [{id: @district.id, max_teachers: 8}]}
      assert_response :success

      # only the two new districts
      assert_equal [8], @cohort.reload.cohorts_districts.collect(&:max_teachers)
    end

    test 'Can create Cohort without providing list of acceptable districts' do
      sign_in @admin

      post :create, cohort: {name: 'Cohort name'}
      assert_response :success

      assert_equal 'Cohort name', assigns(:cohort).name
      assert_equal [], assigns(:cohort).districts
    end

    test 'Create Cohort from a list, including existing teacher account' do
      sign_in @admin

      # Add existing teacher account to teacher info list
      teacher = create(:teacher, district_id: @district.id)
      extra_teacher_params = [{ops_first_name: 'Hey', ops_last_name: 'Blah', email: teacher.email, district: teacher.district.name}]

      # Only 5 new teachers created, not 6
      assert_difference ->{User.count}, 5 do
        assert_creates(Cohort, CohortsDistrict) do
          post :create, cohort: {name: 'Cohort name',
            districts: [{id: @district.id, max_teachers: 5}],
            teachers: teacher_params + extra_teacher_params}
        end
      end
      assert_response :success
      teachers = Cohort.last.teachers

      # did not change display name of existing teacher
      assert_equal teacher.name, teacher.reload.name

      # Existing teacher added to cohort along with new teachers
      assert_equal (teacher_params + extra_teacher_params).map{|x| x[:ops_first_name]}.sort, teachers.map(&:ops_first_name).sort
      assert_equal (teacher_params + extra_teacher_params).map{|x| x[:ops_last_name]}.sort, teachers.map(&:ops_last_name).sort
      cd = CohortsDistrict.last
      assert_equal @district, cd.district
      assert_equal Cohort.last, cd.cohort
      assert_equal 5, cd.max_teachers
    end

    test 'read cohort info' do
      sign_in @admin

      assert_routing({ path: "#{API}/cohorts/1", method: :get }, { controller: 'ops/cohorts', action: 'show', id: '1' })

      get :show, id: @cohort.id
      assert_response :success
      response = JSON.parse(@response.body)
      assert_equal response['id'], @cohort.id
      # Ensure extra association info is provided in the right format
      assert_equal response['districts'].map{|d|d['id']}, @cohort.district_ids
    end

    test 'ops team can list teachers in a cohort as a csv' do
      teacher1 = create(:teacher, ops_first_name: '1', ops_last_name: '2', district_id: @district.id)
      teacher2 = create(:teacher, ops_first_name: '3', ops_last_name: '4', district_id: @district.id)
      @cohort.teachers << teacher1
      @cohort.teachers << teacher2
      @cohort.save!

      sign_in @admin

      assert_routing({ path: "#{API}/cohorts/1/teachers.csv", method: :get }, { controller: 'ops/cohorts', action: 'teachers', id: '1',  format: 'csv'})
      get :teachers, id: @cohort.id, format: 'csv'

      expected_response = <<EOS
id,email,ops_first_name,ops_last_name,district_name,ops_school,ops_gender
#{teacher1.id},#{teacher1.email},1,2,#{@district.name},,
#{teacher2.id},#{teacher2.email},3,4,#{@district.name},,
EOS
      assert_equal expected_response, @response.body
    end

    test 'update cohort info' do
      sign_in @admin

      assert_routing({ path: "#{API}/cohorts/1", method: :patch }, { controller: 'ops/cohorts', action: 'update', id: '1' })

      new_name = 'New cohort name'
      script = Script.find_by_name('ECSPD')
      patch :update, id: @cohort.id, cohort: {name: new_name, script_id: script.id}

      get :show, id: @cohort.id
      assert_equal new_name, JSON.parse(@response.body)['name']
      assert_equal script.id, JSON.parse(@response.body)['script_id']
      assert_response :success
    end

    test 'delete cohort' do
      sign_in @admin

      assert_routing({ path: "#{API}/cohorts/1", method: :delete }, { controller: 'ops/cohorts', action: 'destroy', id: '1' })

      assert_difference 'Cohort.count', -1 do
        delete :destroy, id: @cohort.id
      end
      assert_response :success
    end
  end
end
