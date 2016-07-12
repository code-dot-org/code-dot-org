require 'test_helper'
module Ops
  class WorkshopsControllerTest < ::ActionController::TestCase
    include Devise::TestHelpers
    API = ::OPS::API

    setup do
      @admin = create(:admin)
      @workshop = create(:workshop)
      @cohort = @workshop.cohorts.first
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
      sign_in @workshop.facilitators.first
      get :index
      assert_response :success
      assert_equal 1, JSON.parse(@response.body).length
    end

    test "Facilitators can list all teachers in their workshop's cohorts" do
      #87055150 (part 2)
      # first name, last name, email, district, gender and any workshop details that are available for teachers
      assert_routing({ path: "#{API}/workshops/1/teachers", method: :get }, { controller: 'ops/workshops', action: 'teachers', id: '1' })

      sign_in @workshop.facilitators.first
      get :teachers, id: @workshop.id
      assert_response :success
      assert_equal @cohort.teachers.count, assigns(:workshop).teachers.count
    end

    test "Facilitators can add unexpected teachers to a workshop" do
      sign_in @workshop.facilitators.first
      unexpected_teacher_1 = create(:teacher, district_id: @district.id, ops_first_name: 'Laurel', ops_last_name: 'X', email: 'laurel_x@example.xx', ops_school: 'Washington Elementary', ops_gender: 'Female')
      unexpected_teacher_2 = create(:teacher, district_id: @district.id, ops_first_name: 'Laurel', ops_last_name: 'Y', email: 'laurel_y@example.yy', ops_school: 'Washington Elementary', ops_gender: 'Female')
      unexpected_teacher_params = [
          {email: unexpected_teacher_1.email},
          {email: unexpected_teacher_2.email}]
      workshop_params = {"unexpected_teachers" => unexpected_teacher_params}
      put :update, id: @workshop.id, workshop: workshop_params
      @workshop.reload
      assert_equal [unexpected_teacher_1, unexpected_teacher_2], @workshop.unexpected_teachers

      assert !ActionMailer::Base.deliveries.empty?
      # the notification to the ops team
      mail = ActionMailer::Base.deliveries.last
      assert_equal ['ops@code.org'], mail.to
      assert_equal "[ops notification] #{@workshop.facilitators.first.email} has added unexpected teachers to #{@workshop.name}", mail.subject
    end

    test 'Ops team can add multiple cohorts to a workshop' do
      sign_in @admin
      another_cohort = create(:cohort)
      workshop_params = {"id" => @workshop.id, "name" => @workshop.name, "program_type" => "5", "location" => @workshop.location, "instructions" => nil, "cohorts" => [{"id" => @cohort.id}, {"id" => another_cohort.id}], "facilitators" => nil, "teachers" => nil}
      patch :update, id: @workshop.id, workshop: workshop_params
      assert_response :success
      @workshop.reload
      assert_equal [@cohort, another_cohort], @workshop.cohorts
    end

    test 'District contacts can view all workshops in all cohorts in their district' do
      #87054994 (part 1)
      sign_in @district.contact
      get :index
      assert_response :success
      assert_equal 1, JSON.parse(@response.body).length
    end

    # Test index + CRUD controller actions

    test 'list all workshops' do
      sign_in @admin

      assert_routing({ path: "#{API}/workshops", method: :get }, { controller: 'ops/workshops', action: 'index' })

      get :index
      assert_response :success

      assert_equal Workshop.count, JSON.parse(@response.body).length
    end

    test 'Ops team can create workshops' do
      sign_in @admin
      #87054134
      assert_routing({ path: "#{API}/workshops", method: :post }, { controller: 'ops/workshops', action: 'create' })

      facilitator_params = [
                         {ops_first_name: 'Laurel', ops_last_name: 'X', email: 'fac@email.xx'}]

      assert_creates(Workshop, User) do
        post :create, workshop: {name: 'test workshop', program_type: '1', cohorts: [{id: @cohort.id}], facilitators: facilitator_params}
      end
      assert_response :success

      # created a facilitator
      workshop = Workshop.last.reload
      user = User.last
      assert user.facilitator?
      assert_equal [user], workshop.facilitators
      assert_equal [workshop], user.workshops_as_facilitator
    end

    test 'ops team can add facilitators to workshops' do
      sign_in @admin

      assert_routing({ path: "#{API}/workshops/1", method: :patch }, { controller: 'ops/workshops', action: 'update', id: '1' })

      facilitator_params = @workshop.facilitators.map {|facilitator| {ops_first_name: facilitator.name, email: facilitator.email, id: facilitator.id}}
      facilitator_params += [
                         {ops_first_name: 'Laurel', ops_last_name: 'X', email: 'fac@email.xx'}]

      assert_creates(User) do
        assert_difference('@workshop.reload.facilitators.count') do
          patch :update, id: @workshop.id, workshop: {facilitators: facilitator_params}
        end
      end

      # created a facilitator
      user = User.last
      assert user.facilitator?
      assert @workshop.facilitators.include? user
      assert_equal [@workshop], user.workshops_as_facilitator
    end

    test 'read workshop info' do
      sign_in @admin
      assert_routing({ path: "#{API}/workshops/1", method: :get }, { controller: 'ops/workshops', action: 'show', id: '1' })

      get :show, id: @workshop.id
      assert_response :success
    end

    test 'update workshop info' do
      sign_in @admin
      assert_routing({ path: "#{API}/workshops/1", method: :patch }, { controller: 'ops/workshops', action: 'update', id: '1' })

      new_name = 'New workshop name'
      patch :update, id: @workshop.id, workshop: {name: new_name}

      get :show, id: @workshop.id
      assert_equal new_name, JSON.parse(@response.body)['name']
      assert_response :success
    end

    test 'delete workshop' do
      sign_in @admin
      assert_routing({ path: "#{API}/workshops/1", method: :delete }, { controller: 'ops/workshops', action: 'destroy', id: '1' })

      assert_difference 'Workshop.count', -1 do
        get :destroy, id: @workshop.id
      end
      assert_response :success
    end

    # Access tests
    test 'Anonymous users cannot affect workshops' do
      all_forbidden
    end

    test 'Logged-in teachers cannot affect workshops' do
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
