require 'test_helper'

class TeacherFeedbackTest < ActiveSupport::TestCase
  test 'feedback per teacher - no feedback' do
    create :teacher
    #no feedback

    retrieved = TeacherFeedback.latest_per_teacher
    assert_equal([], retrieved)
  end

  test 'feedback per teacher - single teacher' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)

    create :teacher_feedback, teacher: teacher, student: student
    latest_feedback = create :teacher_feedback, teacher: teacher, student: student

    retrieved = TeacherFeedback.latest_per_teacher
    assert_equal([latest_feedback], retrieved)
  end

  test 'feedback per teacher - multiple teachers' do
    teachers = create_list :teacher, 2
    student = create :student
    section1 = create :section, user: teachers[0]
    section1.add_student(student)

    section2 = create :section, user: teachers[1]
    section2.add_student(student)

    feedbacks = teachers.map do |teacher|
      create :teacher_feedback, teacher: teacher, student: student
      create :teacher_feedback, teacher: teacher, student: student
    end

    retrieved = TeacherFeedback.latest_per_teacher
    assert_equal(feedbacks, retrieved)
  end

  test 'feedback per teacher - multiple teachers, unenrolled from one' do
    teachers = create_list :teacher, 2
    student = create :student
    section1 = create :section, user: teachers[0]
    section1.add_student(student)

    section2 = create :section, user: teachers[1]
    section2.add_student(student)

    feedbacks = teachers.map do |teacher|
      create :teacher_feedback, teacher: teacher, student: student
      create :teacher_feedback, teacher: teacher, student: student
    end

    #Remove student from section associated with first teacher/feedback
    follower = Follower.where(section: section1.id, student_user_id: student.id).first
    section1.remove_student(student, follower, {})

    #Assert that only feedback from second teacher is retrieved
    retrieved = TeacherFeedback.latest_per_teacher
    assert_equal([feedbacks[1]], retrieved)
  end

  test 'feedback per teacher - single teacher, with filter' do
    teacher = create :teacher
    students = create_list :student, 2
    section = create :section, user: teacher
    section.add_student(students[0])
    section.add_student(students[1])

    feedbacks = students.map do |student|
      create :teacher_feedback, teacher: teacher, student: student
    end

    assert_equal([feedbacks[0]], TeacherFeedback.where(student: students[0]).latest_per_teacher)
    assert_equal([feedbacks[1]], TeacherFeedback.where(student: students[1]).latest_per_teacher)
  end

  test 'latest feedback - no feedback' do
    create :teacher
    #no feedback

    retrieved = TeacherFeedback.latest
    assert_nil(retrieved)
  end

  test 'latest feedback - one comment' do
    teacher = create :teacher
    feedback = create :teacher_feedback, teacher: teacher

    retrieved = TeacherFeedback.latest
    assert_equal(feedback, retrieved)
  end

  test 'latest feedback - two comments' do
    teacher = create :teacher
    create :teacher_feedback, teacher: teacher
    latest_feedback = create :teacher_feedback, teacher: teacher

    retrieved = TeacherFeedback.latest
    assert_equal(latest_feedback, retrieved)
  end

  test 'latest feedback - with filter' do
    teacher = create :teacher
    students = create_list :student, 2

    feedbacks = students.map do |student|
      create :teacher_feedback, teacher: teacher, student: student
      create :teacher_feedback, teacher: teacher, student: student
    end

    assert_equal(feedbacks[0], TeacherFeedback.where(student: students[0]).latest)
    assert_equal(feedbacks[1], TeacherFeedback.where(student: students[1]).latest)
  end

  test 'user_level returns nil if there was no attempt by student' do
    teacher = create :teacher
    student = create :student
    level = create :level
    script = create :script
    create :script_level, script: script, levels: [level]

    feedback = create :teacher_feedback, teacher: teacher, student: student, level: level, script: script
    assert_nil(feedback.user_level)
  end

  test 'user_level returns user_level if there was an attempt on the level' do
    teacher = create :teacher
    student = create :student
    level = create :level
    script = create :script
    create :script_level, script: script, levels: [level]

    feedback = create :teacher_feedback, teacher: teacher, student: student, level: level, script: script
    user_level = create :user_level, user: student, level: level, script: script

    assert_equal(feedback.user_level, user_level)
  end

  test 'student_updated_since_feedback? returns false if there was no attempt by student' do
    teacher = create :teacher
    student = create :student
    level = create :level
    script = create :script
    create :script_level, script: script, levels: [level]

    feedback = create :teacher_feedback, teacher: teacher, student: student, level: level, script: script

    assert_equal(feedback.student_updated_since_feedback?, false)
  end

  test 'student_updated_since_feedback? returns false if the attempt by the student happened before the feedback was given' do
    teacher = create :teacher
    student = create :student
    level = create :level
    script = create :script
    create :script_level, script: script, levels: [level]

    create :user_level, user: student, level: level, script: script, updated_at: 1.week.ago
    feedback = create :teacher_feedback, teacher: teacher, student: student, level: level, script: script

    assert_equal(feedback.student_updated_since_feedback?, false)
  end

  test 'student_updated_since_feedback? returns true if the attempt by the student happened after the feedback was given' do
    teacher = create :teacher
    student = create :student
    level = create :level
    script = create :script
    create :script_level, script: script, levels: [level]

    feedback = create :teacher_feedback, teacher: teacher, student: student, level: level, script: script
    create :user_level, user: student, level: level, script: script, updated_at: 1.week.from_now

    assert_equal(feedback.student_updated_since_feedback?, true)
  end

  test 'destroys when teacher is destroyed' do
    teacher = create :teacher
    first_feedback = create :teacher_feedback, teacher: teacher
    second_feedback = create :teacher_feedback, teacher: teacher
    teacher.destroy

    #Assert that feedback was soft-deleted
    assert first_feedback.reload.deleted?
    assert second_feedback.reload.deleted?

    #Assert that feedback can be un-deleted
    teacher.undestroy
    assert TeacherFeedback.exists?(first_feedback.id)
    assert TeacherFeedback.exists?(second_feedback.id)
  end

  test 'does not destroy when student is destroyed' do
    teacher = create :teacher
    student = create :student
    first_feedback = create :teacher_feedback, teacher: teacher, student: student
    second_feedback = create :teacher_feedback, teacher: teacher, student: student
    student.destroy
    assert TeacherFeedback.exists?(first_feedback.id)
    assert TeacherFeedback.exists?(second_feedback.id)
  end

  test 'returns empty array when student removed from teacher section' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)

    create :teacher_feedback, teacher: teacher, student: student

    follower = Follower.where(section: section.id, student_user_id: student.id).first
    section.remove_student(student, follower, {})

    assert_equal([], TeacherFeedback.where(student: student).latest_per_teacher)
  end

  test 'increment_visit_count increments visit count and updates timestamps' do
    feedback = create :teacher_feedback
    datetime1 = DateTime.new(2000, 1, 1)
    datetime2 = DateTime.new(2002, 1, 1)

    Timecop.freeze(datetime1) do
      feedback.increment_visit_count
      feedback.reload

      assert_equal 1, feedback.student_visit_count
      assert_equal datetime1, feedback.student_first_visited_at
      assert_equal datetime1, feedback.student_last_visited_at
    end

    Timecop.freeze(datetime2) do
      feedback.increment_visit_count
      feedback.reload

      assert_equal 2, feedback.student_visit_count
      assert_equal datetime1, feedback.student_first_visited_at
      assert_equal datetime2, feedback.student_last_visited_at
    end
  end

  test 'get_script_level finds level in script' do
    script_level = create :script_level
    script = script_level.script
    level = script_level.levels.first
    feedback = create :teacher_feedback, script: script, level: level
    assert_queries(1) do
      assert_equal script_level, feedback.get_script_level
    end
  end

  test 'get_script_level finds bubble choice parent level' do
    parent_level = create :bubble_choice_level, :with_sublevels
    child_level = parent_level.sublevels.first

    # Create these intermediate rungs of the hierarchy, so that script_level
    # will show up in script.script_levels.
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, lesson_group: lesson_group, script: script

    # the query count grows with the number of bubble choice levels in the script.
    create :script_level, script: script, lesson: lesson, levels: [create(:bubble_choice_level, :with_sublevels)]
    create :script_level, script: script, lesson: lesson, levels: [create(:bubble_choice_level, :with_sublevels)]
    create :script_level, script: script, lesson: lesson, levels: [create(:bubble_choice_level, :with_sublevels)]

    script_level = create :script_level, script: script, lesson: lesson, levels: [parent_level]

    feedback = create :teacher_feedback, script: script, level: child_level
    assert_queries(7) do
      assert_equal script_level, feedback.get_script_level
    end
  end
end
