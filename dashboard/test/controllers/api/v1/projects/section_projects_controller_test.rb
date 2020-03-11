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

    other_student_project_value = {
      name: 'Bobs Other App',
      # Project level shouldn't look like this but sometimes does. We can remove
      # this test case once level is backfilled to always be /projects/foo.
      level: 'https://studio.code.org/projects/weblab',
      createdAt: '2017-01-02T00:00:00.000-08:00',
      updatedAt: '2017-01-02T00:00:00.000-08:00',
    }.to_json
    other_student_project = {id: 44, value: other_student_project_value}

    PEGASUS_DB.stubs(:[]).with(:user_storage_ids).returns(
      stub(where: stub(select_hash: {@student.id => STUDENT_STORAGE_ID}))
    )
    PEGASUS_DB.stubs(:[]).with(:storage_apps).returns(
      stub(where: [student_project, hidden_project, other_student_project])
    )
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
    storage_id, _ = storage_decrypt_channel_id(project_row['channel'])
    assert_equal STUDENT_STORAGE_ID, storage_id
    assert_equal 'Bobs App', project_row['name']
    assert_equal @student.name, project_row['studentName']
    assert_equal 'applab', project_row['type']
    assert_equal '2017-01-25T17:48:12.358-08:00', project_row['updatedAt']

    project_row = projects_list.last
    storage_id, _ = storage_decrypt_channel_id(project_row['channel'])
    assert_equal STUDENT_STORAGE_ID, storage_id
    assert_equal 'Bobs Other App', project_row['name']
    assert_equal @student.name, project_row['studentName']
    assert_equal 'weblab', project_row['type']
    assert_equal '2017-01-02T00:00:00.000-08:00', project_row['updatedAt']
  end
end
