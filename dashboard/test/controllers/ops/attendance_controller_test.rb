require 'test_helper'
module Ops
  class AttendancesControllerTest < ::ActionController::TestCase
    include Devise::TestHelpers
    tests WorkshopAttendanceController

    setup do
      @admin = create :admin
      sign_in @admin
      @attendance = create(:attendance)
    end

    test 'District Contact can view attendance for all workshops in a cohort' do

    end

    test 'District Contact can view attendance per teacher' do

    end

    test "Facilitators can mark attendance for each workshop's time slot" do
      #87055176

    end

    # Test index + CRUD controller actions

    test 'Ops team can list all attendance' do
      assert_routing({ path: 'ops/segments/1/attendance', method: :get }, { controller: 'ops/workshop_attendance', action: 'index', segment_id: '1'})

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
      assert_routing({ path: 'ops/segments/1/attendance', segment_id: '1', method: :post }, { controller: 'ops/workshop_attendance', segment_id: '1', action: 'create' })

      assert_difference 'WorkshopAttendance.count' do
        workshop_teacher = @attendance.segment.workshop.teachers.first.id
        post :create, segment_id: @attendance.segment.id, workshop_attendance: {teacher_id: workshop_teacher, status: 'present'}
      end
      assert_response :success
    end

    test 'read attendance info' do
      assert_routing({ path: 'ops/attendance/1', method: :get }, { controller: 'ops/workshop_attendance', action: 'show', id: '1' })

      get :show, id: @attendance.id
      assert_response :success
    end

    test 'Ops team can update attendance info' do
      assert_routing({ path: 'ops/attendance/1', method: :patch }, { controller: 'ops/workshop_attendance', action: 'update', id: '1' })

      new_status = 'tardy'
      patch :update, id: @attendance.id, workshop_attendance: {status: new_status}

      get :show, id: @attendance.id
      assert_equal new_status, JSON.parse(@response.body)['status']
      assert_response :success
    end

    test 'delete attendance' do
      assert_routing({ path: 'ops/attendance/1', method: :delete }, { controller: 'ops/workshop_attendance', action: 'destroy', id: '1' })

      assert_difference 'WorkshopAttendance.count', -1 do
        delete :destroy, id: @attendance.id
      end
      assert_response :success
    end
  end
end
