require 'test_helper'

class Api::V1::Projects::PublicGalleryControllerTest < ActionController::TestCase
  setup do
    published_applab_project = {
      storage_id: 22,
      id: 33,
      name: "Applab1_to_be_featured",
      thumbnailUrl: "/v3/files/thumbnail.png",
      type: "applab",
      publishedAt: "2023-02-14T02:14:51.000+00:00",
      studentName: "A",
      studentAgeRange: "18+",
      isFeatured: true
    }
    all_featured_projects = {applab: [published_applab_project], gamelab: [], spritelab: [], playlab: [], artist: [], minecraft: [], events: [], k1: [], dance: [], poetry: [], library: [], music: []}
    ProjectsList.stubs(:fetch_active_published_featured_projects).returns(all_featured_projects)
  end

  test_user_gets_response_for(
    :index,
    name: 'anonymous user can list all published projects',
    params: -> {{project_type: 'all'}},
  )

  test 'project details are correct listing all published featured projects' do
    Rails.stubs(:env).returns(ActiveSupport::StringInquirer.new('production'))
    get :index, params: {project_type: 'all'}

    assert_response :success
    assert_equal "max-age=5, public", @response.headers["Cache-Control"]
    categories_list = JSON.parse(@response.body)
    assert_equal 12, categories_list.length
    assert_empty categories_list['gamelab']
    assert_empty categories_list['playlab']
    assert_empty categories_list['artist']
    project_row = categories_list['applab'].first
    assert_equal 'Applab1_to_be_featured', project_row['name']
    assert_equal 22, project_row['storage_id']
    assert_equal 33, project_row['id']
    assert_equal '/v3/files/thumbnail.png', project_row['thumbnailUrl']
    assert_equal 'applab', project_row['type']
    assert_equal '2023-02-14T02:14:51.000+00:00', project_row['publishedAt']
    assert_equal '18+', project_row['studentAgeRange']
    assert_equal 'A', project_row['studentName']
  end
end
