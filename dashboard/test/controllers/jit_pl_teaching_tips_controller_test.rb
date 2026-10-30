require 'test_helper'

class JitPlTeachingTipsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup_all do
    @levelbuilder = create(:levelbuilder)
    @concept = create(:jit_pl_concept)
    @teaching_tip = create(:jit_pl_teaching_tip, jit_pl_concept: @concept)
  end

  test_user_gets_response_for :create, params: -> {{jit_pl_concept_id: @concept.id, name: 'tip-1'}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :create, params: -> {{jit_pl_concept_id: @concept.id, name: 'tip-1'}}, user: :student, response: :forbidden
  test_user_gets_response_for :create, params: -> {{jit_pl_concept_id: @concept.id, name: 'tip-1'}}, user: :teacher, response: :forbidden

  test_user_gets_response_for :update, method: :put, params: -> {{jit_pl_concept_id: @concept.id, id: @teaching_tip.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :update, method: :put, params: -> {{jit_pl_concept_id: @concept.id, id: @teaching_tip.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :update, method: :put, params: -> {{jit_pl_concept_id: @concept.id, id: @teaching_tip.id}}, user: :teacher, response: :forbidden

  test_user_gets_response_for :destroy, method: :delete, params: -> {{jit_pl_concept_id: @concept.id, id: @teaching_tip.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :destroy, method: :delete, params: -> {{jit_pl_concept_id: @concept.id, id: @teaching_tip.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :destroy, method: :delete, params: -> {{jit_pl_concept_id: @concept.id, id: @teaching_tip.id}}, user: :teacher, response: :forbidden

  test 'creating a teaching tip saves it and writes serialization' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once

    post :create, params: {jit_pl_concept_id: @concept.id, name: 'new-tip', text_content: 'Helpful advice'}
    assert_response :ok

    data = JSON.parse(response.body)
    assert_equal 'new-tip', data['name']
    assert_equal 'Helpful advice', data['text_content']
  end

  test 'creating a teaching tip returns 400 when invalid' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)
    JitPlTeachingTip.any_instance.stubs(:save).returns(false)

    post :create, params: {jit_pl_concept_id: @concept.id, name: 'bad'}
    assert_response :bad_request
  end

  test 'updating a teaching tip saves it and writes serialization' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once

    put :update, params: {jit_pl_concept_id: @concept.id, id: @teaching_tip.id, name: 'updated-tip', text_content: 'Updated advice'}
    assert_response :ok

    @teaching_tip.reload
    assert_equal 'updated-tip', @teaching_tip.name
    assert_equal 'Updated advice', @teaching_tip.text_content
  end

  test 'update returns serialized teaching tip as JSON' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)

    put :update, params: {jit_pl_concept_id: @concept.id, id: @teaching_tip.id, name: 'renamed-tip'}
    assert_response :ok

    data = JSON.parse(response.body)
    assert_equal @teaching_tip.id, data['id']
    assert_equal 'renamed-tip', data['name']
  end

  test 'resources are saved when updating a teaching tip' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)
    resource = create(:resource)

    put :update, params: {jit_pl_concept_id: @concept.id, id: @teaching_tip.id, resource_ids: [resource.id]}
    assert_response :ok

    @teaching_tip.reload
    assert_equal [resource.id], @teaching_tip.resources.map(&:id)
  end

  test 'destroying a teaching tip deletes it and writes serialization' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once
    tip_to_delete = create(:jit_pl_teaching_tip, jit_pl_concept: @concept)

    delete :destroy, params: {jit_pl_concept_id: @concept.id, id: tip_to_delete.id}
    assert_response :ok

    assert_raises ActiveRecord::RecordNotFound do
      tip_to_delete.reload
    end
  end

  test 'returns 404 when concept not found' do
    sign_in @levelbuilder
    post :create, params: {jit_pl_concept_id: 0, name: 'x'}
    assert_response :not_found
  end

  test 'returns 404 when teaching tip not found' do
    sign_in @levelbuilder
    put :update, params: {jit_pl_concept_id: @concept.id, id: 0}
    assert_response :not_found
  end
end
