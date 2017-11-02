require 'test_helper'

class Api::V1::Projects::PublicGalleryControllerTest < ActionController::TestCase
  published_applab_project = nil
  setup do
    published_applab_project = {
      storage_id: 22,
      id: 33,
      published_at: '2017-03-03T00:00:00.000-08:00',
      project_type: 'applab',
      value: {
        name: 'Charlies App',
        thumbnailUrl: '/v3/files/charlies_thumbnail.png'
      }.to_json,
      name: 'Prince Charles',
      birthday: 13.years.ago.to_datetime,

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
    name: 'anonymous user can specify published_before',
    params: -> {{project_type: 'applab', limit: 1, published_before: '2017-02-17T13:59:11.000-08:00'}},
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
    name: 'bad request when published_before is specified for project type all',
    params: -> {{project_type: 'all', limit: 1, published_before: '2017-02-17T13:59:11.000-08:00'}},
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
    Rails.stubs(:env).returns(ActiveSupport::StringInquirer.new('production'))
    get :index, params: {project_type: 'applab', limit: 1}

    assert_response :success
    assert_equal "max-age=5, public", @response.headers["Cache-Control"]
    categories_list = JSON.parse(@response.body)
    assert_equal 1, categories_list.length
    project_row = categories_list['applab'].first
    assert_equal 'Charlies App', project_row['name']
    assert_equal storage_encrypt_channel_id(22, 33), project_row['channel']
    assert_equal '/v3/files-public/charlies_thumbnail.png', project_row['thumbnailUrl']
    assert_equal 'applab', project_row['type']
    assert_equal '2017-03-03T00:00:00.000-08:00', project_row['publishedAt']
    assert_equal '13+', project_row['studentAgeRange']
    assert_equal 'P', project_row['studentName']
  end

  test 'project details are correct without thumbnail' do
    published_applab_project[:value] = {name: 'App with no thumbnail'}.to_json
    get :index, params: {project_type: 'applab', limit: 1}
    assert_response :success
    categories_list = JSON.parse(@response.body)
    assert_equal 1, categories_list.length
    project_row = categories_list['applab'].first
    assert_equal 'App with no thumbnail', project_row['name']
    assert_nil project_row['thumbnailUrl']
  end

  test 'project details are correct listing all published projects' do
    Rails.stubs(:env).returns(ActiveSupport::StringInquirer.new('production'))
    get :index, params: {project_type: 'all', limit: 1}

    assert_response :success
    assert_equal "max-age=5, public", @response.headers["Cache-Control"]
    categories_list = JSON.parse(@response.body)

    assert_equal ProjectsList::PUBLISHED_PROJECT_TYPE_GROUPS.keys.map(&:to_s).sort, categories_list.keys.sort
    assert_equal 1, categories_list['applab'].length
    assert_empty categories_list['gamelab']
    assert_empty categories_list['playlab']
    assert_empty categories_list['artist']

    project_row = categories_list['applab'].first
    assert_equal 'Charlies App', project_row['name']
    assert_equal storage_encrypt_channel_id(22, 33), project_row['channel']
    assert_equal '/v3/files-public/charlies_thumbnail.png', project_row['thumbnailUrl']
    assert_equal 'applab', project_row['type']
    assert_equal '2017-03-03T00:00:00.000-08:00', project_row['publishedAt']
    assert_equal '13+', project_row['studentAgeRange']
    assert_equal 'P', project_row['studentName']
  end

  private

  def db_result(result)
    stub(select: stub(join: stub(join: stub(where: stub(where: stub(exclude: stub(order: stub(limit: result))))))))
  end
end
