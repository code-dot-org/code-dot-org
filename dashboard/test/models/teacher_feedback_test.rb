require 'test_helper'

class TeacherFeedbackTest < ActiveSupport::TestCase
  test 'feedback per teacher - single teacher' do
    teacher = create :teacher
    create :teacher_feedback, teacher: teacher
    latest_feedback = create :teacher_feedback, teacher: teacher

    retrieved = TeacherFeedback.latest_per_teacher
    assert_equal([latest_feedback], retrieved)
  end

  test 'feedback per teacher - multiple teachers' do
    teachers = create_list :teacher, 2
    feedbacks = teachers.map do |teacher|
      create :teacher_feedback, teacher: teacher
      create :teacher_feedback, teacher: teacher
    end

    retrieved = TeacherFeedback.latest_per_teacher
    assert_equal(feedbacks, retrieved)
  end

  test 'feedback per teacher - single teacher, with filter' do
    teacher = create :teacher
    students = create_list :student, 2

    feedbacks = students.map do |student|
      create :teacher_feedback, teacher: teacher, student: student
    end

    assert_equal([feedbacks[0]], TeacherFeedback.where(student: students[0]).latest_per_teacher)
    assert_equal([feedbacks[1]], TeacherFeedback.where(student: students[1]).latest_per_teacher)
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
end
