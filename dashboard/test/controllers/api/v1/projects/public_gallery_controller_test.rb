require 'test_helper'

class Api::V1::Projects::PublicGalleryControllerTest < ActionController::TestCase
  setup do
    published_applab_project = {
      id: 33,
      published_at: '2017-03-03T00:00:00.000-08:00',
      project_type: 'applab',
      value: {
        name: 'Charlies App',
        thumbnailUrl: 'https://studio.code.org/charlies_thumbnail.png'
      }.to_json,
    }
    stub_projects = [published_applab_project]

    # return 1 applab project for initial DB request, then an empty set
    # for all subsequent db requests. Subsequent requests are only expected
    # when 'all' project types are requested.
    PEGASUS_DB.stubs(:[]).returns(db_result(stub_projects)).then.returns(db_result([]))
  end

  test_user_gets_response_for(
    :index,
    name: 'anonymous user can list applab projects',
    params: -> {{project_type: 'applab', limit: 1}},
  )

  test_user_gets_response_for(
    :index,
    name: 'anonymous user can list gamelab projects',
    params: -> {{project_type: 'gamelab', limit: 1}},
  )

  test_user_gets_response_for(
    :index,
    name: 'anonymous user can list playlab projects',
    params: -> {{project_type: 'playlab', limit: 1}},
  )

  test_user_gets_response_for(
    :index,
    name: 'anonymous user can list artist projects',
    params: -> {{project_type: 'artist', limit: 1}},
  )

  test_user_gets_response_for(
    :index,
    name: 'anonymous user can specify an offset',
    params: -> {{project_type: 'applab', limit: 1, offset: 3}},
  )

  test_user_gets_response_for(
    :index,
    name: 'anonymous user can list all published projects',
    params: -> {{project_type: 'all', limit: 1}},
  )

  test_user_gets_response_for(
    :index,
    name: 'bad request when project type is invalid',
    params: -> {{project_type: 'bogus', limit: 1}},
    response: :bad_request,
  )

  test_user_gets_response_for(
    :index,
    name: 'bad request when offset is specified for project type all',
    params: -> {{project_type: 'all', limit: 1, offset: 2}},
    response: :bad_request,
  )

  test_user_gets_response_for(
    :index,
    name: 'bad request when limit is less than 1',
    params: -> {{project_type: 'gamelab', limit: 0}},
    response: :bad_request,
  )

  test_user_gets_response_for(
    :index,
    name: 'bad request when limit exceeds 100',
    params: -> {{project_type: 'gamelab', limit: 101}},
    response: :bad_request,
  )

  test 'project details are correct listing published applab projects' do
    get :index, params: {project_type: 'applab', limit: 1}
    assert_response :success
    categories_list = JSON.parse(@response.body)
    assert_equal 1, categories_list.length
    project_row = categories_list['applab'].first
    assert_equal 'Charlies App', project_row['name']
    assert_equal 'STUB_CHANNEL_ID-1234', project_row['channel']
    assert_equal 'https://studio.code.org/charlies_thumbnail.png', project_row['thumbnailUrl']
    assert_equal 'applab', project_row['type']
    assert_equal '2017-03-03T00:00:00.000-08:00', project_row['publishedAt']
  end

  test 'project details are correct listing all published projects' do
    get :index, params: {project_type: 'all', limit: 1}
    assert_response :success
    categories_list = JSON.parse(@response.body)

    assert_equal ProjectsList::PUBLISHED_PROJECT_TYPES.sort, categories_list.keys.sort
    assert_equal 1, categories_list['applab'].length
    assert_empty categories_list['gamelab']
    assert_empty categories_list['playlab']
    assert_empty categories_list['artist']

    project_row = categories_list['applab'].first
    assert_equal 'Charlies App', project_row['name']
    assert_equal 'STUB_CHANNEL_ID-1234', project_row['channel']
    assert_equal 'https://studio.code.org/charlies_thumbnail.png', project_row['thumbnailUrl']
    assert_equal 'applab', project_row['type']
    assert_equal '2017-03-03T00:00:00.000-08:00', project_row['publishedAt']
  end

  private

  def db_result(result)
    stub(where: stub(exclude: stub(order: stub(limit: stub(offset: result)))))
  end
end
