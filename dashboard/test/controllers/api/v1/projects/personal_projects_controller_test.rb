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

    PEGASUS_DB.stubs(:[]).with(:storage_apps).returns(
      stub(where: [personal_project])
    )
  end

  test 'personal projects are correct' do
    sign_in(@project_owner)
    get "/api/v1/projects/personal/"
    assert_response :success
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
