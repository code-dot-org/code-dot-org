require 'test_helper'

class SectionTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @student = create :student
    @teacher = create :teacher
    @section = create :section, teacher: @teacher

    @default_attrs = {user: @teacher, name: 'test-section'}
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

  test 'name is required' do
    assert_does_not_create(Section) do
      section = Section.new user: @teacher
      refute section.valid?
      assert_equal ['Name is required'], section.errors.full_messages
    end
  end

  test 'user is required' do
    assert_does_not_create(Section) do
      section = Section.new name: 'a section'
      refute section.valid?
      assert_equal ['User is required'], section.errors.full_messages
    end
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

  test "cannot destroy section with students" do
    follower = create :follower

    section = follower.section

    refute section.destroy
    assert Section.exists?(section.id)
  end

  test "can destroy section without students" do
    assert @section.destroy

    refute Section.exists?(@section.id)
  end

  test 'add_student adds student to section' do
    # even when the student is in another section from a different teacher
    create(:section).add_student @student, move_for_same_teacher: false

    assert_creates(Follower) do
      @section.add_student @student
    end
    assert @section.students.exists?(@student.id)
    assert_equal 2, Follower.where(student_user_id: @student.id).count
  end

  test 'add_student in another section from the same teacher moves student' do
    @section.add_student @student
    new_section = create :section, user: @teacher

    # Initially, student is in original_section
    assert @section.students.exists?(@student.id)
    refute new_section.students.exists?(@student.id)

    assert_does_not_create(Follower) do
      new_section.add_student @student
    end

    # Verify student has been moved to new_section
    refute @section.students.exists?(@student.id)
    assert new_section.students.exists?(@student.id)
  end

  test 'add_student is idempotent' do
    another_student = create :student

    2.times do
      @section.add_student @student, move_for_same_teacher: true
      @section.add_student another_student, move_for_same_teacher: false
    end

    assert_equal 2, @section.followers.count
    assert_equal [@student.id, another_student.id], @section.followers.all.map(&:student_user_id)
  end

  test 'add_student with move_for_same_teacher: false does not move student' do
    # This option is used for pd-workshop sections.
    # A workshop attendee, unlike students in a classroom section, can remain enrolled
    # in multiple sections owned by the same user (i.e. workshop organizer).
    organizer = create :teacher
    attendee = create :teacher
    original_section = create :section, user: organizer
    original_section.add_student attendee
    new_section = create :section, user: organizer

    # Initially, student is in original_section
    assert original_section.students.exists?(attendee.id)
    refute new_section.students.exists?(attendee.id)

    assert_creates(Follower) do
      new_section.add_student attendee, move_for_same_teacher: false
    end

    # Verify student is in both sections
    assert original_section.students.exists?(attendee.id)
    assert new_section.students.exists?(attendee.id)
  end

  test 'section_type validation' do
    section = create :section

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
        section.add_student(create(:student, name: name))
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
    section = create :section

    expected_url = "https://#{CDO.pegasus_hostname}/teacher-dashboard#/sections/#{section.id}/manage"
    assert_equal expected_url, section.teacher_dashboard_url
  end
end
