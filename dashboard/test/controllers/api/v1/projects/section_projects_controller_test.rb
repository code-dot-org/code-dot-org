require 'test_helper'

class Api::V1::Projects::SectionProjectsControllerTest < ActionController::TestCase
  STUDENT_STORAGE_ID = 11

  setup do
    @teacher = create :teacher
    @section = create :section, user: @teacher
    @student = create :user
    create :follower, section: @section, student_user: @student

    student_project_value = {
      name: 'Bobs App',
      level: '/projects/applab',
      createdAt: '2017-01-24T16:41:08.000-08:00',
      updatedAt: '2017-01-25T17:48:12.358-08:00'
    }.to_json
    student_project = {id: 22, value: student_project_value}

    hidden_project_value = {
      name: 'Hidden App',
      level: '/projects/playlab',
      createdAt: '2017-01-01T00:00:00.000-08:00',
      updatedAt: '2017-01-01T00:00:00.000-08:00',
      hidden: true
    }.to_json
    hidden_project = {id: 33, value: hidden_project_value}

    stub_user_storage_ids = [{id: STUDENT_STORAGE_ID}]
    stub_storage_apps = [student_project, hidden_project]

    mock_table = mock('mock pegasus table')
    PEGASUS_DB.stubs(:[]).returns(mock_table)
    mock_table.stubs(:where).returns(stub_user_storage_ids).
      then.returns(stub_storage_apps)
  end

  test_user_gets_response_for(
    :index,
    name: 'student cannot access section projects',
    response: :forbidden,
    user: -> {@student},
    params: -> {{section_id: @section.id}}
  )

  test_user_gets_response_for(
    :index,
    name: 'teacher can access their own section projects',
    user: -> {@teacher},
    params: -> {{section_id: @section.id}}
  )

  test_user_gets_response_for(
    :index,
    name: 'teacher cannot access another teachers section projects',
    response: :forbidden,
    user: :teacher,
    params: -> {{section_id: @section.id}}
  )

  test_user_gets_response_for(
    :index,
    name: 'admin can access section projects',
    user: :admin,
    params: -> {{section_id: @section.id}}
  )

  test 'section projects details are correct' do
    sign_in(@teacher)
    get :index, params: {section_id: @section.id}
    assert_response :success
    projects_list = JSON.parse(@response.body)
    # this verifies that the hidden project was not shown.
    assert_equal 1, projects_list.size
    project_row = projects_list.first
    assert_equal 'STUB_CHANNEL_ID-11-22', project_row['channel']
    assert_equal 'Bobs App', project_row['name']
    assert_equal @student.name, project_row['studentName']
    assert_equal 'applab', project_row['type']
    assert_equal '2017-01-25T17:48:12.358-08:00', project_row['updatedAt']
  end
end
