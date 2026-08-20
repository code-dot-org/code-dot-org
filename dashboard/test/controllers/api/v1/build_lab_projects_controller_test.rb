require 'test_helper'

class Api::V1::BuildLabProjectsControllerTest < ActionDispatch::IntegrationTest
  test 'unauthenticated request returns 401' do
    post '/api/v1/build_lab/projects', as: :json

    assert_response :unauthorized
  end

  test 'creates an owned Build Lab channel' do
    user = create(:student)
    sign_in user
    Api::V1::BuildLabProjectsController.any_instance.stubs(:get_storage_id).returns(
      fake_storage_id_for_user_id(user.id)
    )

    assert_difference 'DASHBOARD_DB[:projects].where(project_type: "build-lab").count', 1 do
      post '/api/v1/build_lab/projects', as: :json
    end

    assert_response :created
    channel = response.parsed_body.fetch('channel')
    owner_storage_id, project_id = get_storage_id_and_project_id(channel)
    assert_equal fake_storage_id_for_user_id(user.id), owner_storage_id

    project = DASHBOARD_DB[:projects].where(id: project_id).first
    assert_equal 'build-lab', project[:project_type]
    assert_equal 'Untitled Build Lab project', JSON.parse(project[:value]).fetch('name')
  end
end
