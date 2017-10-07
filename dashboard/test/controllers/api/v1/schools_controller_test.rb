require 'test_helper'

class Api::V1::SchoolsControllerTest < ActionController::TestCase
  ALBERT_EINSTEIN_ACADEMY_ELEMENTARY = {
    nces_id: '60000113717',
    name: 'Albert Einstein Academy Elementary',
    city: 'Santa Clarita',
    state: 'CA',
    zip: '91355'
  }.deep_stringify_keys.freeze

  GLADYS_JUNG_ELEMENTARY = {
    nces_id: '20000100207',
    name: 'Gladys Jung Elementary',
    city: 'Bethel',
    state: 'AK',
    zip: '99559'
  }.deep_stringify_keys.freeze

  test 'search by school name prefix' do
    get :search, params: {q: 'glad', limit: 40}
    assert_response :success
    assert_equal [GLADYS_JUNG_ELEMENTARY], JSON.parse(@response.body)
  end

  test 'search by school name substring' do
    get :search, params: {q: 'jung', limit: 40}
    assert_response :success
    assert_equal [GLADYS_JUNG_ELEMENTARY], JSON.parse(@response.body)
  end

  test 'search by school city prefix' do
    get :search, params: {q: 'beth', limit: 40}
    assert_response :success
    assert_equal [GLADYS_JUNG_ELEMENTARY], JSON.parse(@response.body)
  end

  test 'search with limit of negative one' do
    get :search, params: {q: 'glad', limit: -1}
    assert_response :success
    assert_equal [GLADYS_JUNG_ELEMENTARY], JSON.parse(@response.body)
  end

  test 'search with limit of zero' do
    get :search, params: {q: 'glad', limit: 0}
    assert_response :success
    assert_equal [GLADYS_JUNG_ELEMENTARY], JSON.parse(@response.body)
  end
end
