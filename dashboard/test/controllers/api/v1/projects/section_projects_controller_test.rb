require 'test_helper'

class Api::V1::Projects::SectionProjectsControllerTest < ActionController::TestCase
  STUDENT_STORAGE_ID = 11

  setup do
    @teacher = create(:teacher)
    @section = create(:section, user: @teacher)
    @student = create(:user)
    create(:follower, section: @section, student_user: @student)

    student_project_value = {
      name: 'Bobs App',
      level: '/projects/applab',
      createdAt: '2017-01-24T16:41:08.000-08:00',
      updatedAt: '2017-01-25T17:48:12.358-08:00'
    }.to_json
    student_project = {id: 22, storage_id: STUDENT_STORAGE_ID, value: student_project_value, uuid: SecureRandom.uuid}

    hidden_project_value = {
      name: 'Hidden App',
      level: '/projects/playlab',
      createdAt: '2017-01-01T00:00:00.000-08:00',
      updatedAt: '2017-01-01T00:00:00.000-08:00',
      hidden: true
    }.to_json
    hidden_project = {id: 33, storage_id: STUDENT_STORAGE_ID, value: hidden_project_value, uuid: SecureRandom.uuid}

    other_student_project_value = {
      name: 'Bobs Other App',
      # Project level shouldn't look like this but sometimes does. We can remove
      # this test case once level is backfilled to always be /projects/foo.
      level: 'https://studio.code.org/projects/weblab',
      createdAt: '2017-01-02T00:00:00.000-08:00',
      updatedAt: '2017-01-02T00:00:00.000-08:00',
    }.to_json
    other_student_project = {id: 44, storage_id: STUDENT_STORAGE_ID, value: other_student_project_value, uuid: SecureRandom.uuid}

    ProjectsList.stubs(:get_storage_ids_by_user_ids).returns({@student.id => STUDENT_STORAGE_ID})
    Projects.any_instance.stubs(:get_active_projects).returns([student_project, hidden_project, other_student_project])

    projects_table = mock
    Projects.stubs(:table).returns(projects_table)
    projects_table.stubs(:where).with(id: 22).returns([student_project])
    projects_table.stubs(:where).with(id: 33).returns([hidden_project])
    projects_table.stubs(:where).with(id: 44).returns([other_student_project])
    projects_table.stubs(:where).with(uuid: student_project[:uuid]).returns([student_project])
    projects_table.stubs(:where).with(uuid: hidden_project[:uuid]).returns([hidden_project])
    projects_table.stubs(:where).with(uuid: other_student_project[:uuid]).returns([other_student_project])
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

    # This verifies that the hidden project was not shown.
    assert_equal 2, projects_list.size
    project_row = projects_list.first
    storage_id, _ = get_storage_id_and_project_id(project_row['channel'])
    assert_equal STUDENT_STORAGE_ID, storage_id
    assert_equal 'Bobs App', project_row['name']
    assert_equal @student.name, project_row['studentName']
    assert_equal 'applab', project_row['type']
    assert_equal '2017-01-25T17:48:12.358-08:00', project_row['updatedAt']

    project_row = projects_list.last
    storage_id, _ = get_storage_id_and_project_id(project_row['channel'])
    assert_equal STUDENT_STORAGE_ID, storage_id
    assert_equal 'Bobs Other App', project_row['name']
    assert_equal @student.name, project_row['studentName']
    assert_equal 'weblab', project_row['type']
    assert_equal '2017-01-02T00:00:00.000-08:00', project_row['updatedAt']
  end
end
