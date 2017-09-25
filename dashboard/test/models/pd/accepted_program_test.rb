require 'test_helper'

class Pd::AcceptedProgramTest < ActiveSupport::TestCase
  test 'required fields' do
    accepted_program = Pd::AcceptedProgram.new
    refute accepted_program.valid?
    expected_errors = [
      'Workshop name is required',
      'Course is required',
      'User is required'
    ]
    assert_equal expected_errors, accepted_program.errors.full_messages

    accepted_program.update(
      workshop_name: 'a workshop',
      course: 'csd',
      user: create(:teacher)
    )
    assert accepted_program.valid?
  end

  test 'valid courses' do
    assert build(:pd_accepted_program, course: 'csd').valid?
    assert build(:pd_accepted_program, course: 'csp').valid?

    invalid = build(:pd_accepted_program, course: 'invalid')
    refute invalid.valid?
    assert_equal ['Course is not included in the list'], invalid.errors.full_messages
  end

  test 'one per user and course' do
    # noise: one of each course for other users to make sure this doesn't interfere
    create :pd_accepted_program, course: 'csd'
    create :pd_accepted_program, course: 'csp'

    teacher = create :teacher
    create :pd_accepted_program, user: teacher, course: 'csd'
    create :pd_accepted_program, user: teacher, course: 'csp'

    dupe = build :pd_accepted_program, user: teacher, course: 'csp'
    refute dupe.valid?
    assert_equal ['User already has an entry for this course'], dupe.errors.full_messages
  end

  test 'teachercon?' do
    Pd::TeacherConWorkshops.expects(:teachercon?).with('teachercon workshop').returns(true)
    Pd::TeacherConWorkshops.expects(:teachercon?).with('non-teachercon workshop').returns(false)

    teachercon = create :pd_accepted_program, workshop_name: 'teachercon workshop'
    non_teachercon = create :pd_accepted_program, workshop_name: 'non-teachercon workshop'

    assert teachercon.teachercon?
    refute non_teachercon.teachercon?
  end
end
