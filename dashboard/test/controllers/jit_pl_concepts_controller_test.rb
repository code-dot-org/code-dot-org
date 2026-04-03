require 'test_helper'

class JitPlConceptsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup_all do
    @levelbuilder = create(:levelbuilder)
    @concept = create(:jit_pl_concept, name: 'recursion', display_name: 'Recursion', text_content: 'A function calling itself.')
  end

  # all actions are levelbuilder-only

  test_user_gets_response_for :new, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :new, user: :student, response: :forbidden
  test_user_gets_response_for :new, user: :teacher, response: :forbidden
  test_user_gets_response_for :new, user: :levelbuilder, response: :success

  test_user_gets_response_for :create, params: -> {{name: 'unique-concept'}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :create, params: -> {{name: 'unique-concept'}}, user: :student, response: :forbidden
  test_user_gets_response_for :create, params: -> {{name: 'unique-concept'}}, user: :teacher, response: :forbidden

  test_user_gets_response_for :edit_all, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :edit_all, user: :student, response: :forbidden
  test_user_gets_response_for :edit_all, user: :teacher, response: :forbidden
  test_user_gets_response_for :edit_all, user: :levelbuilder, response: :success

  test_user_gets_response_for :edit, params: -> {{id: @concept.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :edit, params: -> {{id: @concept.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{id: @concept.id}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{id: @concept.id}}, user: :levelbuilder, response: :success

  test_user_gets_response_for :update, method: :put, params: -> {{id: @concept.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :update, method: :put, params: -> {{id: @concept.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :update, method: :put, params: -> {{id: @concept.id}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :update, method: :put, params: -> {{id: @concept.id}}, user: :levelbuilder, response: :success

  test_user_gets_response_for :destroy, method: :delete, params: -> {{id: @concept.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :destroy, method: :delete, params: -> {{id: @concept.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :destroy, method: :delete, params: -> {{id: @concept.id}}, user: :teacher, response: :forbidden

  test 'creating a concept with a duplicate name returns bad request' do
    sign_in @levelbuilder
    post :create, params: {name: @concept.name}
    assert_response :bad_request
  end

  test 'creating a new concept writes serialization and redirects to edit page' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once

    post :create, params: {name: 'new-concept', display_name: 'New Concept'}
    new_concept = JitPlConcept.find_by(name: 'new-concept')
    assert_redirected_to action: 'edit', id: new_concept.id
  end

  test 'concept is updated through update route' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)
    concept = create(:jit_pl_concept, name: 'variables', display_name: 'Variables', text_content: 'Original content')

    put :update, params: {id: concept.id, name: 'variables', display_name: 'Variables Updated', text_content: 'Updated content'}
    assert_response :ok

    concept.reload
    assert_equal 'Variables Updated', concept.display_name
    assert_equal 'Updated content', concept.text_content
  end

  test 'updating a concept writes serialization' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.expects(:write_serialization).once

    put :update, params: {id: @concept.id, name: @concept.name}
    assert_response :ok
  end

  test 'update returns serialized concept as JSON' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)

    put :update, params: {id: @concept.id, name: 'updated-name', display_name: 'Updated', text_content: 'Updated text'}
    assert_response :ok

    response_data = JSON.parse(response.body)
    assert_equal @concept.id, response_data['id']
    assert_equal 'updated-name', response_data['name']
    assert_equal 'Updated', response_data['display_name']
    assert_equal 'Updated text', response_data['text_content']
  end

  test 'resources are saved when updating a concept' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)
    resource = create(:resource)

    put :update, params: {id: @concept.id, name: @concept.name, resource_ids: [resource.id]}
    assert_response :ok

    @concept.reload
    assert_equal [resource.id], @concept.resources.map(&:id)
  end

  test 'resources are removed when updating a concept with empty resource_ids' do
    sign_in @levelbuilder
    JitPlConcept.any_instance.stubs(:write_serialization)
    resource = create(:resource)
    @concept.resources << resource

    put :update, params: {id: @concept.id, name: @concept.name, resource_ids: []}
    assert_response :ok

    @concept.reload
    assert_empty @concept.resources
  end

  test 'edit page renders 404 when concept is not found' do
    sign_in @levelbuilder
    get :edit, params: {id: 0}
    assert_response :not_found
  end

  test 'data is passed to edit_all page' do
    sign_in @levelbuilder

    get :edit_all
    assert_response :ok

    show_data = css_select('script[data-jitplconcepts]').first.attribute('data-jitplconcepts').to_s
    assert_equal JitPlConcept.all.order(:name).map(&:serialize).to_json, show_data
  end

  test 'concept is deleted through destroy route' do
    sign_in @levelbuilder
    concept_to_delete = create(:jit_pl_concept)
    JitPlConcept.any_instance.stubs(:remove_serialization)

    delete :destroy, params: {id: concept_to_delete.id}
    assert_response :ok

    assert_raises ActiveRecord::RecordNotFound do
      concept_to_delete.reload
    end
  end

  test 'destroying a concept removes serialization' do
    sign_in @levelbuilder
    concept_to_delete = create(:jit_pl_concept)
    JitPlConcept.any_instance.expects(:remove_serialization).once

    delete :destroy, params: {id: concept_to_delete.id}
  end

  test 'cannot delete non-existent concept' do
    sign_in @levelbuilder
    delete :destroy, params: {id: 0}
    assert_response :not_found
  end
end
