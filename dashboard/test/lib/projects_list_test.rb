require 'test_helper'

class ProjectsListTest < ActionController::TestCase
  setup do
    @student = create(:student)
    @storage_id = fake_storage_id_for_user_id(@student.id)
    stub_storage_id_for_user_id(@student.id)

    @teacher = create(:teacher)
    stub_storage_id_for_user_id(@teacher.id)

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

    # lab2 projects rely on the projectType field to determine type.
    lab2_project_value = {
      name: 'Lab2 Project',
      createdAt: '2024-01-24T16:41:08.000-08:00',
      updatedAt: '2024-01-25T17:48:12.358-08:00',
      projectType: 'pythonlab',
      hidden: false,
      labConfig: {standaloneSettings: {projectType: 'console'}},
    }.to_json
    @lab2_project = {id: 44, value: lab2_project_value}
  end

  test 'get_project_row_data correctly parses student and project data' do
    project_row = ProjectsList.send(:get_project_row_data, @student_project, @channel_id, @student)
    assert_nil @channel_id
    assert_nil project_row['channel']
    assert_equal 'Bobs App', project_row['name']
    assert_equal @student.name, project_row['studentName']
    assert_equal 'applab', project_row['type']
    assert_equal '2017-01-25T17:48:12.358-08:00', project_row['updatedAt']
  end

  test 'get_project_row_data correctly parses lab2 project data' do
    project_row = ProjectsList.send(:get_project_row_data, @lab2_project, @channel_id, @student)
    assert_nil @channel_id
    assert_nil project_row['channel']
    assert_equal 'Lab2 Project', project_row['name']
    assert_equal @student.name, project_row['studentName']
    assert_equal 'pythonlab', project_row['type']
    assert_equal '2024-01-25T17:48:12.358-08:00', project_row['updatedAt']
    assert_equal({'standaloneSettings' => {'projectType' => 'console'}}, project_row['labConfig'])
  end

  test 'get_project_row_data leaves labConfig out when the project has none' do
    project_row = ProjectsList.send(:get_project_row_data, @student_project, @channel_id, @student)
    assert_nil project_row['labConfig']
  end

  test 'get_project_row_data ignores hidden projects' do
    assert_nil ProjectsList.send(:get_project_row_data, @hidden_project, @channel_id, @student)
  end

  test 'adaptive_project_ids finds the channels of pathway template levels only' do
    adaptive = create(:adaptive)
    template_name = adaptive.pathway_template_level_name
    template = Level.find_by(name: template_name) || create(:weblab2, name: template_name)
    create(:channel_token, storage_id: @storage_id, level: template, storage_app_id: 55)
    create(:channel_token, storage_id: @storage_id, level: create(:weblab2), storage_app_id: 66)

    assert_equal Set[55], ProjectsList.send(:adaptive_project_ids, [@storage_id])
    assert_equal Set[], ProjectsList.send(:adaptive_project_ids, [])
  end

  test 'get_adaptive_project_row_data includes the hidden, unnamed level channel' do
    adaptive_project = {
      id: 55,
      project_type: 'weblab2',
      value: {hidden: true, updatedAt: '2026-11-20T00:00:00.000-08:00'}.to_json,
    }
    project_row = ProjectsList.send(:get_adaptive_project_row_data, adaptive_project, @channel_id, @student)
    assert_equal 'My Website', project_row['name']
    assert_equal 'weblab2', project_row['type']
    assert_equal @student.name, project_row['studentName']
  end

  test 'get_project_row_data still correctly parses project data even if no student is passed' do
    project_row = ProjectsList.send(:get_project_row_data, @student_project, @channel_id)
    assert_nil @channel_id
    assert_nil project_row['channel']
    assert_equal 'Bobs App', project_row['name']
    assert_equal 'applab', project_row['type']
    assert_equal '2017-01-25T17:48:12.358-08:00', project_row['updatedAt']
  end

  test 'get_project_row_data includes library data if with_library is true' do
    project_row = ProjectsList.send(:get_project_row_data, @student_project, @channel_id, with_library: false)
    assert_nil project_row['libraryName']
    assert_nil project_row['libraryDescription']
    assert_nil project_row['libraryPublishedAt']

    project_row = ProjectsList.send(:get_project_row_data, @student_project, @channel_id, with_library: true)
    assert_equal 'bobsLibrary', project_row['libraryName']
    assert_equal 'A library by Bob.', project_row['libraryDescription']
    assert_equal '2020-01-25T17:48:12.358-08:00', project_row['libraryPublishedAt']
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
    assert_equal Projects.make_thumbnail_url_cacheable(JSON.parse(fake_project_value)["thumbnailUrl"]), returned_project["thumbnailUrl"]
    assert_equal fake_project[:project_type], returned_project["type"]
    assert_equal fake_project[:published_at], returned_project["publishedAt"]
    assert_equal UserHelpers.initial(fake_project[:name]),
      returned_project["studentName"]
    assert_nil UserHelpers.age_range_from_birthday(fake_project[:birthday])
    assert_nil returned_project["studentAgeRange"]
  end

  test 'extract_data_for_featured_project_cards correctly parses project data without thumbnail url' do
    fake_project_value = "{\"name\":\"Desert Dinosaur\"}"
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

    assert_equal JSON.parse(fake_project_value)["name"], returned_project["name"]
    assert_nil returned_project["thumbnailUrl"]
  end

  test 'fetch_section_projects issues the same queries however many projects the students have' do
    section = create(:section, user: @teacher)
    bea = create(:student, name: 'Bea')
    al = create(:student, name: 'Al')
    [bea, al].each {|student| create(:follower, section: section, student_user: student)}

    DASHBOARD_DB.transaction(rollback: :always) do
      storage_ids = {al => create_storage_id_for_user(al.id), bea => create_storage_id_for_user(bea.id)}
      create_project = lambda do |student, value|
        Projects.new(storage_ids[student]).create(value, ip: '127.0.0.1')
      end

      al_channel = create_project.call(al, {'name' => 'Al App', 'level' => '/projects/applab'})
      create_project.call(al, {'name' => 'Al Level', 'level' => '/projects/applab', 'hidden' => true})
      bea_channel = create_project.call(bea, {'name' => 'Bea App', 'level' => '/projects/spritelab'})

      projects = nil
      few_projects_queries = count_dashboard_db_selects {projects = ProjectsList.fetch_section_projects(section)}
      assert_equal(
        [['Al', 'Al App', al_channel, 'applab'], ['Bea', 'Bea App', bea_channel, 'spritelab']],
        projects.map {|project| project.values_at(:studentName, :name, :channel, :type)}
      )

      10.times do |i|
        create_project.call(al, {'name' => "Al Level #{i}", 'level' => '/projects/applab', 'hidden' => true})
        create_project.call(bea, {'name' => "Bea App #{i}", 'level' => '/projects/spritelab'})
      end
      many_projects_queries = count_dashboard_db_selects {projects = ProjectsList.fetch_section_projects(section)}
      assert_equal 12, projects.size
      assert_equal few_projects_queries, many_projects_queries
    end
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
        value: {libraryName: applab_lib_name, libraryDescription: description, hidden: true}.to_json,
        state: 'active'
      },
      {
        name: gamelab_lib_name,
        properties: {}.to_json,
        birthday: 13.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 2,
        project_type: 'gamelab',
        value: {libraryName: gamelab_lib_name, libraryDescription: description}.to_json,
        state: 'active'
      }
    ]
    stub_users = {
      @storage_id => 4,
      @teacher_storage_id => 6
    }
    mock_user = Struct.new(:id, :name)
    teacher = mock_user.new(6, teacher_name)
    student = mock_user.new(4, student_name)
    mock_section = Struct.new(:students, :user, :id, :name, :user_id)
    section = mock_section.new([student], teacher, 321, 'sectionName', teacher.id)

    ProjectsList.stubs(:get_user_ids_by_storage_ids).returns(stub_users)
    Projects.stubs(:table).returns(library_db_result(stub_projects))

    Projects.stubs(:get_published_project_data).returns({})
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
        value: {libraryName: applab_lib_name, libraryDescription: description}.to_json,
        state: 'active'
      }
    ]
    stub_users = {
      @storage_id => 4
    }
    mock_user = Struct.new(:id, :name, :user_type)
    section_owner = mock_user.new(6, section_owner_name, 'teacher')
    section_participant = mock_user.new(4, section_participant_name, 'teacher')
    mock_section = Struct.new(:students, :user, :id, :name, :user_id)
    section = mock_section.new([section_participant], section_owner, 321, 'sectionName', section_owner.id)

    ProjectsList.stubs(:get_user_ids_by_storage_ids).returns(stub_users)
    Projects.stubs(:table).returns(library_db_result(stub_projects))

    Projects.stubs(:get_published_project_data).returns({})
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
        value: {libraryName: shared_lib_name, libraryDescription: description, sharedWith: [321]}.to_json,
        state: 'active'
      },
      {
        name: unshared_lib_name,
        properties: {}.to_json,
        birthday: 25.years.ago.to_datetime,
        storage_id: @storage_id,
        id: 4,
        project_type: 'applab',
        value: {libraryName: unshared_lib_name, libraryDescription: description}.to_json,
        state: 'active'
      }
    ]
    stub_users = {
      @storage_id => 4
    }
    mock_user = Struct.new(:id, :name)
    teacher = mock_user.new(4, teacher_name)
    mock_section = Struct.new(:students, :user, :id, :name, :user_id)
    section = mock_section.new([], teacher, 321, 'sectionName', teacher.id)

    ProjectsList.stubs(:get_user_ids_by_storage_ids).returns(stub_users)
    Projects.stubs(:table).returns(library_db_result(stub_projects))

    Projects.stubs(:get_published_project_data).returns({})
    lib_response = ProjectsList.send(:fetch_section_libraries, section)
    assert_equal 1, lib_response.length
    assert_equal shared_lib_name, lib_response[0][:name]
    assert_equal description, lib_response[0][:description]
    assert_equal teacher_name, lib_response[0][:userName]
  end

  test 'fetch_updated_library_channels returns channel_ids of libraries that have been updated' do
    updated_channel_id = get_project_channel_id(1, 1)
    libraries = [
      {'channel_id' => updated_channel_id, 'version' => '1'},
      {'channel_id' => get_project_channel_id(1, 2), 'version' => '1'},
      {'channel_id' => get_project_channel_id(1, 3), 'version' => '1'}
    ]
    stub_projects = [
      {
        id: 1,
        value: {latestLibraryVersion: '2'}.to_json
      },
      {
        id: 2,
        value: {latestLibraryVersion: '1'}.to_json
      },
      {
        id: 3,
        value: {}.to_json
      }
    ]

    Projects.stubs(:table).returns(stub(where: stub_projects))

    updated_channel_ids = ProjectsList.fetch_updated_library_channels(libraries)
    assert_equal [updated_channel_id], updated_channel_ids
  end

  test 'fetch_updated_library_channels returns empty array if no libraries given' do
    assert_equal [], ProjectsList.fetch_updated_library_channels([])
  end

  private def count_dashboard_db_selects
    log = StringIO.new
    logger = Logger.new(log)
    DASHBOARD_DB.loggers << logger
    yield
    log.string.lines.count {|line| line.include?('SELECT')}
  ensure
    DASHBOARD_DB.loggers.delete(logger)
  end

  private def user_db_result(result)
    stub(where: stub(select_hash: result))
  end

  private def library_db_result(result)
    stub(where: stub(where: stub(where: result, first: result.first), first: result.first))
  end

  private def db_result(result)
    stub(select: stub(join: stub(join: stub(where: stub(where: stub(exclude: stub(order: stub(limit: result))))))))
  end
end
