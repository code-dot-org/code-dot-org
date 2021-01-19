require 'test_helper'

class ProjectsListTest < ActionController::TestCase
  setup do
    @student = create :student
    @storage_id = storage_id_for_user_id(@student.id)
    @channel_id = storage_encrypt_channel_id(@storage_id, 123)

    @teacher = create :teacher
    @teacher_storage_id = storage_id_for_user_id(@teacher.id)

    student_project_value = {
      name: 'Bobs App',
      level: '/projects/applab',
      createdAt: '2017-01-24T16:41:08.000-08:00',
      updatedAt: '2017-01-25T17:48:12.358-08:00',
      libraryName: 'bobsLibrary',
      libraryDescription: 'A library by Bob.',
      libraryPublishedAt: '2020-01-25T17:48:12.358-08:00'
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
    project_row = ProjectsList.send(:get_project_row_data, @student_project, @channel_id, @student)
    assert_equal @channel_id, project_row['channel']
    assert_equal 'Bobs App', project_row['name']
    assert_equal @student.name, project_row['studentName']
    assert_equal 'applab', project_row['type']
    assert_equal '2017-01-25T17:48:12.358-08:00', project_row['updatedAt']
  end

  test 'get_project_row_data ignores hidden projects' do
    assert_nil ProjectsList.send(:get_project_row_data, @hidden_project, @channel_id, @student)
  end

  test 'get_project_row_data still correctly parses project data even if no student is passed' do
    project_row = ProjectsList.send(:get_project_row_data, @student_project, @channel_id)
    assert_equal @channel_id, project_row['channel']
    assert_equal 'Bobs App', project_row['name']
    assert_equal 'applab', project_row['type']
    assert_equal '2017-01-25T17:48:12.358-08:00', project_row['updatedAt']
  end

  test 'get_project_row_data includes library data if with_library is true' do
    project_row = ProjectsList.send(:get_project_row_data, @student_project, @channel_id, nil, false)
    assert_nil project_row['libraryName']
    assert_nil project_row['libraryDescription']
    assert_nil project_row['libraryPublishedAt']

    project_row = ProjectsList.send(:get_project_row_data, @student_project, @channel_id, nil, true)
    assert_equal 'bobsLibrary', project_row['libraryName']
    assert_equal 'A library by Bob.', project_row['libraryDescription']
    assert_equal '2020-01-25T17:48:12.358-08:00', project_row['libraryPublishedAt']
  end

  test 'get_published_project_and_user_data returns nil for App Lab project with sharing_disabled' do
    project_and_user = {
      properties: {sharing_disabled: true}.to_json,
      project_type: 'applab'
    }
    assert_nil ProjectsList.send(:get_published_project_and_user_data, project_and_user)
  end

  test 'get_published_project_and_user_data returns nil for Game Lab project with sharing_disabled' do
    project_and_user = {
      properties: {sharing_disabled: true}.to_json,
      project_type: 'gamelab'
    }
    assert_nil ProjectsList.send(:get_published_project_and_user_data, project_and_user)
  end

  test 'get_published_project_and_user_data does not return nil for Dance project even with sharing_disabled' do
    project_and_user = {
      properties: {sharing_disabled: true}.to_json,
      project_type: 'dance',
      storage_id: @storage_id,
      id: 1,
      birthday: 13.years.ago.to_datetime,
      abuse_score: 0
    }
    StorageApps.stubs(:get_published_project_data).returns({})
    refute_nil ProjectsList.send(:get_published_project_and_user_data, project_and_user)
  end

  test 'get_published_project_and_user_data does not return nil for PlayLab project even with sharing_disabled' do
    project_and_user = {
      properties: {sharing_disabled: true}.to_json,
      project_type: 'playlab',
      storage_id: @storage_id,
      id: 1,
      birthday: 13.years.ago.to_datetime,
      abuse_score: 0
    }
    StorageApps.stubs(:get_published_project_data).returns({})
    refute_nil ProjectsList.send(:get_published_project_and_user_data, project_and_user)
  end

  test 'fetch_published_project_types filters by sharing_disabled and project_type - App Lab' do
    stub_projects = [
      {
        name: 'project1',
        properties: {sharing_disabled: true}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 1,
        project_type: 'applab',
        abuse_score: 0
      },
      {
        name: 'project2',
        properties: {}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 2,
        project_type: 'applab',
        abuse_score: 0
      },
      {
        name: 'project3',
        properties: {}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 3,
        project_type: 'applab',
        abuse_score: 0
      }
    ]
    PEGASUS_DB.stubs(:[]).returns(db_result(stub_projects))
    StorageApps.stubs(:get_published_project_data).returns({})
    assert_equal 2, ProjectsList.send(:fetch_published_project_types, ['applab'], limit: 4)['applab'].length
  end

  test 'fetch_published_project_types filters by sharing_disabled and project_type - Dance' do
    stub_projects = [
      {
        name: 'project1',
        properties: {sharing_disabled: true}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 1,
        project_type: 'dance',
        abuse_score: 0
      },
      {
        name: 'project2',
        properties: {}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 2,
        project_type: 'dance',
        abuse_score: 0
      },
      {
        name: 'project3',
        properties: {}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 3,
        project_type: 'dance',
        abuse_score: 0
      }
    ]
    PEGASUS_DB.stubs(:[]).returns(db_result(stub_projects))
    StorageApps.stubs(:get_published_project_data).returns({})
    assert_equal 3, ProjectsList.send(:fetch_published_project_types, ['dance'], limit: 4)['dance'].length
  end

  test 'fetch_published_project_types filters by abuse_score' do
    stub_projects = [
      {
        name: 'abusive',
        properties: {}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 1,
        project_type: 'applab',
        abuse_score: 20
      },
      {
        name: 'normal',
        properties: {}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 2,
        project_type: 'applab',
        abuse_score: 0
      },
      {
        name: 'featured',
        properties: {}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 3,
        project_type: 'applab',
        abuse_score: -50
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
      k1: [],
      spritelab: [],
      dance: [],
      library: []
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
      k1: [],
      spritelab: [],
      dance: [],
      library: []
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

  test 'fetch_section_libraries filters by library_name' do
    applab_lib_name = 'applab_library'
    gamelab_lib_name = 'gamelab_library'
    description = 'library description'
    student_name = 'student name'
    teacher_name = 'teacher name'
    stub_projects = [
      {
        name: applab_lib_name,
        properties: {}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 1,
        project_type: 'applab',
        value: {'libraryName': applab_lib_name, 'libraryDescription': description, 'hidden': true}.to_json,
        state: 'active'
      },
      {
        name: gamelab_lib_name,
        properties: {}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 2,
        project_type: 'gamelab',
        value: {'libraryName': gamelab_lib_name, 'libraryDescription': description}.to_json,
        state: 'active'
      }
    ]
    stub_users = {
      @storage_id => 4,
      @teacher_storage_id => 6
    }
    User = Struct.new(:id, :name)
    teacher = User.new(6, teacher_name)
    student = User.new(4, student_name)
    Section = Struct.new(:students, :user, :id, :name, :user_id)
    section = Section.new([student], teacher, 321, 'sectionName', teacher.id)

    PEGASUS_DB.stubs(:[]).returns(user_db_result(stub_users)).then.returns(library_db_result(stub_projects))

    StorageApps.stubs(:get_published_project_data).returns({})
    lib_response = ProjectsList.send(:fetch_section_libraries, section)
    assert_equal 2, lib_response.length
    assert_equal applab_lib_name, lib_response[0][:name]
    assert_equal gamelab_lib_name, lib_response[1][:name]
    assert_equal description, lib_response[0][:description]
    assert_equal student_name, lib_response[0][:userName]
  end

  test 'fetch_section_libraries returns libraries owned by teachers' do
    applab_lib_name = 'applab_library'
    description = 'library description'
    section_owner_name = 'section owner'
    section_participant_name = 'section participant'
    stub_projects = [
      {
        name: applab_lib_name,
        properties: {}.to_json,
        birthday: 25.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 1,
        project_type: 'applab',
        value: {'libraryName': applab_lib_name, 'libraryDescription': description}.to_json,
        state: 'active'
      }
    ]
    stub_users = {
      @storage_id => 4
    }
    User = Struct.new(:id, :name, :user_type)
    section_owner = User.new(6, section_owner_name, 'teacher')
    section_participant = User.new(4, section_participant_name, 'teacher')
    Section = Struct.new(:students, :user, :id, :name, :user_id)
    section = Section.new([section_participant], section_owner, 321, 'sectionName', section_owner.id)

    PEGASUS_DB.stubs(:[]).returns(user_db_result(stub_users)).then.returns(library_db_result(stub_projects))

    StorageApps.stubs(:get_published_project_data).returns({})
    lib_response = ProjectsList.send(:fetch_section_libraries, section)
    assert_equal 1, lib_response.length
    assert_equal applab_lib_name, lib_response[0][:name]
    assert_equal description, lib_response[0][:description]
    assert_equal section_participant_name, lib_response[0][:userName]
  end

  test 'fetch_section_libraries fetches libraries shared by teachers' do
    shared_lib_name = 'shared_library'
    unshared_lib_name = 'unshared_library'
    description = 'library description'
    teacher_name = 'teacher name'
    stub_projects = [
      {
        name: shared_lib_name,
        properties: {}.to_json,
        birthday: 25.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 3,
        project_type: 'applab',
        value: {'libraryName': shared_lib_name, 'libraryDescription': description, 'sharedWith': [321]}.to_json,
        state: 'active'
      },
      {
        name: unshared_lib_name,
        properties: {}.to_json,
        birthday: 25.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 4,
        project_type: 'applab',
        value: {'libraryName': unshared_lib_name, 'libraryDescription': description}.to_json,
        state: 'active'
      }
    ]
    stub_users = {
      @storage_id => 4
    }
    User = Struct.new(:id, :name)
    teacher = User.new(4, teacher_name)
    Section = Struct.new(:students, :user, :id, :name, :user_id)
    section = Section.new([], teacher, 321, 'sectionName', teacher.id)

    PEGASUS_DB.stubs(:[]).returns(user_db_result(stub_users)).then.returns(library_db_result(stub_projects))

    StorageApps.stubs(:get_published_project_data).returns({})
    lib_response = ProjectsList.send(:fetch_section_libraries, section)
    assert_equal 1, lib_response.length
    assert_equal shared_lib_name, lib_response[0][:name]
    assert_equal description, lib_response[0][:description]
    assert_equal teacher_name, lib_response[0][:userName]
  end

  test 'fetch_updated_library_channels returns channel_ids of libraries that have been updated' do
    updated_channel_id = storage_encrypt_channel_id(1, 1)
    libraries = [
      {'channel_id' => updated_channel_id, 'version' => '1'},
      {'channel_id' => storage_encrypt_channel_id(1, 2), 'version' => '1'},
      {'channel_id' => storage_encrypt_channel_id(1, 3), 'version' => '1'}
    ]
    stub_projects = [
      {
        id: 1,
        value: {'latestLibraryVersion': '2'}.to_json
      },
      {
        id: 2,
        value: {'latestLibraryVersion': '1'}.to_json
      },
      {
        id: 3,
        value: {}.to_json
      }
    ]

    PEGASUS_DB.stubs(:[]).returns(stub(where: stub_projects))

    updated_channel_ids = ProjectsList.fetch_updated_library_channels(libraries)
    assert_equal [updated_channel_id], updated_channel_ids
  end

  test 'fetch_updated_library_channels returns empty array if no libraries given' do
    assert_equal [], ProjectsList.fetch_updated_library_channels([])
  end

  private

  def user_db_result(result)
    stub(where: stub(select_hash: result))
  end

  def library_db_result(result)
    stub(where: stub(where: stub(where: result)))
  end

  def db_result(result)
    stub(select: stub(join: stub(join: stub(where: stub(where: stub(exclude: stub(order: stub(limit: result))))))))
  end
end
