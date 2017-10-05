require 'test_helper'

class ProjectsListTest < ActionController::TestCase
  setup do
    @student = create :student
    @storage_id = storage_id_for_user_id(@student.id)
    @channel_id = storage_encrypt_channel_id(@storage_id, 123)

    student_project_value = {
      name: 'Bobs App',
      level: '/projects/applab',
      createdAt: '2017-01-24T16:41:08.000-08:00',
      updatedAt: '2017-01-25T17:48:12.358-08:00'
    }.to_json
    @student_project = {id: 22, value: student_project_value}

    hidden_project_value = {
      name: 'Hidden App',
      level: '/projects/playlab',
      createdAt: '2017-01-01T00:00:00.000-08:00',
      updatedAt: '2017-01-01T00:00:00.000-08:00',
      hidden: true
    }.to_json
    @hidden_project = {id: 33, value: hidden_project_value}
  end

  test 'get_project_row_data correctly parses student and project data' do
    project_row = ProjectsList.send(:get_project_row_data, @student, @student_project, @channel_id)
    assert_equal @channel_id, project_row['channel']
    assert_equal 'Bobs App', project_row['name']
    assert_equal @student.name, project_row['studentName']
    assert_equal 'applab', project_row['type']
    assert_equal '2017-01-25T17:48:12.358-08:00', project_row['updatedAt']
  end

  test 'get_project_row_data ignores hidden projects' do
    assert_nil ProjectsList.send(:get_project_row_data, @student, @hidden_project, @channel_id)
  end

  test 'get_published_project_and_user_data returns nil for projects with sharing_disabled' do
    project_and_user = {
      properties: {sharing_disabled: true}.to_json
    }
    assert_nil ProjectsList.send(:get_published_project_and_user_data, project_and_user)
  end

  test 'fetch_published_project_types filters by sharing_disabled' do
    stub_projects = [
      {
        name: 'project1',
        properties: {sharing_disabled: true}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 1
      },
      {
        name: 'project2',
        properties: {}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 2
      },
      {
        name: 'project3',
        properties: {}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 3
      }
    ]
    PEGASUS_DB.stubs(:[]).returns(db_result(stub_projects))
    StorageApps.stubs(:get_published_project_data).returns({})
    assert_equal 2, ProjectsList.send(:fetch_published_project_types, ['applab'], limit: 4)['applab'].length
  end

  private

  def db_result(result)
    stub(select: stub(join: stub(join: stub(where: stub(where: stub(exclude: stub(order: stub(limit: result))))))))
  end
end
