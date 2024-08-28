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

  test "destroying section destroys associated LTI section" do
    section = create :section
    lti_section = create :lti_section, section: section
    section.destroy
    assert lti_section.reload.deleted_at.present?, "LTI section should be soft deleted"
    assert LtiSection.without_deleted.where(id: lti_section.id).empty?, "LTI section should be soft deleted"
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
    sections = Array.new(3) do
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

  test 'should raise error if grades is not valid' do
    section1 = Section.create @default_attrs

    error = assert_raises do
      section1.grades = ['fake_grade']
      section1.save!
    end

    assert_includes error.message, 'Grades must be one or more of the valid student grades'
  end

  test 'should raise error if grades contain pl and others' do
    section1 = Section.create @default_attrs

    error = assert_raises do
      section1.grades = ['pl', '1']
      section1.save!
    end

    assert_includes error.message, 'Grades cannot combine pl with other grades'
  end

  test 'grades are sorted on save' do
    section = Section.create @default_attrs

    section.update!(grades: ['12', '1', '5', 'K'])
    section.reload
    assert_equal section.grades, ['K', '1', '5', '12']

    section.update!(grades: ['10', 'Other', '1', '2'])
    section.reload
    assert_equal section.grades, ['1', '2', '10', 'Other']

    section.update!(grades: ['Other', '1', 'K'])
    section.reload
    assert_equal section.grades, ['K', '1', 'Other']
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

  test 'emoji is dropped from section name' do
    section = create :section, name: "\u{1F600} Test Section A \u{1F600}"
    assert_equal 'Test Section A', section.name
  end

  test 'section gets a default name if it is empty after emoji removal' do
    section = create :section, name: "\u{1F600} \u{1F600} \u{1F600}"
    assert_equal 'Untitled Section', section.name
  end

  test 'pl section must use email logins required' do
    section = build :section, :teacher_participants, login_type: 'word'
    refute section.valid?
    assert_equal ['Login type must be email for professional learning sections.'], section.errors.full_messages
  end

  test 'pl section must use pl grade' do
    section = build :section, :teacher_participants, grades: ['Other']
    refute section.valid?
    assert_equal ['Grades must be ["pl"] for pl section.'], section.errors.full_messages
  end

  test 'can not update participant type' do
    section = create :section, participant_type: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student

    error = assert_raises do
      section.participant_type = Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
      section.grades = ['pl']
      section.save!
    end

    assert_equal "Validation failed: Participant type can not be update once set.", error.message
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
    assert_does_not_create(Follower) do
      assert_raises ActiveRecord::RecordInvalid do
        @section.add_student(create(:admin))
      end
    end
  end

  test 'add_student returns failure for section teacher' do
    assert_does_not_create(Follower) do
      add_student_return = @section.add_student @teacher
      assert_equal Section::ADD_STUDENT_FAILURE, add_student_return
    end
  end

  test 'add_student returns failure for section instructor' do
    section_owner = create :teacher
    section = create :section, user: section_owner
    create :section_instructor, section: section, instructor: @teacher, status: :active

    assert_does_not_create(Follower) do
      add_student_return = section.add_student @teacher
      assert_equal Section::ADD_STUDENT_FAILURE, add_student_return
    end
  end

  test 'add_student returns failure if user does not meet participant_type for section' do
    section_with_teacher_participants = build :section, :teacher_participants
    assert_does_not_create(Follower) do
      add_student_return = section_with_teacher_participants.add_student @student
      assert_equal Section::ADD_STUDENT_FORBIDDEN, add_student_return
    end
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

  test 'externally_rostered?' do
    [Section::LOGIN_TYPE_GOOGLE_CLASSROOM, Section::LOGIN_TYPE_CLEVER].each do |type|
      assert Section.new(login_type: type).externally_rostered?
    end

    refute Section.new.externally_rostered?
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

  test 'default_script: no script or course assigned' do
    section = create :section, script: nil, unit_group: nil
    assert_nil section.default_script
  end

  test 'default_script: script assigned, no course assigned' do
    script = create :script
    section = create :section, script: script, unit_group: nil
    assert_equal script, section.default_script
  end

  test 'default_script: script and course assigned' do
    script1 = create :script
    script2 = create :script
    unit_group = create :unit_group
    create :unit_group_unit, unit_group: unit_group, script: script1, position: 1
    create :unit_group_unit, unit_group: unit_group, script: script2, position: 2
    unit_group.reload

    section = create :section, script: script2, unit_group: unit_group
    assert_equal script2, section.default_script
  end

  test 'default_script: no script assigned, course assigned' do
    script1 = create :script
    script2 = create :script
    unit_group = create :unit_group
    create :unit_group_unit, unit_group: unit_group, script: script1, position: 1
    create :unit_group_unit, unit_group: unit_group, script: script2, position: 2
    unit_group.reload

    section = create :section, script: nil, unit_group: unit_group
    assert_equal script1, section.default_script
  end

  test 'concise_summarize: section with a course assigned' do
    unit_group = create :unit_group, name: 'somecourse', version_year: '1991', family_name: 'some-family'
    CourseOffering.add_course_offering(unit_group)

    Timecop.freeze(Time.zone.now) do
      section = create :section, script: nil, unit_group: unit_group

      expected = {
        id: section.id,
        name: section.name,
        courseVersionName: 'somecourse',
        login_type: "email",
        grades: nil,
        providerManaged: false,
        lesson_extras: false,
        pairing_allowed: true,
        tts_autoplay_enabled: false,
        sharing_disabled: false,
        studentCount: 0,
        code: section.code,
        course_display_name: unit_group.course_version.localized_title,
        course_offering_id: unit_group.course_version.course_offering.id,
        course_version_id: unit_group.course_version.id,
        unit_id: nil,
        course_id: unit_group.id,
        hidden: false,
        restrict_section: false,
        post_milestone_disabled: false,
        code_review_expires_at: nil,
        is_assigned_csa: false,
        participant_type: 'student',
        sectionInstructors: [{id: section.section_instructors[0].id, status: "active", instructor_name: section.teacher.name, instructor_email: section.teacher.email}],
        sync_enabled: nil,
        ai_tutor_enabled: false,
      }
      # Compare created_at separately because the object's created_at microseconds
      # don't match Time.zone.now's microseconds (different levels of precision)
      assert_equal Time.zone.now.change(sec: 0), section.created_at.change(sec: 0)
      assert_equal expected, section.concise_summarize.except!(:createdAt)
    end
  end

  test 'concise_summarize: section with a script assigned' do
    # Use an existing script so that it has a translation
    script = Unit.find_by_name('jigsaw')
    CourseOffering.add_course_offering(script)

    Timecop.freeze(Time.zone.now) do
      section = create :section, script: script, unit_group: nil

      expected = {
        id: section.id,
        name: section.name,
        courseVersionName: 'jigsaw',
        login_type: "email",
        grades: nil,
        providerManaged: false,
        lesson_extras: false,
        pairing_allowed: true,
        tts_autoplay_enabled: false,
        sharing_disabled: false,
        studentCount: 0,
        code: section.code,
        course_display_name: script.course_version.localized_title,
        course_offering_id: script.course_version.course_offering.id,
        course_version_id: script.course_version.id,
        unit_id: nil,
        course_id: nil,
        hidden: false,
        restrict_section: false,
        post_milestone_disabled: false,
        code_review_expires_at: nil,
        is_assigned_csa: false,
        participant_type: 'student',
        sectionInstructors: [{id: section.section_instructors[0].id, status: "active", instructor_name: section.teacher.name, instructor_email: section.teacher.email}],
        sync_enabled: nil,
        ai_tutor_enabled: false,
      }
      # Compare created_at separately because the object's created_at microseconds
      # don't match Time.zone.now's microseconds (different levels of precision)
      assert_equal Time.zone.now.change(sec: 0), section.created_at.change(sec: 0)
      assert_equal expected, section.concise_summarize.except!(:createdAt)
    end
  end

  test 'concise_summarize: section with a coteacher' do
    # Use an existing script so that it has a translation
    script = Unit.find_by_name('jigsaw')
    CourseOffering.add_course_offering(script)

    Timecop.freeze(Time.zone.now) do
      section = create :section
      coteacher_user = create :teacher
      primary_section_instructor_id = section.section_instructors[0].id
      coteacher_section_instructor = section.invite_instructor(coteacher_user.email, current_user)
      section.reload

      expected = {
        id: section.id,
        name: section.name,
        courseVersionName: nil,
        login_type: "email",
        grades: nil,
        providerManaged: false,
        lesson_extras: false,
        pairing_allowed: true,
        tts_autoplay_enabled: false,
        sharing_disabled: false,
        studentCount: 0,
        code: section.code,
        course_display_name: nil,
        course_offering_id: nil,
        course_version_id: nil,
        unit_id: nil,
        course_id: nil,
        hidden: false,
        restrict_section: false,
        post_milestone_disabled: false,
        code_review_expires_at: nil,
        is_assigned_csa: false,
        participant_type: 'student',
        sectionInstructors: [{id: primary_section_instructor_id, status: "active", instructor_name: section.teacher.name, instructor_email: section.teacher.email},
                             {id: coteacher_section_instructor.id, status: "invited", instructor_name: nil, instructor_email: coteacher_user.email}],
        sync_enabled: nil,
        ai_tutor_enabled: false,
      }
      # Compare created_at separately because the object's created_at microseconds
      # don't match Time.zone.now's microseconds (different levels of precision)
      assert_equal Time.zone.now.change(sec: 0), section.created_at.change(sec: 0)
      assert_equal expected, section.concise_summarize.except!(:createdAt)
    end
  end

  test 'concise_summarize: section with both a course and a script' do
    # Use an existing script so that it has a translation
    script = Unit.find_by_name('jigsaw')
    unit_group = create :unit_group, name: 'somecourse', version_year: '1991', family_name: 'some-family'
    CourseOffering.add_course_offering(unit_group)

    Timecop.freeze(Time.zone.now) do
      # If this were a real section, it would actually have a script that is part of
      # the provided course
      section = create :section, script: script, unit_group: unit_group

      expected = {
        id: section.id,
        name: section.name,
        courseVersionName: 'somecourse',
        login_type: "email",
        grades: nil,
        providerManaged: false,
        lesson_extras: false,
        pairing_allowed: true,
        tts_autoplay_enabled: false,
        sharing_disabled: false,
        studentCount: 0,
        code: section.code,
        course_display_name: unit_group.course_version.localized_title,
        course_offering_id: unit_group.course_version.course_offering.id,
        course_version_id: unit_group.course_version.id,
        unit_id: script.id,
        course_id: unit_group.id,
        hidden: false,
        restrict_section: false,
        post_milestone_disabled: false,
        code_review_expires_at: nil,
        is_assigned_csa: false,
        participant_type: 'student',
        sectionInstructors: [{id: section.section_instructors[0].id, status: "active", instructor_name: section.teacher.name, instructor_email: section.teacher.email}],
        sync_enabled: nil,
        ai_tutor_enabled: false,
      }
      # Compare created_at separately because the object's created_at microseconds
      # don't match Time.zone.now's microseconds (different levels of precision)
      assert_equal Time.zone.now.change(sec: 0), section.created_at.change(sec: 0)
      assert_equal expected, section.concise_summarize.except!(:createdAt)
    end
  end

  test 'concise_summarize: section with neither course or script assigned' do
    Timecop.freeze(Time.zone.now) do
      section = create :section, script: nil, unit_group: nil

      expected = {
        id: section.id,
        name: section.name,
        courseVersionName: nil,
        login_type: "email",
        grades: nil,
        providerManaged: false,
        lesson_extras: false,
        pairing_allowed: true,
        tts_autoplay_enabled: false,
        sharing_disabled: false,
        studentCount: 0,
        code: section.code,
        course_display_name: nil,
        course_offering_id: nil,
        course_version_id: nil,
        unit_id: nil,
        course_id: nil,
        hidden: false,
        restrict_section: false,
        post_milestone_disabled: false,
        code_review_expires_at: nil,
        is_assigned_csa: false,
        participant_type: 'student',
        sectionInstructors: [{id: section.section_instructors[0].id, status: "active", instructor_name: section.teacher.name, instructor_email: section.teacher.email}],
        sync_enabled: nil,
        ai_tutor_enabled: false,
      }
      # Compare created_at separately because the object's created_at microseconds
      # don't match Time.zone.now's microseconds (different levels of precision)
      assert_equal Time.zone.now.change(sec: 0), section.created_at.change(sec: 0)
      assert_equal expected, section.concise_summarize.except!(:createdAt)
    end
  end

  test 'concise_summarize: section with students' do
    section = create :section, script: nil, unit_group: nil
    create(:follower, section: section).student_user
    create(:follower, section: section).student_user

    summarized_section = section.concise_summarize
    assert_equal 2, summarized_section[:studentCount]
  end

  test 'concise_summarize: section with duplicate students' do
    section = create :section, script: nil, unit_group: nil
    student = create :student
    create(:follower, section: section, student_user: student)
    create(:follower, section: section, student_user: student)
    assert_equal 2, Follower.where(section: section, student_user: student).count

    summarized_section = section.concise_summarize
    assert_equal 1, summarized_section[:studentCount]
  end

  test 'concise_summarize: section with sharing disabled and script with project sharing' do
    script = create :script, project_sharing: true
    section = create :section, sharing_disabled: true, script: script, unit_group: nil
    summarized_section = section.concise_summarize

    assert summarized_section[:sharing_disabled]
  end

  test 'selected_section_summarize: section with no script' do
    unit_group = create :unit_group, name: 'somecourse', version_year: '1991', family_name: 'some-family'
    CourseOffering.add_course_offering(unit_group)

    Timecop.freeze(Time.zone.now) do
      section = create :section, script: nil, unit_group: unit_group

      expected = {
        id: section.id,
        name: section.name,
        login_type_name: "Email",
        script: {id: nil, name: nil, project_sharing: nil},
        students: [],
        any_student_has_progress: false,
      }
      # Compare created_at separately because the object's created_at microseconds
      # don't match Time.zone.now's microseconds (different levels of precision)
      assert_equal Time.zone.now.change(sec: 0), section.created_at.change(sec: 0)
      assert_equal expected, section.selected_section_summarize.except!(:createdAt)
    end
  end

  test 'selected_section_summarize: section with a script assigned' do
    # Use an existing script so that it has a translation
    script = Unit.find_by_name('jigsaw')
    CourseOffering.add_course_offering(script)

    Timecop.freeze(Time.zone.now) do
      section = create :section, script: script, unit_group: nil

      expected = {
        id: section.id,
        name: section.name,
        login_type_name: "Email",
        script: {id: script.id, name: script.name, project_sharing: nil},
        students: [],
        any_student_has_progress: false,
      }
      # Compare created_at separately because the object's created_at microseconds
      # don't match Time.zone.now's microseconds (different levels of precision)
      assert_equal Time.zone.now.change(sec: 0), section.created_at.change(sec: 0)
      assert_equal expected, section.selected_section_summarize.except!(:createdAt)
    end
  end

  test 'selected_section_summarize: section with students' do
    section = create :section, script: nil, unit_group: nil
    student1 = create(:follower, section: section).student_user
    student2 = create(:follower, section: section).student_user

    summarized_section = section.selected_section_summarize
    assert_includes summarized_section[:students], student1.summarize
    assert_includes summarized_section[:students], student2.summarize
  end

  test 'selected_section_summarize: section with duplicate students' do
    section = create :section, script: nil, unit_group: nil
    student = create :student
    create(:follower, section: section, student_user: student)
    create(:follower, section: section, student_user: student)
    assert_equal 2, Follower.where(section: section, student_user: student).count

    summarized_section = section.selected_section_summarize
    assert_includes summarized_section[:students], student.summarize
    assert summarized_section[:students].count, 1
  end

  test 'selected_section_summarize: section with sharing disabled and script with project sharing' do
    script = create :script, project_sharing: true
    section = create :section, sharing_disabled: true, script: script, unit_group: nil
    summarized_section = section.selected_section_summarize

    assert summarized_section[:script][:project_sharing]
  end

  test 'summarize: section with a course assigned' do
    unit_group = create :unit_group, name: 'somecourse', version_year: '1991', family_name: 'some-family'
    CourseOffering.add_course_offering(unit_group)

    Timecop.freeze(Time.zone.now) do
      section = create :section, script: nil, unit_group: unit_group

      expected = {
        id: section.id,
        name: section.name,
        teacherName: section.teacher.name,
        linkToProgress: "//test-studio.code.org/teacher_dashboard/sections/#{section.id}/progress",
        assignedTitle: 'somecourse',
        linkToAssigned: '/courses/somecourse',
        currentUnitTitle: '',
        linkToCurrentUnit: '',
        courseVersionName: 'somecourse',
        numberOfStudents: 0,
        linkToStudents: "//test-studio.code.org/teacher_dashboard/sections/#{section.id}/manage_students",
        code: section.code,
        lesson_extras: false,
        pairing_allowed: true,
        tts_autoplay_enabled: false,
        sharing_disabled: false,
        login_type: "email",
        login_type_name: "Email",
        participant_type: 'student',
        course_display_name: unit_group.course_version.localized_title,
        course_offering_id: unit_group.course_version.course_offering.id,
        course_version_id: unit_group.course_version.id,
        unit_id: nil,
        course_id: unit_group.id,
        script: {id: nil, name: nil, project_sharing: nil},
        studentCount: 0,
        grades: nil,
        providerManaged: false,
        hidden: false,
        students: [],
        restrict_section: false,
        is_assigned_csa: false,
        post_milestone_disabled: false,
        code_review_expires_at: nil,
        sectionInstructors: [{id: section.section_instructors[0].id, status: "active", instructor_name: section.teacher.name, instructor_email: section.teacher.email}],
        sync_enabled: nil,
        ai_tutor_enabled: false,
      }
      # Compare created_at separately because the object's created_at microseconds
      # don't match Time.zone.now's microseconds (different levels of precision)
      assert_equal Time.zone.now.change(sec: 0), section.created_at.change(sec: 0)
      assert_equal expected, section.summarize.except!(:createdAt)
    end
  end

  test 'summarize: section with a script assigned' do
    # Use an existing script so that it has a translation
    script = Unit.find_by_name('jigsaw')
    CourseOffering.add_course_offering(script)

    Timecop.freeze(Time.zone.now) do
      section = create :section, script: script, unit_group: nil

      expected = {
        id: section.id,
        name: section.name,
        teacherName: section.teacher.name,
        linkToProgress: "//test-studio.code.org/teacher_dashboard/sections/#{section.id}/progress",
        assignedTitle: 'Jigsaw',
        linkToAssigned: '/s/jigsaw',
        currentUnitTitle: '',
        linkToCurrentUnit: '',
        courseVersionName: 'jigsaw',
        numberOfStudents: 0,
        linkToStudents: "//test-studio.code.org/teacher_dashboard/sections/#{section.id}/manage_students",
        code: section.code,
        lesson_extras: false,
        pairing_allowed: true,
        tts_autoplay_enabled: false,
        sharing_disabled: false,
        login_type: "email",
        login_type_name: "Email",
        participant_type: 'student',
        course_display_name: script.course_version.localized_title,
        course_offering_id: script.course_version.course_offering.id,
        course_version_id: script.course_version.id,
        unit_id: nil,
        course_id: nil,
        script: {id: script.id, name: script.name, project_sharing: nil},
        studentCount: 0,
        grades: nil,
        providerManaged: false,
        hidden: false,
        students: [],
        restrict_section: false,
        is_assigned_csa: false,
        post_milestone_disabled: false,
        code_review_expires_at: nil,
        sectionInstructors: [{id: section.section_instructors[0].id, status: "active", instructor_name: section.teacher.name, instructor_email: section.teacher.email}],
        sync_enabled: nil,
        ai_tutor_enabled: false,
      }
      # Compare created_at separately because the object's created_at microseconds
      # don't match Time.zone.now's microseconds (different levels of precision)
      assert_equal Time.zone.now.change(sec: 0), section.created_at.change(sec: 0)
      assert_equal expected, section.summarize.except!(:createdAt)
    end
  end

  test 'summarize: section with a coteacher' do
    # Use an existing script so that it has a translation
    script = Unit.find_by_name('jigsaw')
    CourseOffering.add_course_offering(script)

    Timecop.freeze(Time.zone.now) do
      section = create :section
      coteacher_user = create :teacher
      primary_section_instructor_id = section.section_instructors[0].id
      coteacher_section_instructor = section.invite_instructor(coteacher_user.email, current_user)
      section.reload

      expected = {
        id: section.id,
        name: section.name,
        teacherName: section.teacher.name,
        linkToProgress: "//test-studio.code.org/teacher_dashboard/sections/#{section.id}/progress",
        assignedTitle: '',
        linkToAssigned: '//test-studio.code.org/teacher_dashboard/sections/',
        currentUnitTitle: '',
        linkToCurrentUnit: '',
        courseVersionName: nil,
        numberOfStudents: 0,
        linkToStudents: "//test-studio.code.org/teacher_dashboard/sections/#{section.id}/manage_students",
        code: section.code,
        lesson_extras: false,
        pairing_allowed: true,
        tts_autoplay_enabled: false,
        sharing_disabled: false,
        login_type: "email",
        login_type_name: "Email",
        participant_type: 'student',
        course_display_name: nil,
        course_offering_id: nil,
        course_version_id: nil,
        unit_id: nil,
        course_id: nil,
        script: {id: nil, name: nil, project_sharing: nil},
        studentCount: 0,
        grades: nil,
        providerManaged: false,
        hidden: false,
        students: [],
        restrict_section: false,
        is_assigned_csa: false,
        post_milestone_disabled: false,
        code_review_expires_at: nil,
        sectionInstructors: [{id: primary_section_instructor_id, status: "active", instructor_name: section.teacher.name, instructor_email: section.teacher.email},
                             {id: coteacher_section_instructor.id, status: "invited", instructor_name: nil, instructor_email: coteacher_user.email}],
        sync_enabled: nil,
        ai_tutor_enabled: false,
      }
      # Compare created_at separately because the object's created_at microseconds
      # don't match Time.zone.now's microseconds (different levels of precision)
      assert_equal Time.zone.now.change(sec: 0), section.created_at.change(sec: 0)
      assert_equal expected, section.summarize.except!(:createdAt)
    end
  end

  test 'summarize: section with both a course and a script' do
    # Use an existing script so that it has a translation
    script = Unit.find_by_name('jigsaw')
    unit_group = create :unit_group, name: 'somecourse', version_year: '1991', family_name: 'some-family'
    CourseOffering.add_course_offering(unit_group)

    Timecop.freeze(Time.zone.now) do
      # If this were a real section, it would actually have a script that is part of
      # the provided course
      section = create :section, script: script, unit_group: unit_group

      expected = {
        id: section.id,
        name: section.name,
        teacherName: section.teacher.name,
        linkToProgress: "//test-studio.code.org/teacher_dashboard/sections/#{section.id}/progress",
        assignedTitle: 'somecourse',
        linkToAssigned: '/courses/somecourse',
        currentUnitTitle: 'Jigsaw',
        linkToCurrentUnit: '/s/jigsaw',
        courseVersionName: 'somecourse',
        numberOfStudents: 0,
        linkToStudents: "//test-studio.code.org/teacher_dashboard/sections/#{section.id}/manage_students",
        code: section.code,
        lesson_extras: false,
        pairing_allowed: true,
        tts_autoplay_enabled: false,
        sharing_disabled: false,
        login_type: "email",
        login_type_name: "Email",
        participant_type: 'student',
        course_display_name: unit_group.course_version.localized_title,
        course_offering_id: unit_group.course_version.course_offering.id,
        course_version_id: unit_group.course_version.id,
        unit_id: script.id,
        course_id: unit_group.id,
        script: {id: script.id, name: script.name, project_sharing: nil},
        studentCount: 0,
        grades: nil,
        providerManaged: false,
        hidden: false,
        students: [],
        restrict_section: false,
        is_assigned_csa: false,
        post_milestone_disabled: false,
        code_review_expires_at: nil,
        sectionInstructors: [{id: section.section_instructors[0].id, status: "active", instructor_name: section.teacher.name, instructor_email: section.teacher.email}],
        sync_enabled: nil,
        ai_tutor_enabled: false,
      }
      # Compare created_at separately because the object's created_at microseconds
      # don't match Time.zone.now's microseconds (different levels of precision)
      assert_equal Time.zone.now.change(sec: 0), section.created_at.change(sec: 0)
      assert_equal expected, section.summarize.except!(:createdAt)
    end
  end

  test 'summarize: section with neither course or script assigned' do
    Timecop.freeze(Time.zone.now) do
      section = create :section, script: nil, unit_group: nil

      expected = {
        id: section.id,
        name: section.name,
        teacherName: section.teacher.name,
        linkToProgress: "//test-studio.code.org/teacher_dashboard/sections/#{section.id}/progress",
        assignedTitle: '',
        linkToAssigned: '//test-studio.code.org/teacher_dashboard/sections/',
        currentUnitTitle: '',
        linkToCurrentUnit: '',
        courseVersionName: nil,
        numberOfStudents: 0,
        linkToStudents: "//test-studio.code.org/teacher_dashboard/sections/#{section.id}/manage_students",
        code: section.code,
        lesson_extras: false,
        pairing_allowed: true,
        tts_autoplay_enabled: false,
        sharing_disabled: false,
        login_type: "email",
        login_type_name: "Email",
        participant_type: 'student',
        course_display_name: nil,
        course_offering_id: nil,
        course_version_id: nil,
        unit_id: nil,
        course_id: nil,
        script: {id: nil, name: nil, project_sharing: nil},
        studentCount: 0,
        grades: nil,
        providerManaged: false,
        hidden: false,
        students: [],
        restrict_section: false,
        is_assigned_csa: false,
        post_milestone_disabled: false,
        code_review_expires_at: nil,
        sectionInstructors: [{id: section.section_instructors[0].id, status: "active", instructor_name: section.teacher.name, instructor_email: section.teacher.email}],
        sync_enabled: nil,
        ai_tutor_enabled: false,
      }
      # Compare created_at separately because the object's created_at microseconds
      # don't match Time.zone.now's microseconds (different levels of precision)
      assert_equal Time.zone.now.change(sec: 0), section.created_at.change(sec: 0)
      assert_equal expected, section.summarize.except!(:createdAt)
    end
  end

  test 'summarize: section with students' do
    section = create :section, script: nil, unit_group: nil
    student1 = create(:follower, section: section).student_user
    student2 = create(:follower, section: section).student_user

    summarized_section = section.summarize
    assert_equal 2, summarized_section[:numberOfStudents]
    assert_equal 2, summarized_section[:studentCount]
    assert_includes summarized_section[:students], student1.summarize
    assert_includes summarized_section[:students], student2.summarize
  end

  test 'summarize: section with duplicate students' do
    section = create :section, script: nil, unit_group: nil
    student = create :student
    create(:follower, section: section, student_user: student)
    create(:follower, section: section, student_user: student)
    assert_equal 2, Follower.where(section: section, student_user: student).count

    summarized_section = section.summarize
    assert_equal 1, summarized_section[:numberOfStudents]
    assert_equal 1, summarized_section[:studentCount]
    assert_includes summarized_section[:students], student.summarize
  end

  test 'summarize: section with sharing disabled and script with project sharing' do
    script = create :script, project_sharing: true
    section = create :section, sharing_disabled: true, script: script, unit_group: nil
    summarized_section = section.summarize

    assert summarized_section[:script][:project_sharing]
    assert summarized_section[:sharing_disabled]
  end

  test 'can_join_section_as_participant? returns correct response based on permissions' do
    student_section = create :section
    teacher_section = create :section, :teacher_participants
    facilitator_section = create :section, :facilitator_participants

    levelbuilder = create :levelbuilder
    universal_instructor = create :universal_instructor
    plc_reviewer = create :plc_reviewer
    facilitator = create :facilitator
    teacher = create :teacher
    student = create :student

    assert student_section.can_join_section_as_participant?(levelbuilder)
    assert student_section.can_join_section_as_participant?(universal_instructor)
    assert student_section.can_join_section_as_participant?(plc_reviewer)
    assert student_section.can_join_section_as_participant?(facilitator)
    assert student_section.can_join_section_as_participant?(teacher)
    assert student_section.can_join_section_as_participant?(student)

    assert teacher_section.can_join_section_as_participant?(levelbuilder)
    assert teacher_section.can_join_section_as_participant?(universal_instructor)
    assert teacher_section.can_join_section_as_participant?(plc_reviewer)
    assert teacher_section.can_join_section_as_participant?(facilitator)
    assert teacher_section.can_join_section_as_participant?(teacher)
    refute teacher_section.can_join_section_as_participant?(student)

    assert facilitator_section.can_join_section_as_participant?(levelbuilder)
    assert facilitator_section.can_join_section_as_participant?(universal_instructor)
    refute facilitator_section.can_join_section_as_participant?(plc_reviewer)
    assert facilitator_section.can_join_section_as_participant?(facilitator)
    refute facilitator_section.can_join_section_as_participant?(teacher)
    refute facilitator_section.can_join_section_as_participant?(student)
  end

  test 'valid_grades? accepts K-12 and Other' do
    assert Section.valid_grades?(["K"])
    assert Section.valid_grades?(["1"])
    assert Section.valid_grades?(["6"])
    assert Section.valid_grades?(["12"])
    assert Section.valid_grades?(["Other"])
    assert Section.valid_grades?(["K", "1", "10", "Other"])
  end

  test 'valid_grades? does not accept invalid numbers and strings' do
    refute Section.valid_grades?(["Something else"])
    refute Section.valid_grades?(["56"])
    refute Section.valid_grades?(["K", "1", "56", "Other"])
    refute Section.valid_grades?([""])
  end

  test 'code review disabled for sections with no code review expiration' do
    section = create :section
    refute section.code_review_enabled?
  end

  test 'code review enabled for sections with code review expiration later than current time' do
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    assert section.code_review_enabled?
  end

  test 'code review disabled for sections with code review expiration before current time' do
    section = create :section, code_review_expires_at: Time.now.utc - 1.day
    refute section.code_review_enabled?
  end

  test 'any_student_has_progress? returns false if no student progress' do
    section = create :section, script: nil, unit_group: nil

    create(:follower, section: section).student_user

    refute section.any_student_has_progress?
  end

  test 'any_student_has_progress? returns true if student has progress on unit assigned to section' do
    script = Unit.find_by_name('jigsaw')
    unit_group = create :unit_group, name: 'somecourse', version_year: '1991', family_name: 'some-family'
    CourseOffering.add_course_offering(unit_group)

    section = create :section, script: script, unit_group: unit_group

    student = create(:follower, section: section).student_user
    UserScript.create!(user: student, script: script)

    assert section.any_student_has_progress?
  end

  test 'any_student_has_progress? returns true if student has progress on unit not assigned to section' do
    script = Unit.find_by_name('jigsaw')
    unit_group = create :unit_group, name: 'somecourse', version_year: '1991', family_name: 'some-family'
    CourseOffering.add_course_offering(unit_group)

    section = create :section, script: nil, unit_group: nil

    student = create(:follower, section: section).student_user
    UserScript.create!(user: student, script: script)

    assert section.any_student_has_progress?
  end

  test 'reset_code_review_groups creates new code review groups' do
    code_review_group_section = create(:section, user: @teacher, login_type: 'word')
    # Create 5 students
    followers = []
    5.times do |i|
      student = create(:student, name: "student_#{i}")
      followers << create(:follower, section: code_review_group_section, student_user: student)
    end
    group_1_name = 'new_group_1'
    group_2_name = 'new_group_2'
    new_groups = [
      {name: group_1_name, members: [{follower_id: followers[0].id}]},
      {name: group_2_name, members: [{follower_id: followers[2].id}, {follower_id: followers[3].id}]}
    ]
    code_review_group_section.reset_code_review_groups(new_groups)
    code_review_group_section.reload

    groups = code_review_group_section.code_review_groups
    assert_equal 2, groups.count
    assert_equal 1, groups.first.members.count
  end

  test 'reset_code_review_groups replaces existing code review groups' do
    set_up_code_review_groups

    new_group_name = 'new_group'
    new_groups = [
      {name: new_group_name, members: [{follower_id: @followers[0].id}, {follower_id: @followers[1].id}]},
    ]

    @code_review_group_section.reset_code_review_groups(new_groups)
    @code_review_group_section.reload
    # old group should be deleted
    refute CodeReviewGroup.exists?(@group1.id)
    new_groups = @code_review_group_section.code_review_groups
    assert_equal 1, new_groups.count
    assert_equal 2, new_groups.first.members.count
  end

  test 'update_code_review_expiration resets expiration time when enabling code review' do
    @section.update_code_review_expiration(true)
    @section.save
    refute_nil @section.code_review_expires_at
    # check the expiration date was set to a time greater than now.
    assert DateTime.parse(@section.code_review_expires_at) > DateTime.now
  end

  test 'update_code_review_expiration sets expiration time to nil when disabling code review' do
    # set expiration to a non-nil time
    @section.code_review_expires_at = DateTime.now
    @section.save

    @section.update_code_review_expiration(false)
    @section.save
    assert_nil @section.code_review_expires_at
  end

  test 'section create adds section instructor' do
    assert_difference 'SectionInstructor.count' do
      section = create(:section)
      instructor = section.instructors.first
      assert_equal instructor, section.user
    end
  end

  test 'section update fixes section instructor' do
    section = create(:section)
    si = section.section_instructors.first
    si.status = :declined
    si.save!

    assert_empty section.instructors

    section.name = 'newly renamed!'
    section.save!

    assert_equal 1, section.instructors.length
  end

  test 'section update fixes soft-deleted section instructor' do
    section = create(:section)
    si = section.section_instructors.first
    si.destroy!

    assert_empty section.instructors

    section.name = 'newly renamed again!'
    section.save!

    assert_equal 1, section.instructors.length
  end

  test 'add_instructor returns true and adds the teacher if not previously a co-teacher' do
    section = create(:section)
    user = create :teacher

    assert section.add_instructor(user)
    assert_equal user, section.section_instructors.last.instructor
  end

  test 'add_instructor returns true and restores the teacher if previously deleted co-teacher' do
    section = create(:section)
    user = create :teacher

    # Add instructor, then delete the instructor
    section.add_instructor(user)
    section.section_instructors.last.destroy

    # Re-add the deleted instructor
    result = section.add_instructor(user)

    assert_equal true, result
    assert_equal user, section.section_instructors.last.instructor
  end

  test 'add_instructor returns true and activates the teacher if the teacher was previously invited' do
    section = create(:section)
    inviter = create :teacher
    user = create :teacher

    section.invite_instructor(user.email, inviter)
    result = section.add_instructor(user)
    si = section.section_instructors.last

    assert_equal true, result
    assert_equal user, si.instructor
    assert_equal "active", si.status
  end

  test 'remove_instructor destroys the applicable SectionInstructor' do
    section = create(:section)
    user = create :teacher

    section.add_instructor(user)
    si = section.section_instructors.last
    section.remove_instructor(user)
    si.reload

    assert_equal true, si.deleted?
  end

  test 'remove_instructor does not remove the primary teacher' do
    user = create :teacher
    section = create(:section, user: user)

    si = SectionInstructor.find_by(instructor: user, section_id: section.id)
    section.remove_instructor(user)
    si.reload

    refute si.deleted?
  end

  def set_up_code_review_groups
    # create a new section to avoid extra unassigned students
    @code_review_group_section = create(:section, user: @teacher, login_type: 'word')
    # Create 5 students
    @followers = []
    5.times do |i|
      student = create(:student, name: "student_#{i}")
      @followers << create(:follower, section: @code_review_group_section, student_user: student)
    end

    # Create 2 code review groups
    @group1 = create :code_review_group, section: @code_review_group_section
    @group2 = create :code_review_group, section: @code_review_group_section
    # put student 0 and 1 in group 1, and student 2 in group 2
    CodeReviewGroupMember.create(follower_id: @followers[0].id, code_review_group_id: @group1.id)
    CodeReviewGroupMember.create(follower_id: @followers[1].id, code_review_group_id: @group1.id)
    CodeReviewGroupMember.create(follower_id: @followers[2].id, code_review_group_id: @group2.id)
  end
end
