require 'test_helper'
module Ops
  class SegmentsControllerTest < ::ActionController::TestCase
    include Devise::Test::ControllerHelpers
    API = ::OPS::API

    setup do
      @admin = create(:admin)
      sign_in @admin
      @segment = create(:segment)
      @workshop = @segment.workshop
    end

    # Test index + CRUD controller actions

    test 'list all segments' do
      assert_routing({path: "#{API}/workshops/1/segments", method: :get}, {controller: 'ops/segments', action: 'index', workshop_id: '1'})

      get :index, params: {workshop_id: @workshop.id}
      assert_response :success
    end

    test 'Ops team can create segments' do
      #87054134
      assert_routing({path: "#{API}/workshops/1/segments", method: :post}, {controller: 'ops/segments', action: 'create', workshop_id: '1'})

      assert_difference 'Segment.count' do
        post :create, params: {
          workshop_id: @workshop.id,
          segment: {start: DateTime.now, end: DateTime.now + 1.day}
        }
      end
      assert_response :success
    end

    test 'read segment info' do
      assert_routing({path: "#{API}/segments/1", method: :get}, {controller: 'ops/segments', action: 'show', id: '1'})

      get :show, params: {id: @segment.id}
      assert_response :success
    end

    test 'update segment info' do
      assert_routing({path: "#{API}/segments/1", method: :patch}, {controller: 'ops/segments', action: 'update', id: '1'})

      start_time = DateTime.now
      patch :update, params: {id: @segment.id, segment: {start: start_time}}

      get :show, params: {id: @segment.id}
      assert_response :success

      # Compare DateTime#to_i because separately-parsed DateTime objects are not equal
      assert_equal start_time.to_i, DateTime.parse(JSON.parse(@response.body)['start']).to_i
    end

    test 'delete segment' do
      assert_routing({path: "#{API}/segments/1", method: :delete}, {controller: 'ops/segments', action: 'destroy', id: '1'})

      assert_difference 'Segment.count', -1 do
        get :destroy, params: {id: @segment.id}
      end
      assert_response :success
    end

    # Access tests
    test 'Anonymous users cannot affect segments' do
      sign_out @admin
      all_forbidden
    end

    test 'Logged-in teachers cannot affect segments' do
      sign_out @admin
      sign_in create(:user)
      all_forbidden
    end

    def all_forbidden
      get :index, params: {workshop_id: @workshop.id}
      assert_response :forbidden
      get :show, params: {id: @segment.id}
      assert_response :forbidden
    end
  end
end
