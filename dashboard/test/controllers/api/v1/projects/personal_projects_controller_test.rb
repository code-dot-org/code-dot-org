require 'test_helper'

class Api::V1::Projects::PersonalProjectsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @project_owner = create :user

    personal_project_value = {
      name: 'Tetris',
      level: '/projects/gamelab',
      createdAt: '2017-01-24T16:41:08.000-08:00',
      updatedAt: '2017-01-25T17:48:12.358-08:00'
    }.to_json
    personal_project = {id: 22, value: personal_project_value}

    StorageApps.any_instance.stubs(:get_active_projects).returns([personal_project])
  end

  test 'personal projects are correct' do
    sign_in(@project_owner)
    storage_id = fake_storage_id_for_user_id(@project_owner.id)
    ProjectsList.stubs(:storage_id_for_user_id).with(@project_owner.id).returns(storage_id)

    get "/api/v1/projects/personal/"
    assert_response :success
    assert_match "no-store", response.headers["Cache-Control"]
    personal_projects_list = JSON.parse(@response.body)
    assert_equal 1, personal_projects_list.size
    project_row = personal_projects_list.first
    assert_equal 'Tetris', project_row['name']
    assert_equal 'gamelab', project_row['type']
    assert_equal '2017-01-25T17:48:12.358-08:00', project_row['updatedAt']
  end

  test 'signed out users can not access personal projects' do
    get "/api/v1/projects/personal/"
    assert_response :forbidden
  end
end
