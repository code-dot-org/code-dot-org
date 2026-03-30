require 'test_helper'

class JitPlExemplarsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup_all do
    @levelbuilder = create(:levelbuilder)
    @concept = create(:jit_pl_concept)
    @misconception = create(:jit_pl_misconception, jit_pl_concept: @concept)
    @concept_exemplar = create(:jit_pl_exemplar, jit_pl_concept: @concept)
    @misconception_exemplar = create(:jit_pl_exemplar, jit_pl_misconception: @misconception)
  end

  # Authorization for concept-level exemplars
  test_user_gets_response_for :create, params: -> {{jit_pl_concept_id: @concept.id, name: 'ex-1'}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :create, params: -> {{jit_pl_concept_id: @concept.id, name: 'ex-1'}}, user: :student, response: :forbidden
  test_user_gets_response_for :create, params: -> {{jit_pl_concept_id: @concept.id, name: 'ex-1'}}, user: :teacher, response: :forbidden

  test_user_gets_response_for :update, method: :put, params: -> {{jit_pl_concept_id: @concept.id, id: @concept_exemplar.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :update, method: :put, params: -> {{jit_pl_concept_id: @concept.id, id: @concept_exemplar.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :update, method: :put, params: -> {{jit_pl_concept_id: @concept.id, id: @concept_exemplar.id}}, user: :teacher, response: :forbidden

  test_user_gets_response_for :destroy, method: :delete, params: -> {{jit_pl_concept_id: @concept.id, id: @concept_exemplar.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :destroy, method: :delete, params: -> {{jit_pl_concept_id: @concept.id, id: @concept_exemplar.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :destroy, method: :delete, params: -> {{jit_pl_concept_id: @concept.id, id: @concept_exemplar.id}}, user: :teacher, response: :forbidden

  test 'creating a concept exemplar saves it and writes serialization' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once

    post :create, params: {jit_pl_concept_id: @concept.id, name: 'new-exemplar', exemplar_type: 'good', text_content: 'Nice code'}
    assert_response :ok

    data = JSON.parse(response.body)
    assert_equal 'new-exemplar', data['name']
    assert_equal 'good', data['exemplar_type']
    assert_equal 'Nice code', data['text_content']
  end

  test 'creating an exemplar returns 400 when invalid' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)
    JitPlExemplar.any_instance.stubs(:save).returns(false)

    post :create, params: {jit_pl_concept_id: @concept.id, name: 'bad'}
    assert_response :bad_request
  end

  test 'updating a concept exemplar saves it and writes serialization' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once

    put :update, params: {jit_pl_concept_id: @concept.id, id: @concept_exemplar.id, name: 'updated', exemplar_type: 'bad'}
    assert_response :ok

    @concept_exemplar.reload
    assert_equal 'updated', @concept_exemplar.name
    assert_equal 'bad', @concept_exemplar.exemplar_type
  end

  test 'update returns serialized exemplar as JSON' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)

    put :update, params: {jit_pl_concept_id: @concept.id, id: @concept_exemplar.id, name: 'renamed'}
    assert_response :ok

    data = JSON.parse(response.body)
    assert_equal @concept_exemplar.id, data['id']
    assert_equal 'renamed', data['name']
  end

  test 'resources are saved when updating a concept exemplar' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)
    resource = create(:resource)

    put :update, params: {jit_pl_concept_id: @concept.id, id: @concept_exemplar.id, resource_ids: [resource.id]}
    assert_response :ok

    @concept_exemplar.reload
    assert_equal [resource.id], @concept_exemplar.resources.map(&:id)
  end

  test 'destroying a concept exemplar deletes it and writes serialization' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once
    exemplar_to_delete = create(:jit_pl_exemplar, jit_pl_concept: @concept)

    delete :destroy, params: {jit_pl_concept_id: @concept.id, id: exemplar_to_delete.id}
    assert_response :ok

    assert_raises ActiveRecord::RecordNotFound do
      exemplar_to_delete.reload
    end
  end

  test 'creating a misconception exemplar saves it and writes serialization' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once

    post :create, params: {jit_pl_concept_id: @concept.id, jit_pl_misconception_id: @misconception.id, name: 'misc-exemplar', exemplar_type: 'neutral'}
    assert_response :ok

    data = JSON.parse(response.body)
    assert_equal 'misc-exemplar', data['name']
  end

  test 'updating a misconception exemplar saves it and writes serialization' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once

    put :update, params: {jit_pl_concept_id: @concept.id, jit_pl_misconception_id: @misconception.id, id: @misconception_exemplar.id, name: 'updated-misc-exemplar'}
    assert_response :ok

    @misconception_exemplar.reload
    assert_equal 'updated-misc-exemplar', @misconception_exemplar.name
  end

  test 'destroying a misconception exemplar deletes it and writes serialization' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once
    exemplar_to_delete = create(:jit_pl_exemplar, jit_pl_misconception: @misconception)

    delete :destroy, params: {jit_pl_concept_id: @concept.id, jit_pl_misconception_id: @misconception.id, id: exemplar_to_delete.id}
    assert_response :ok

    assert_raises ActiveRecord::RecordNotFound do
      exemplar_to_delete.reload
    end
  end

  test 'returns 404 when concept not found' do
    sign_in @levelbuilder
    post :create, params: {jit_pl_concept_id: 0, name: 'x'}
    assert_response :not_found
  end

  test 'returns 404 when misconception not found' do
    sign_in @levelbuilder
    post :create, params: {jit_pl_concept_id: @concept.id, jit_pl_misconception_id: 0, name: 'x'}
    assert_response :not_found
  end

  test 'returns 404 when exemplar not found' do
    sign_in @levelbuilder
    put :update, params: {jit_pl_concept_id: @concept.id, id: 0}
    assert_response :not_found
  end
end
