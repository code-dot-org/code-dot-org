require 'test_helper'
module Ops
  class AttendancesControllerTest < ::ActionController::TestCase
    include Devise::TestHelpers
    tests WorkshopAttendanceController
    API = ::OPS::API

    setup do
      @request.headers['Accept'] = 'application/json'
      @admin = create :admin
      sign_in @admin

      @attendance = create(:attendance)
      @cohort = @attendance.segment.workshop.cohort
      @cohort_district = create :cohorts_district, cohort: @cohort
      @cohort = @cohort.reload
    end

    test 'District Contact can view attendance for all workshops in a cohort' do
      #87054994 part 1
      assert_routing({ path: "#{API}/attendance/cohort/1", method: :get}, { controller: 'ops/workshop_attendance', action: 'cohort', cohort_id: '1'})

      sign_out @admin
      cohort = @cohort
      district = cohort.districts.first
      sign_in district.contact

      get :cohort, cohort_id: @attendance.segment.workshop.cohort.id
      assert_response :success
      response = JSON.parse(@response.body)
      assert_equal 'present', response['workshops'].first['segments'].last['attendances'].first['status']
    end

    test 'District Contact can view attendance per teacher in their district' do
      #87054994 part 2
      # Get ALL attendance for a single teacher, grouped by workshop
      assert_routing({ path: "#{API}/attendance/teacher/1", method: :get}, { controller: 'ops/workshop_attendance', action: 'teacher', teacher_id: '1'})

      sign_out @admin
      cohort = @cohort
      district = cohort.districts.first
      sign_in district.contact

      get :teacher, teacher_id: @attendance.teacher.id
      assert_response :success
    end

    test 'District Contact cannot view attendance for teachers not in their district' do
      sign_out @admin

    end

    test 'Facilitators can view attendance for all segments in their workshop' do
      #87055150 (part)
      sign_out @admin
      workshop = @attendance.segment.workshop
      facilitator = workshop.facilitators.first
      sign_in facilitator
      get :workshop, workshop_id: workshop.id
      assert_response :success
    end

    test 'Facilitators can view attendance by teacher for all segments in their workshop' do
      #87055150 (part)
      sign_out @admin
      workshop = @attendance.segment.workshop
      facilitator = workshop.facilitators.first
      sign_in facilitator
      get :workshop, workshop_id: workshop.id, by_teacher: true
      assert_response :success
    end

    test 'Facilitators can mark attendance for each segment' do
      #87055176

      # Facilitator gets a list of all teachers in the workshop (e.g., GET /ops/workshops/1/teachers)
      # Facilitator POSTs an object to the segment path: {attendance => [[id, status], [id, status], ..]}
      assert_routing({ path: "#{API}/segments/1/attendance/batch", method: :post }, { controller: 'ops/workshop_attendance', action: 'batch', segment_id: '1'})

      segment = @attendance.segment

      teacher = create(:teacher)
      cohort = @attendance.segment.workshop.cohort
      cohort.teachers << teacher
      cohort.save!

      post :batch, segment_id: segment.id, attendance: [[teacher.id, 'tardy']]
      assert_response :success
    end

    # Test index + CRUD controller actions

    test 'Ops team can list all attendance' do
      assert_routing({ path: "#{API}/segments/1/attendance", method: :get }, { controller: 'ops/workshop_attendance', action: 'index', segment_id: '1'})

      get :index, segment_id: @attendance.segment.id
      assert_response :success
    end

    test 'Anonymous users cannot affect attendance' do
      sign_out @admin
      all_forbidden
    end

    test 'Logged-in teachers cannot affect attendance' do
      sign_out @admin
      sign_in create(:user)
      all_forbidden
    end

    def all_forbidden
      get :index, segment_id: @attendance.segment.id
      assert_response :forbidden
      post :create, segment_id: @attendance.segment.id, workshop_attendance: {status: 'x'}
      assert_response :forbidden
      get :show, id: @attendance.id
      assert_response :forbidden
      patch :update, id: @attendance.id, workshop_attendance: {status: 'x'}
      assert_response :forbidden
      delete :destroy, id: @attendance.id
      assert_response :forbidden
    end

    test 'Ops team can mark attendance' do
      assert_routing({ path: "#{API}/segments/1/attendance", method: :post }, { controller: 'ops/workshop_attendance', segment_id: '1', action: 'create' })

      assert_difference 'WorkshopAttendance.count' do
        teacher = create(:teacher)
        cohort = @attendance.segment.workshop.cohort
        cohort.teachers << teacher
        cohort.save!

        post :create, segment_id: @attendance.segment.id, workshop_attendance: {teacher_id: teacher, status: 'present'}
      end
      assert_response :success
    end

    test 'read attendance info' do
      assert_routing({ path: "#{API}/attendance/1", method: :get }, { controller: 'ops/workshop_attendance', action: 'show', id: '1' })

      get :show, id: @attendance.id
      assert_response :success
    end

    test 'Ops team can update attendance info' do
      assert_routing({ path: "#{API}/attendance/1", method: :patch }, { controller: 'ops/workshop_attendance', action: 'update', id: '1' })

      new_status = 'tardy'
      patch :update, id: @attendance.id, workshop_attendance: {status: new_status}

      get :show, id: @attendance.id
      assert_equal new_status, JSON.parse(@response.body)['status']
      assert_response :success
    end

    test 'delete attendance' do
      assert_routing({ path: "#{API}/attendance/1", method: :delete }, { controller: 'ops/workshop_attendance', action: 'destroy', id: '1' })

      assert_difference 'WorkshopAttendance.count', -1 do
        delete :destroy, id: @attendance.id
      end
      assert_response :success
    end
  end
end
