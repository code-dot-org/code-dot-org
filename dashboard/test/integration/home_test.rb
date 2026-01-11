require 'test_helper'

class HomeTest < ActionDispatch::IntegrationTest
  self.use_transactional_test_case = true

  setup_all do
    @student = create(:student)
    @teacher = create(:teacher)
    @section = create(:section, user_id: @teacher.id)
    Follower.create!(section_id: @section.id, student_user_id: @student.id, user: @teacher)

    @teacher_of_teachers = create(:teacher)
    @section_of_teachers = create(:section, user_id: @teacher_of_teachers.id)
    Follower.create!(section_id: @section_of_teachers.id, student_user_id: @teacher.id, user: @teacher_of_teachers)
  end

  test 'student homepage does not contain secret words' do
    sign_in @student
    get '/home'
    assert_select 'script[data-homepage]' do |elements|
      data = elements.first['data-homepage']
      assert_includes data, 'teacherName'
      refute_includes data, 'numberOfStudents'
      refute_includes data, 'secret_words'
    end
  end

  test 'teacher homepage does not contain secret words' do
    sign_in @teacher
    get '/teacher_dashboard/home'
    assert_select 'script[data-dashboard]' do |elements|
      data = JSON.parse(elements.first['data-dashboard'])
      assert_nil data['section']['secret_words']
    end
  end

  test 'student home shows no topCourse or courses initially' do
    student = create(:student)
    sign_in student

    get '/home'
    assert_response :success

    assert_select 'script[data-homepage]' do |elements|
      data = JSON.parse(elements.first['data-homepage'])
      assert_nil data['topCourse'], 'topCourse should be nil initially'
      assert_empty data['courses'], 'courses should be empty initially'
    end
  end

  test 'student home shows topCourse and courses after milestone in original course' do
    # Create a unit with levels
    unit = create(:unit, :with_levels)

    # Create two single_unit_courses for the same unit with stable published state
    original_course = create(:single_unit_course, :stable, unit: unit)
    create(:single_unit_course, :stable, unit: unit)

    # Create and sign in as student
    student = create(:student)
    sign_in student

    # Get a script_level from the unit for milestone posts
    script_level = unit.script_levels.first
    level = script_level.oldest_active_level

    # Post milestone for the level in the context of original course
    post "/milestone/0/#{script_level.id}", params: {
      course_id: original_course.id,
      level_id: level.id,
      result: 'true',
      testResult: 100,
      program: '<xml/>'
    }
    assert_response :success

    # Hit home controller and verify topCourse and courses are set
    get '/home'
    assert_response :success

    assert_select 'script[data-homepage]' do |elements|
      data = JSON.parse(elements.first['data-homepage'])

      # Verify topCourse is set and references the unit/course
      refute_nil data['topCourse'], 'topCourse should be set after milestone'
      assert_includes data['topCourse']['linkToOverview'], original_course.name

      # Verify courses array contains the course
      refute_empty data['courses'], 'courses should not be empty after milestone'
      course_names = data['courses'].map {|c| c['link']}.compact
      assert course_names.any? {|link| link.include?(original_course.name)},
        'courses should include the original course'
    end
  end

  test 'student home shows topCourse and courses after milestone in other course' do
    # Create a unit with levels
    unit = create(:unit, :with_levels)

    # Create two single_unit_courses for the same unit with stable published state
    create(:single_unit_course, :stable, unit: unit)
    other_course = create(:single_unit_course, :stable, unit: unit)

    # Create and sign in as student
    student = create(:student)
    sign_in student

    # Get a script_level from the unit for milestone posts
    script_level = unit.script_levels.first
    level = script_level.oldest_active_level

    # Post milestone for the level in the context of other course
    post "/milestone/0/#{script_level.id}", params: {
      course_id: other_course.id,
      level_id: level.id,
      result: 'true',
      testResult: 100,
      program: '<xml/>'
    }
    assert_response :success

    # Hit home controller and verify topCourse and courses are set
    get '/home'
    assert_response :success

    assert_select 'script[data-homepage]' do |elements|
      data = JSON.parse(elements.first['data-homepage'])

      # Verify topCourse is set and references the unit/other course
      refute_nil data['topCourse'], 'topCourse should be set after milestone'
      assert_includes data['topCourse']['linkToOverview'], other_course.name

      # Verify courses array contains the course
      refute_empty data['courses'], 'courses should not be empty after milestone'
      course_names = data['courses'].map {|c| c['link']}.compact
      assert course_names.any? {|link| link.include?(other_course.name)},
        'courses should include the other course'
    end
  end

  test 'student home shows all courses after milestones in multiple courses' do
    Timecop.freeze do
      # Create two units with levels
      unit1 = create(:unit, :with_levels)
      unit2 = create(:unit, :with_levels)

      # Create single_unit_courses with stable published state
      course1 = create(:single_unit_course, :stable, unit: unit1)
      course2 = create(:single_unit_course, :stable, unit: unit2)

      # Create and sign in as student
      student = create(:student)
      sign_in student

      # Post milestone for first course
      script_level1 = unit1.script_levels.first
      level1 = script_level1.oldest_active_level
      post "/milestone/0/#{script_level1.id}", params: {
        course_id: course1.id,
        level_id: level1.id,
        result: 'true',
        testResult: 100,
        program: '<xml/>'
      }
      assert_response :success

      # Move time forward to make the second milestone more recent
      Timecop.travel 1.hour

      # Post milestone for second course
      script_level2 = unit2.script_levels.first
      level2 = script_level2.oldest_active_level
      post "/milestone/0/#{script_level2.id}", params: {
        course_id: course2.id,
        level_id: level2.id,
        result: 'true',
        testResult: 100,
        program: '<xml/>'
      }
      assert_response :success

      # Hit home controller and verify both courses are shown
      get '/home'
      assert_response :success

      assert_select 'script[data-homepage]' do |elements|
        data = JSON.parse(elements.first['data-homepage'])

        # Verify topCourse is set to the most recent course (course2)
        refute_nil data['topCourse'], 'topCourse should be set after milestones'
        assert_includes data['topCourse']['linkToOverview'], course2.name,
          'topCourse should be the most recently accessed course (course2)'

        # Verify courses array contains both courses
        assert_equal 2, data['courses'].length, 'courses should contain exactly 2 courses'
        course_links = data['courses'].map {|c| c['link']}.compact
        puts "course_links: #{course_links.inspect}"

        assert course_links.any? {|link| link.include?(course1.name)},
          'courses should include a link to the first course'
        assert course_links.any? {|link| link.include?(course2.name)},
          'courses should include a link to the second course'
      end
    end
  ensure
    Timecop.return
  end
end
