require 'test_helper'

class SectionTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @student = create :student
    @teacher = create :teacher
    @section = create :section, teacher: @teacher

    @default_attrs = {user: @teacher, name: 'test-section'}
  end

  test "sections are soft-deleted" do
    assert_no_change("Section.with_deleted.count") do
      @section.destroy
      assert @section.reload.deleted?
    end
  end

  test "destroying section destroys appropriate followers" do
    delete_time = Time.now - 1.day
    already_deleted_follower = create :follower, section: @section
    Timecop.freeze(delete_time) do
      already_deleted_follower.destroy
    end
    follower = create :follower, section: @section

    @section.reload.destroy

    assert @section.reload.deleted?
    assert follower.reload.deleted?
    assert already_deleted_follower.reload.deleted?
    assert_equal delete_time.utc.to_s, already_deleted_follower.deleted_at.to_s
  end

  test "restoring section restores appropriate followers" do
    old_deleted_follower = create :follower, section: @section
    Timecop.freeze(Time.now - 1.day) do
      old_deleted_follower.reload.destroy
    end
    new_deleted_follower = create :follower, section: @section

    @section.reload.destroy
    assert @section.reload.deleted?
    assert new_deleted_follower.reload.deleted?
    assert old_deleted_follower.reload.deleted?

    Section.with_deleted.find_by_id(@section.id).restore(recursive: true, recovery_window: 5.minutes)

    refute @section.reload.deleted?
    refute new_deleted_follower.reload.deleted?
    assert old_deleted_follower.reload.deleted?
  end

  test "create assigns unique section codes" do
    sections = 3.times.map do
      # Repeatedly seed the RNG so we get the same "random" codes.
      srand 1
      Section.create!(@default_attrs)
    end

    assert_equal 3, sections.map(&:code).uniq.count
  end

  test "create assigns vowelless section codes" do
    letters_without_vowels_regex = /^[A-Z&&[^AEIOU]]{6}$/

    3.times do
      section = create :section
      assert_match letters_without_vowels_regex, section.code
    end
  end

  test 'update_student_sharing updates user settings' do
    student = create :student, sharing_disabled: false
    section = create :section, sharing_disabled: false
    section.add_student student
    section.update_student_sharing(true)
    student.reload
    assert student.sharing_disabled?
    section.update_student_sharing(false)
    student.reload
    refute student.sharing_disabled?
  end

  test 'adding student updates their share setting when section share is disabled' do
    section = create :section, sharing_disabled: true
    student = create :student, sharing_disabled: false
    section.add_student student
    assert student.sharing_disabled?
  end

  test 'adding student preserves their share setting when section share is enabled' do
    section = create :section, sharing_disabled: false
    student = create :student, age: 11, sharing_disabled: true

    section.add_student student
    assert student.sharing_disabled?
  end

  test 'removing a student from their last section enables student sharing when over 13' do
    section1 = Section.create @default_attrs
    section1.sharing_disabled = true

    section2 = Section.create @default_attrs
    section2.sharing_disabled = true

    student = create :student
    student.age = 15
    section1.add_student student
    section2.add_student student

    section2.remove_student student, section2, {}
    assert student.sharing_disabled?
    section1.remove_student student, section1, {}
    refute student.sharing_disabled?
  end

  test 'removing a student from their last section restricts sharing when under 13' do
    section1 = Section.create @default_attrs
    section1.sharing_disabled = true

    section2 = Section.create @default_attrs
    section2.sharing_disabled = true

    student = create :student
    student.age = 11
    section1.add_student student
    section2.add_student student

    section2.remove_student student, section2, {}
    assert student.sharing_disabled?
    section1.remove_student student, section1, {}
    assert student.sharing_disabled?
  end

  # Ideally this test would also confirm user_must_be_teacher is only validated for non-deleted
  # sections. As this situation cannot happen without manipulating the DB (dependent callbacks),
  # we do not worry about testing it.
  test 'name and user not required for deleted sections' do
    section = create :section
    section.destroy
    section.name = nil
    section.user = nil

    assert section.valid?
  end

  test 'name is required' do
    section = build :section, name: nil
    refute section.valid?
    assert_equal ['Name is required'], section.errors.full_messages
  end

  test 'user is required' do
    section = build :section, user: nil
    refute section.valid?
    assert_equal ['User is required', 'User must be a teacher'], section.errors.full_messages
  end

  test "user must be teacher" do
    assert_creates(Section) do
      Section.create @default_attrs
    end

    assert_does_not_create(Section) do
      student_attrs = @default_attrs.merge(user: @student)
      student_section = Section.create student_attrs
      refute student_section.valid?
      assert_equal ["User must be a teacher"], student_section.errors.full_messages
    end
  end

  test "can create section with duplicate name" do
    assert_difference -> {Section.count}, 2 do
      2.times do
        Section.create! @default_attrs
      end
    end
  end

  test "can destroy section with students" do
    follower = create :follower
    section = follower.section

    assert section.destroy
    refute Section.exists?(section.id)
    refute Follower.exists?(follower.id)
  end

  test "can destroy section without students" do
    assert @section.destroy

    refute Section.exists?(@section.id)
  end

  test 'add_student adds student to section' do
    result = nil
    assert_creates(Follower) do
      result = @section.add_student @student
    end
    assert_equal result, Section::ADD_STUDENT_SUCCESS
    assert @section.students.exists?(@student.id)
  end

  test 'add_student is idempotent' do
    result = @section.add_student @student
    assert_equal result, Section::ADD_STUDENT_SUCCESS

    result = @section.add_student @student
    assert_equal result, Section::ADD_STUDENT_EXISTS

    assert_equal 1, @section.followers.count
    assert_equal [@student.id], @section.followers.all.map(&:student_user_id)
  end

  test 'add student undeletes existing follower' do
    follower = create :follower, section: @section, student_user: @student
    follower.destroy

    result = nil
    assert_no_change('Follower.with_deleted.count') do
      assert_creates(Follower) do
        result = @section.add_student @student
      end
    end
    assert_equal result, Section::ADD_STUDENT_SUCCESS
    refute follower.reload.deleted?
  end

  test 'add_student raises for admin students' do
    assert_raises do
      assert_does_not_create(Follower) do
        @section.add_student (create :admin)
      end
    end
  end

  test 'add_student returns failure for section teacher' do
    assert_does_not_create(Follower) do
      add_student_return = @section.add_student @teacher
      assert_equal Section::ADD_STUDENT_FAILURE, add_student_return
    end
  end

  test 'add_and_remove_student moves enrollment' do
    old_section = create :section
    new_section = create :section
    student = (create :follower, section: old_section).student_user
    new_section.add_and_remove_student(student, old_section)

    followers = Follower.with_deleted.where(student_user: student).all

    assert_equal 2, followers.count
    assert_equal old_section, followers.first.section
    assert followers.first.deleted?
    assert_equal new_section, followers.second.section
  end

  test 'add_and_remove_student noops unless old follower is found' do
    @section.add_and_remove_student(@student, create(:section))

    assert_equal 0, Follower.where(student_user: @student).count
  end

  test 'section_type validation' do
    section = build :section

    section.section_type = 'invalid_section_type'
    refute section.valid?
    assert_equal 1, section.errors.count
    assert_equal 'Section type is not included in the list', section.errors.full_messages.first

    section.section_type = Section::TYPES.first
    assert section.valid?

    section.section_type = nil
    assert section.valid?
  end

  test 'workshop_section?' do
    Pd::Workshop::SECTION_TYPES.each do |type|
      assert Section.new(section_type: type).workshop_section?
    end

    refute Section.new.workshop_section?
    refute Section.new(section_type: 'not_a_workshop').workshop_section?
  end

  test 'name safe students' do
    def verify(actual, expected)
      section = create :section
      actual.each do |name|
        result = section.add_student create(:student, name: name)
        assert_equal result, Section::ADD_STUDENT_SUCCESS
      end
      result = section.name_safe_students.map(&:name)
      assert_equal expected, result
    end

    # uses first names if possible
    verify(["Laura Ferno", "Natalie Ferno"], ["Laura", "Natalie"])

    # uses the minimum characters from the last name if necessary
    verify(["John Smith", "John Stamos"], ["John Sm", "John St"])

    # Handles a variety of combinations
    verify(
      ["Dick Smith", "Dick Tracer", "Harry Smith", "Tom Clancy", "Tom Saywer", "Tom Smith"],
      ["Dick S", "Dick T", "Harry", "Tom C", "Tom Sa", "Tom Sm"]
    )

    # Handles names that can't be nicely split into first and last, or
    # names which use unusual separating characters
    verify(
      [" Abraham Lincoln ", "Cher", "J'onn J'onzz", "John\tDoe", "Mister\tT"],
      ["Abraham", "Cher", "J'onn J'onzz", "John", "Mister T"]
    )

    # Handles abbreviated first names by defaulting back to the "full"
    # name. Abbreviations are a single letter or a single letter
    # followed by a period; two-letter names are still allowed
    verify(
      ["Bo Burnham", "J. Crew", "T Bone"],
      ["Bo", "J. Crew", "T Bone"]
    )

    # Handles names that have other names as their strict subset
    verify(['Thor', 'Thor Odinson'], ['Thor', 'Thor O'])
  end

  test 'teacher_dashboard_url' do
    section = build :section

    expected_url = "https://#{CDO.pegasus_hostname}/teacher-dashboard#/sections/#{section.id}/manage"
    assert_equal expected_url, section.teacher_dashboard_url
  end

  test 'clean_data' do
    section = create :section
    section.clean_data
    assert_equal Section::SYSTEM_DELETED_NAME, section.reload.name
  end

  test 'default_script: no script or course assigned' do
    section = create :section, script: nil, course: nil
    assert_nil section.default_script
  end

  test 'default_script: script assigned, no course assigned' do
    script = create :script
    section = create :section, script: script, course: nil
    assert_equal script, section.default_script
  end

  test 'default_script: script and course assigned' do
    script1 = create :script
    script2 = create :script
    course = create :course
    create :course_script, course: course, script: script1, position: 1
    create :course_script, course: course, script: script2, position: 2
    course.reload

    section = create :section, script: script2, course: course
    assert_equal script2, section.default_script
  end

  test 'default_script: no script assigned, course assigned' do
    script1 = create :script
    script2 = create :script
    course = create :course
    create :course_script, course: course, script: script1, position: 1
    create :course_script, course: course, script: script2, position: 2
    course.reload

    section = create :section, script: nil, course: course
    assert_equal script1, section.default_script
  end

  test 'summarize: section with a course assigned' do
    course = create :course, name: 'somecourse'
    section = create :section, script: nil, course: course

    expected = {
      id: section.id,
      name: section.name,
      teacherName: section.teacher.name,
      linkToProgress: "//test.code.org/teacher-dashboard#/sections/#{section.id}/progress",
      assignedTitle: 'somecourse',
      linkToAssigned: '/courses/somecourse',
      numberOfStudents: 0,
      linkToStudents: "//test.code.org/teacher-dashboard#/sections/#{section.id}/manage",
      code: section.code,
      stage_extras: false,
      pairing_allowed: true,
      sharing_disabled: false,
      login_type: "email",
      course_id: course.id,
      script: {id: nil, name: nil},
      studentCount: 0,
      grade: nil,
      providerManaged: false,
      hidden: false,
    }
    assert_equal expected, section.summarize
  end

  test 'summarize: section with a script assigned' do
    # Use an existing script so that it has a translation
    script = Script.find_by_name('jigsaw')
    section = create :section, script: script, course: nil

    expected = {
      id: section.id,
      name: section.name,
      teacherName: section.teacher.name,
      linkToProgress: "//test.code.org/teacher-dashboard#/sections/#{section.id}/progress",
      assignedTitle: 'Jigsaw',
      linkToAssigned: '/s/jigsaw',
      numberOfStudents: 0,
      linkToStudents: "//test.code.org/teacher-dashboard#/sections/#{section.id}/manage",
      code: section.code,
      stage_extras: false,
      pairing_allowed: true,
      sharing_disabled: false,
      login_type: "email",
      course_id: nil,
      script: {id: script.id, name: script.name},
      studentCount: 0,
      grade: nil,
      providerManaged: false,
      hidden: false,
    }
    assert_equal expected, section.summarize
  end

  test 'summarize: section with both a course and a script' do
    # Use an existing script so that it has a translation
    script = Script.find_by_name('jigsaw')
    course = create :course, name: 'somecourse'
    # If this were a real section, it would actually have a script that is part of
    # the provided course
    section = create :section, script: script, course: course

    expected = {
      id: section.id,
      name: section.name,
      teacherName: section.teacher.name,
      linkToProgress: "//test.code.org/teacher-dashboard#/sections/#{section.id}/progress",
      assignedTitle: 'somecourse',
      linkToAssigned: '/courses/somecourse',
      numberOfStudents: 0,
      linkToStudents: "//test.code.org/teacher-dashboard#/sections/#{section.id}/manage",
      code: section.code,
      stage_extras: false,
      pairing_allowed: true,
      sharing_disabled: false,
      login_type: "email",
      course_id: course.id,
      script: {id: script.id, name: script.name},
      studentCount: 0,
      grade: nil,
      providerManaged: false,
      hidden: false,
    }
    assert_equal expected, section.summarize
  end

  test 'summarize: section with neither course or script assigned' do
    section = create :section, script: nil, course: nil

    expected = {
      id: section.id,
      name: section.name,
      teacherName: section.teacher.name,
      linkToProgress: "//test.code.org/teacher-dashboard#/sections/#{section.id}/progress",
      assignedTitle: '',
      linkToAssigned: '//test.code.org/teacher-dashboard#/sections/',
      numberOfStudents: 0,
      linkToStudents: "//test.code.org/teacher-dashboard#/sections/#{section.id}/manage",
      code: section.code,
      stage_extras: false,
      pairing_allowed: true,
      sharing_disabled: false,
      login_type: "email",
      course_id: nil,
      script: {id: nil, name: nil},
      studentCount: 0,
      grade: nil,
      providerManaged: false,
      hidden: false,
    }
    assert_equal expected, section.summarize
  end

  test 'valid_grade? accepts K-12 and Other' do
    assert Section.valid_grade?("K")
    assert Section.valid_grade?("1")
    assert Section.valid_grade?("6")
    assert Section.valid_grade?("12")
    assert Section.valid_grade?("Other")
  end

  test 'valid_grade? does not accept invalid numbers and strings' do
    refute Section.valid_grade?("Something else")
    refute Section.valid_grade?("56")
  end

  class HasSufficientDiscountCodeProgress < ActiveSupport::TestCase
    self.use_transactional_test_case = true

    def create_script_with_levels(name, level_type)
      script = create :script, name: name
      stage = create :stage, script: script
      # 5 non-programming levels
      5.times do
        create :script_level, script: script, stage: stage, levels: [create(:unplugged)]
      end

      # 5 programming levels
      5.times do
        create :script_level, script: script, stage: stage, levels: [create(level_type)]
      end
      script
    end

    # Create progress for student in given script. Assumes all levels are either
    # Unplugged or some form of programming level
    # @param {Script} script
    # @param {User} student
    # @param {number} num_programming_levels
    # @param {number} num_non_programming_levels
    def simulate_student_progress(script, student, num_programming_levels, num_non_programing_levels)
      progress_levels = script.levels.select {|level| level.is_a?(Unplugged)}.first(num_non_programing_levels) +
        script.levels.select {|level| !level.is_a?(Unplugged)}.first(num_programming_levels)

      progress_levels.each do |level|
        create :user_level, level: level, user: student, script: script
      end
    end

    setup_all do
      @csd2 = create_script_with_levels('csd2', :weblab)
      @csd3 = create_script_with_levels('csd3', :gamelab)
    end

    test 'returns true when all conditions met' do
      section = create :section
      10.times do
        follower = create :follower, section: section
        simulate_student_progress(@csd2, follower.student_user, 5, 0)
        simulate_student_progress(@csd3, follower.student_user, 5, 0)
      end
      assert_equal true, section.has_sufficient_discount_code_progress?
    end

    test 'returns false if only enough progress in one script' do
      section = create :section
      10.times do
        follower = create :follower, section: section
        simulate_student_progress(@csd2, follower.student_user, 5, 0)
        # no progress in csd3
      end
      assert_equal false, section.has_sufficient_discount_code_progress?
    end

    test 'return false if not enough progress in programming levels' do
      section = create :section
      10.times do
        follower = create :follower, section: section
        # Though we have 7 levels of progress in each script, only 4 of those are
        # for programming levels
        simulate_student_progress(@csd2, follower.student_user, 4, 3)
        simulate_student_progress(@csd3, follower.student_user, 4, 3)
      end
      assert_equal false, section.has_sufficient_discount_code_progress?
    end

    test 'returns false if not enough students have progress' do
      section = create :section
      9.times do
        follower = create :follower, section: section
        # Though we have 7 levels of progress in each script, only 4 of those are
        # for programming levels
        simulate_student_progress(@csd2, follower.student_user, 4, 3)
        simulate_student_progress(@csd3, follower.student_user, 4, 3)
      end
      # 10th student has no progress
      create :follower, section: section

      assert_equal false, section.has_sufficient_discount_code_progress?
    end
  end
end
