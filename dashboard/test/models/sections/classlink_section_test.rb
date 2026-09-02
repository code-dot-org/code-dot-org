require 'test_helper'

class ClasslinkSectionTest < ActiveSupport::TestCase
  # One Roster user records as the client returns them: reduced to the four
  # consumed fields, already filtered to role == "student", and with no
  # birthDate anywhere in the source data.
  let(:student_list) do
    [
      {'sourcedId' => '12345', 'givenName' => 'Ethan', 'familyName' => 'Doe', 'role' => 'student'},
      {'sourcedId' => '12346', 'givenName' => 'Lily', 'familyName' => 'Fake', 'role' => 'student'},
    ]
  end

  test 'from_service creates the section, code, and students' do
    owner = create(:teacher)

    section = ClasslinkSection.from_service('33333', 2222, owner.id, student_list, 'Sci5 (Sci5)')
    section.reload
    assert section.provider_managed?
    assert_equal 'CL-2222|33333', section.code
    assert_equal 'Sci5 (Sci5)', section.name
    assert_equal Section::LOGIN_TYPE_CLASSLINK, section.login_type
    assert_equal 2, section.students.size

    student = section.students.find_by(name: 'Ethan')
    assert_equal 'Doe', student.family_name
    assert_equal '2222|12345', student.authentication_options.first.authentication_id
    assert_equal AuthenticationOption::Classlink::VERSION[:v2], student.authentication_options.first.version

    assert_no_difference 'User.count' do
      # Re-import finds the existing section and updates its name.
      section_2 = ClasslinkSection.from_service('33333', 2222, owner.id, student_list, 'Sci5 renamed')
      assert_equal section.id, section_2.id
      assert_equal 'Sci5 renamed', section_2.name
    end
  end

  test 'a student with no dob is created with age nil and does not abort the import' do
    owner = create(:teacher)

    section = ClasslinkSection.from_service('33333', 2222, owner.id, student_list, 'Sci5')
    assert_equal 2, section.reload.students.size
    section.students.each do |student|
      assert_nil student.age
      assert student.persisted?
    end
  end

  test 'the age deferral fires because roster-created users carry provider classlink' do
    owner = create(:teacher)

    section = ClasslinkSection.from_service('33333', 2222, owner.id, [student_list.first], 'Sci5')
    student = section.reload.students.first
    # The defer_age proc matches on user.provider at create time; a failure
    # here means the validation raised and the student was never persisted.
    assert student.persisted?
    assert_nil student.age
  end

  test 'a student already holding the v2 auth option is linked, not duplicated' do
    owner = create(:teacher)
    existing = create(:student)
    create(
      :authentication_option,
      user: existing,
      credential_type: AuthenticationOption::CLASSLINK,
      authentication_id: '2222|12345',
      version: AuthenticationOption::Classlink::VERSION[:v2]
    )

    section = ClasslinkSection.from_service('33333', 2222, owner.id, [student_list.first], 'Sci5')
    assert_includes section.reload.students, existing
  end

  test 'integer and string tenant ids produce the same section code' do
    assert_equal ClasslinkSection.code_for(2222, '33333'), ClasslinkSection.code_for('2222', '33333')
  end

  test 'a classSourcedId containing a pipe round-trips through the code' do
    code = ClasslinkSection.code_for(2222, 'a|b')
    assert_equal 'CL-2222|a|b', code
    assert_equal ['2222', 'a|b'], ClasslinkSection.parse_code(code)

    section = build(:section, login_type: Section::LOGIN_TYPE_CLASSLINK)
    section.code = code
    assert_equal 'a|b', section.becomes(ClasslinkSection).class_sourced_id
  end

  test 'students can be added to a restricted ClassLink section' do
    owner = create(:teacher)
    section = ClasslinkSection.from_service('33333', 2222, owner.id, [student_list.first], 'Sci5')
    section.reload.update!(restrict_section: true)

    new_student_list = student_list
    synced = ClasslinkSection.from_service('33333', 2222, owner.id, new_student_list, 'Sci5')
    # Without LOGIN_TYPE_CLASSLINK in LOGIN_TYPES_OAUTH, add_student returns
    # ADD_STUDENT_RESTRICTED on a restricted section and the new student is
    # silently dropped.
    assert_equal 2, synced.reload.students.size
  end

  test 'sync removes a departed student and adds a new one' do
    owner = create(:teacher)
    section = ClasslinkSection.from_service('33333', 2222, owner.id, student_list, 'Sci5')
    assert_equal 2, section.reload.students.size

    replacement = [
      student_list.first,
      {'sourcedId' => '99999', 'givenName' => 'New', 'familyName' => 'Kid', 'role' => 'student'},
    ]
    synced = ClasslinkSection.from_service('33333', 2222, owner.id, replacement, 'Sci5')
    names = synced.reload.students.map(&:name).sort
    assert_equal %w(Ethan New), names
  end
end
