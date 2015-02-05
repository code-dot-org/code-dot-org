require 'test_helper'
class DistrictsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @admin = create(:admin)
    sign_in @admin
    @district = create(:district)
  end

  # Test index + CRUD controller actions

  test 'list all districts' do
    assert_routing({ path: 'districts', method: :get }, { controller: 'districts', action: 'index' })

    get :index
    assert_response :success
  end

  test 'create district' do
    assert_routing({ path: 'districts', method: :post }, { controller: 'districts', action: 'create' })

    assert_difference 'District.count' do
      post :create, district: {name: 'test district'}
    end
    assert_response :success
  end

  test 'read district info' do
    assert_routing({ path: 'districts/1', method: :get }, { controller: 'districts', action: 'show', id: '1' })

    get :show, id: @district.id
    assert_response :success
  end

  test 'update district info' do
    assert_routing({ path: 'districts/1', method: :patch }, { controller: 'districts', action: 'update', id: '1' })

    new_name = 'New district name'
    patch :update, id: @district.id, district: {name: new_name}

    get :show, id: @district.id
    p @response.body
    assert_equal new_name, JSON.parse(@response.body)['name']
    assert_response :success
  end

  test 'delete district' do
    assert_routing({ path: 'districts/1', method: :delete }, { controller: 'districts', action: 'destroy', id: '1' })

    assert_difference 'District.count', -1 do
      get :destroy, id: @district.id
    end
    assert_response :success
  end
end
