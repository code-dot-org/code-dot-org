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

    level = create :level

    create :teacher_feedback, teacher: teacher, student: student, level: level
    latest_feedback = create :teacher_feedback, teacher: teacher, student: student, level: level

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

    level = create :level

    feedbacks = teachers.map do |teacher|
      # older feedback
      old_feedback = create :teacher_feedback, teacher: teacher, student: student, level: level
      old_feedback.created_at = old_feedback.created_at - 1
      old_feedback.save validate: false

      create :teacher_feedback, teacher: teacher, student: student, level: level
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

    level = create :level

    feedbacks = teachers.map do |teacher|
      create :teacher_feedback, teacher: teacher, student: student, level: level
      create :teacher_feedback, teacher: teacher, student: student, level: level
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

    level = create :level

    feedbacks = students.map do |student|
      create :teacher_feedback, teacher: teacher, student: student, level: level
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

  test 'awaiting_teacher_review? returns false if isLatest is false' do
    teacher = create :teacher
    student = create :student
    level = create :level
    script = create :script
    create :script_level, script: script, levels: [level]

    feedback = create :teacher_feedback, teacher: teacher, student: student, level: level, script: script, review_state: TeacherFeedback::REVIEW_STATES.keepWorking

    assert_equal(feedback.awaiting_teacher_review?(false), false)
  end

  test 'awaiting_teacher_review? returns false if is latest feedback and keepWorking review_state and there was no attempt by student' do
    teacher = create :teacher
    student = create :student
    level = create :level
    script = create :script
    create :script_level, script: script, levels: [level]

    feedback = create :teacher_feedback, teacher: teacher, student: student, level: level, script: script, review_state: TeacherFeedback::REVIEW_STATES.keepWorking

    assert_equal(feedback.awaiting_teacher_review?(true), false)
  end

  test 'awaiting_teacher_review? returns false if is latest feedback and keepWorking review_state and the attempt by the student happened before the feedback was given' do
    teacher = create :teacher
    student = create :student
    level = create :level
    script = create :script
    create :script_level, script: script, levels: [level]

    create :user_level, user: student, level: level, script: script, updated_at: 1.week.ago
    feedback = create :teacher_feedback, teacher: teacher, student: student, level: level, script: script, review_state: TeacherFeedback::REVIEW_STATES.keepWorking

    assert_equal(feedback.awaiting_teacher_review?(true), false)
  end

  test 'awaiting_teacher_review? returns false if is latest feedback and not keepWorking review_state and the attempt by the student happened after the feedback was given' do
    teacher = create :teacher
    student = create :student
    level = create :level
    script = create :script
    create :script_level, script: script, levels: [level]

    feedback = create :teacher_feedback, teacher: teacher, student: student, level: level, script: script, review_state: TeacherFeedback::REVIEW_STATES.completed
    create :user_level, user: student, level: level, script: script, updated_at: 1.week.from_now

    assert_equal(feedback.awaiting_teacher_review?(true), false)
  end

  test 'awaiting_teacher_review? returns true if is latest feedback and keepWorking review_state and the attempt by the student happened after the feedback was given' do
    teacher = create :teacher
    student = create :student
    level = create :level
    script = create :script
    create :script_level, script: script, levels: [level]

    feedback = create :teacher_feedback, teacher: teacher, student: student, level: level, script: script, review_state: TeacherFeedback::REVIEW_STATES.keepWorking
    create :user_level, user: student, level: level, script: script, updated_at: 1.week.from_now

    assert_equal(feedback.awaiting_teacher_review?(true), true)
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
    assert_queries(3) do
      assert_equal script_level, feedback.get_script_level
    end
  end

  test 'get_latest_feedbacks_received returns latest feedback for student on level' do
    teacher = create :teacher
    students = create_list :student, 2
    section = create :section, user: teacher
    section.add_student(students[0])
    section.add_student(students[1])

    script_level = create :script_level
    script = script_level.script
    level = script_level.levels.first

    expected_feedback = create :teacher_feedback, teacher: teacher, student: students[0], script: script, level: level
    create :teacher_feedback, teacher: teacher, student: students[1], script: script, level: level

    # create additional feedbacks which should not be returned
    script_level2 = create :script_level
    script2 = script_level2.script
    level2 = script_level2.levels.first

    create :teacher_feedback, teacher: teacher, student: students[0], script: script2, level: level2
    create :teacher_feedback, teacher: teacher, student: students[1], script: script2, level: level2

    retrieved = TeacherFeedback.get_latest_feedbacks_received(students[0].id, level.id, script.id)
    assert_equal([expected_feedback], retrieved)
  end

  test 'get_latest_feedbacks_received returns latest feedback for student each level (when multiple are provided) sorted by most recent first' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)

    level1 = create :level
    level2 = create :level
    script_level = create :script_level, levels: [level1, level2]
    script = script_level.script

    # 2 feedbacks for level1 created first
    create :teacher_feedback, teacher: teacher, student: student, script: script, level: level1
    expected_feedback1 = create :teacher_feedback, teacher: teacher, student: student, script: script, level: level1
    expected_feedback1.created_at = expected_feedback1.created_at - 1
    expected_feedback1.save validate: false

    # then feedback for level 2 created
    create :teacher_feedback, teacher: teacher, student: student, script: script, level: level2
    expected_feedback2 = create :teacher_feedback, teacher: teacher, student: student, script: script, level: level2
    expected_feedback2.reload

    retrieved = TeacherFeedback.get_latest_feedbacks_received(student.id, [level1.id, level2.id], script.id)

    # we get most recent feedback for each level sorted by created date
    assert_equal([expected_feedback2, expected_feedback1], retrieved)
  end

  test 'summarize_for_csv returns expected values' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)

    level = create :level
    script_level = create :script_level, levels: [level]
    script = script_level.script

    teacher_feedback = create :teacher_feedback, teacher: teacher, student: student, script: script, level: level, performance: 'performanceLevel3', review_state: TeacherFeedback::REVIEW_STATES.keepWorking, comment: "Keep trying"

    summarized_feedback = teacher_feedback.summarize_for_csv(level, script_level, student)

    assert_equal "Limited Evidence", summarized_feedback[:performance]
    assert_equal "Needs more work", summarized_feedback[:reviewStateLabel]
    assert_equal script_level.lesson.localized_title, summarized_feedback[:lessonName]
    assert_equal "Keep trying", summarized_feedback[:comment]
  end

  test 'summarize_for_csv returns expected values for sublevel' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)

    parent_level = create :bubble_choice_level, :with_sublevels
    child_level = parent_level.sublevels.first
    script_level = create :script_level, levels: [parent_level]
    script = script_level.script

    teacher_feedback = create :teacher_feedback, teacher: teacher, student: student, script: script, level: child_level, comment: "Great work"

    summarized_feedback = teacher_feedback.summarize_for_csv(child_level, script_level, student, 0)

    assert_equal "Great work", summarized_feedback[:comment]
    assert_equal "1a", summarized_feedback[:levelNum]
    assert_equal "Never reviewed", summarized_feedback[:reviewStateLabel]
  end
end
