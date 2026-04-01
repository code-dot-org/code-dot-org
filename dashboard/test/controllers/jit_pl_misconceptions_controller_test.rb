require 'test_helper'

class JitPlMisconceptionsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup_all do
    @levelbuilder = create(:levelbuilder)
    @concept = create(:jit_pl_concept)
    @misconception = create(:jit_pl_misconception, jit_pl_concept: @concept)
  end

  test_user_gets_response_for :create, params: -> {{jit_pl_concept_id: @concept.id, name: 'unique-name'}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :create, params: -> {{jit_pl_concept_id: @concept.id, name: 'unique-name'}}, user: :student, response: :forbidden
  test_user_gets_response_for :create, params: -> {{jit_pl_concept_id: @concept.id, name: 'unique-name'}}, user: :teacher, response: :forbidden

  test_user_gets_response_for :update, method: :put, params: -> {{jit_pl_concept_id: @concept.id, id: @misconception.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :update, method: :put, params: -> {{jit_pl_concept_id: @concept.id, id: @misconception.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :update, method: :put, params: -> {{jit_pl_concept_id: @concept.id, id: @misconception.id}}, user: :teacher, response: :forbidden

  test_user_gets_response_for :destroy, method: :delete, params: -> {{jit_pl_concept_id: @concept.id, id: @misconception.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :destroy, method: :delete, params: -> {{jit_pl_concept_id: @concept.id, id: @misconception.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :destroy, method: :delete, params: -> {{jit_pl_concept_id: @concept.id, id: @misconception.id}}, user: :teacher, response: :forbidden

  test 'creating a misconception saves it and writes serialization' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once

    post :create, params: {jit_pl_concept_id: @concept.id, name: 'new-misconception', text_content: 'Some text'}
    assert_response :ok

    data = JSON.parse(response.body)
    assert_equal 'new-misconception', data['name']
    assert_equal 'Some text', data['text_content']
  end

  test 'creating a misconception returns 400 when invalid' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)
    JitPlMisconception.any_instance.stubs(:save).returns(false)

    post :create, params: {jit_pl_concept_id: @concept.id, name: 'bad'}
    assert_response :bad_request
  end

  test 'updating a misconception saves it and writes serialization' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once

    put :update, params: {jit_pl_concept_id: @concept.id, id: @misconception.id, name: 'updated-name', text_content: 'Updated text'}
    assert_response :ok

    @misconception.reload
    assert_equal 'updated-name', @misconception.name
    assert_equal 'Updated text', @misconception.text_content
  end

  test 'update returns serialized misconception as JSON' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)

    put :update, params: {jit_pl_concept_id: @concept.id, id: @misconception.id, name: 'renamed'}
    assert_response :ok

    data = JSON.parse(response.body)
    assert_equal @misconception.id, data['id']
    assert_equal 'renamed', data['name']
  end

  test 'resources are saved when updating a misconception' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)
    resource = create(:resource)

    put :update, params: {jit_pl_concept_id: @concept.id, id: @misconception.id, resource_ids: [resource.id]}
    assert_response :ok

    @misconception.reload
    assert_equal [resource.id], @misconception.resources.map(&:id)
  end

  test 'resources are removed when updating with empty resource_ids' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)
    resource = create(:resource)
    @misconception.resources << resource

    put :update, params: {jit_pl_concept_id: @concept.id, id: @misconception.id, resource_ids: []}
    assert_response :ok

    @misconception.reload
    assert_empty @misconception.resources
  end

  test 'destroying a misconception deletes it and writes serialization' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once
    misconception_to_delete = create(:jit_pl_misconception, jit_pl_concept: @concept)

    delete :destroy, params: {jit_pl_concept_id: @concept.id, id: misconception_to_delete.id}
    assert_response :ok

    assert_raises ActiveRecord::RecordNotFound do
      misconception_to_delete.reload
    end
  end

  test 'returns 404 when concept not found' do
    sign_in @levelbuilder
    post :create, params: {jit_pl_concept_id: 0, name: 'x'}
    assert_response :not_found
  end

  test 'returns 404 when misconception not found' do
    sign_in @levelbuilder
    put :update, params: {jit_pl_concept_id: @concept.id, id: 0}
    assert_response :not_found
  end
end
