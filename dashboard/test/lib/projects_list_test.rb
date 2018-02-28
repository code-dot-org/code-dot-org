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

  test 'extract_data_for_featured_project_cards correctly parses project data' do
    fake_project_value = "{\"name\":\"Desert Dinosaur\",\"thumbnailUrl\":\"/v3/files/YFxJhYhYtlu7mZEoZliGJw/.metadata/thumbnail.png\"}"
    fake_project_featured_project_user_combo_data = [
      {
        id: 184,
        storage_id: 160,
        value: fake_project_value,
        project_type: "playlab",
        published_at: "2018-02-26 11:23:11 -0800",
        featured_at: "2018-02-26 19:23:36 -0800",
        unfeatured_at: nil,
        name: "harry_potter",
        birthday: DateTime.now,
        properties: {}
      }
    ]
    returned_project = ProjectsList.send(
      :extract_data_for_featured_project_cards, fake_project_featured_project_user_combo_data
    ).first
    fake_project = fake_project_featured_project_user_combo_data.first

    assert_equal JSON.parse(fake_project_value)["name"], returned_project["name"]
    assert_equal StorageApps.make_thumbnail_url_cacheable(JSON.parse(fake_project_value)["thumbnailUrl"]), returned_project["thumbnailUrl"]
    assert_equal fake_project[:project_type], returned_project["type"]
    assert_equal fake_project[:published_at], returned_project["publishedAt"]
    assert_equal UserHelpers.initial(fake_project[:name]),
      returned_project["studentName"]
    assert_equal UserHelpers.age_range_from_birthday(fake_project[:birthday]),
      returned_project["studentAgeRange"]
  end

  test "include_featured combines featured project data and published projects data correctly" do
    fake_featured_projects = {
      applab: [
        {name: "featuredApplab1"},
        {name: "featuredApplab2"},
        {name: "featuredApplab3"}
      ],
      gamelab: [],
      playlab: [],
      artist: [],
      minecraft: [],
      events: [],
      k1: []
    }
    fake_recent_projects = {
      applab: [
        {name: "recentApplab1"},
        {name: "recentApplab2"},
        {name: "recentApplab3"}
      ],
      gamelab: [],
      playlab: [],
      artist: [],
      minecraft: [],
      events: [],
      k1: []
    }
    ProjectsList.stubs(:fetch_featured_published_projects).returns(fake_featured_projects)
    ProjectsList.stubs(:fetch_published_project_types).returns(fake_recent_projects)
    combined_projects = ProjectsList.send(
      :include_featured, limit: 10
    )
    # Featured projects should be ordered before recent projects
    assert_equal combined_projects[:applab].first, {name: "featuredApplab1"}
    assert_equal combined_projects[:applab].last, {name: "recentApplab3"}
  end

  private

  def db_result(result)
    stub(select: stub(join: stub(join: stub(where: stub(where: stub(exclude: stub(order: stub(limit: result))))))))
  end
end
