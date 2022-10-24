require 'test_helper'

class DataDocsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup_all do
    @levelbuilder = create :levelbuilder

    @test_params = {
      key: 'new_doc',
      name: 'New Doc',
      content: 'This doc contains things.'
    }.freeze

    @data_doc = create :data_doc, key: @test_params[:key]
    @levelbuild_destroy_doc = create :data_doc, key: 'levelbuild_destroy_doc'
  end

  test_user_gets_response_for :index, user: nil, response: :success
  test_user_gets_response_for :index, user: :student, response: :success
  test_user_gets_response_for :index, user: :teacher, response: :success
  test_user_gets_response_for :index, user: :levelbuilder, response: :success

  # new page is levelbuilder only
  test_user_gets_response_for :new, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :new, user: :student, response: :forbidden
  test_user_gets_response_for :new, user: :teacher, response: :forbidden
  test_user_gets_response_for :new, user: :levelbuilder, response: :success

  # only levelbuilder can create
  test_user_gets_response_for :create, params: -> {{key: 'unique_key'}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :create, params: -> {{key: 'unique_key'}}, user: :student, response: :forbidden
  test_user_gets_response_for :create, params: -> {{key: 'unique_key'}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :create, params: -> {{key: 'unique_key'}}, user: :levelbuilder, response: :redirect, redirected_to: '/data_docs/unique_key'

  test_user_gets_response_for :show, params: -> {{key: @test_params[:key]}}, user: nil, response: :success
  test_user_gets_response_for :show, params: -> {{key: @test_params[:key]}}, user: :student, response: :success
  test_user_gets_response_for :show, params: -> {{key: @test_params[:key]}}, user: :teacher, response: :success
  test_user_gets_response_for :show, params: -> {{key: @test_params[:key]}}, user: :levelbuilder, response: :success

  # only levelbuilder can edit
  test_user_gets_response_for :edit, params: -> {@test_params}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :edit, params: -> {@test_params}, user: :student, response: :forbidden
  test_user_gets_response_for :edit, params: -> {@test_params}, user: :teacher, response: :forbidden
  test_user_gets_response_for :edit, params: -> {@test_params}, user: :levelbuilder, response: :success

  # only levelbuilder can edit_all
  test_user_gets_response_for :edit_all, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :edit_all, user: :student, response: :forbidden
  test_user_gets_response_for :edit_all, user: :teacher, response: :forbidden
  test_user_gets_response_for :edit_all, user: :levelbuilder, response: :success

  # only levelbuilder can destroy
  test_user_gets_response_for :destroy, params: -> {{key: @test_params[:key]}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :destroy, params: -> {{key: @test_params[:key]}}, user: :student, response: :forbidden
  test_user_gets_response_for :destroy, params: -> {{key: @test_params[:key]}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :destroy, params: -> {{key: @test_params[:key]}}, user: :levelbuilder, response: :success

  test 'creating a new data doc writes serialization and redirects to show page with key in URL' do
    sign_in @levelbuilder
    new_key = 'doc_key'

    DataDoc.any_instance.expects(:write_serialization).once

    get :create, params: {key: new_key}
    assert_redirected_to action: 'show', key: new_key
  end

  test 'show page renders 404 when data doc is not found' do
    get :show, params: {key: 'unknown_key'}
    assert_response :not_found
  end

  test 'data doc is updated through update route' do
    sign_in @levelbuilder
    new_key = 'doc_key'
    editable_data_doc = create :data_doc, {key: new_key, name: 'Doc name', content: 'Doc content.'}

    get :edit, params: {key: new_key}
    edited_name = 'New doc name'
    edited_content = 'New doc content.'
    post :update, params: {
      key: new_key,
      name: edited_name,
      content: edited_content
    }
    assert_response :ok

    editable_data_doc.reload
    assert_equal new_key, editable_data_doc.key
    assert_equal edited_name, editable_data_doc.name
    assert_equal edited_content, editable_data_doc.content
  end

  test 'edit page renders 404 when data doc is not found' do
    sign_in @levelbuilder
    get :edit, params: {key: 'unknown_key'}
    assert_response :not_found
  end

  test 'data is passed to edit_all page' do
    sign_in @levelbuilder

    get :edit_all
    assert_response :ok

    show_data = css_select('script[data-datadocs]').first.attribute('data-datadocs').to_s
    assert_equal DataDoc.all.order(:name).map(&:serialize).to_json, show_data
  end

  test 'data doc is deleted through destroy route' do
    sign_in @levelbuilder
    data_doc_to_delete = create :data_doc, key: 'doc_to_delete'

    post :destroy, params: {
      key: data_doc_to_delete.key
    }
    assert_response :ok

    assert_raise ActiveRecord::RecordNotFound do
      data_doc_to_delete.reload
    end
  end

  test 'cannot delete non-existent data doc' do
    sign_in @levelbuilder

    post :destroy, params: {
      key: 'non_existent_data_doc'
    }
    assert_response :not_found
  end
end
