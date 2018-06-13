require 'test_helper'

class Api::V1::TeacherFeedbacksControllerTest < ActionDispatch::IntegrationTest
  API = '/api/v1/teacher_feedbacks'

  def teacher_sign_in_and_comment(teacher, student, level, comment)
    sign_in teacher
    params = {
      student_id: student.id,
      level_id:  level.id,
      comment: comment
    }

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params}
      assert_response :success
    end
  end

  test 'can be created' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)
    level = create :level

    teacher_sign_in_and_comment(teacher, student, level, 'Good job')

    teacher_feedback = TeacherFeedback.last
    assert_equal student.id, teacher_feedback.student_id
    assert_equal level.id, teacher_feedback.level_id
    assert_equal teacher.id, teacher_feedback.teacher_id
  end

  test 'can be retrieved by teacher' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)
    level = create :level
    comment = "Retrieved"

    teacher_sign_in_and_comment(teacher, student, level, comment)

    get "#{API}/show_feedback_from_teacher?student_id=#{student.id}&level_id=#{level.id}&teacher_id=#{teacher.id}"

    assert_equal comment, JSON.parse(@response.body)['comment']
  end

  test 'retrieves feedback for correct student' do
    teacher = create :teacher
    student1 = create :student
    student2 = create :student
    section = create :section, user: teacher
    section.add_student(student1)
    section.add_student(student2)
    level = create :level
    comment1 = "Student Alpha"
    comment2 = "Student Beta"

    teacher_sign_in_and_comment(teacher, student1, level, comment1)

    teacher_sign_in_and_comment(teacher, student2, level, comment2)

    get "#{API}/show_feedback_from_teacher?student_id=#{student1.id}&level_id=#{level.id}&teacher_id=#{teacher.id}"

    assert_response :success
    assert_equal student1.id, JSON.parse(@response.body)['student_id']
    assert_equal comment1, JSON.parse(@response.body)['comment']
  end

  test 'retrieves feedback from correct teacher' do
    teacher1 = create :teacher
    teacher2 = create :teacher
    student = create :student
    section1 = create :section, user: teacher1
    section2 = create :section, user: teacher2
    section1.add_student(student)
    section2.add_student(student)
    level = create :level
    comment1 = "Student Alpha"
    comment2 = "Student Beta"

    teacher_sign_in_and_comment(teacher1, student, level, comment1)
    sign_out teacher1

    teacher_sign_in_and_comment(teacher2, student, level, comment2)
    sign_out teacher2

    sign_in teacher1

    get "#{API}/show_feedback_from_teacher?student_id=#{student.id}&level_id=#{level.id}&teacher_id=#{teacher1.id}"
    assert_equal comment1, JSON.parse(@response.body)['comment']

    get "#{API}/show_feedback_from_teacher?student_id=#{student.id}&level_id=#{level.id}&teacher_id=#{teacher2.id}"
    assert_equal comment2, JSON.parse(@response.body)['comment']
  end

  test 'retrieves comment on requested level when teacher has given student feedback on multiple levels' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)
    level1 = create :level
    level2 = create :level
    level3 = create :level
    comment1 = "Comment Alpha"
    comment2 = "Comment Beta"
    comment3 = "Comment Theta"

    teacher_sign_in_and_comment(teacher, student, level1, comment1)
    teacher_sign_in_and_comment(teacher, student, level2, comment2)
    teacher_sign_in_and_comment(teacher, student, level3, comment3)

    get "#{API}/show_feedback_from_teacher?student_id=#{student.id}&level_id=#{level2.id}&teacher_id=#{teacher.id}"

    assert_equal comment2, JSON.parse(@response.body)['comment']
  end

  test 'retrieves the most recent comment from a teacher' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)
    level = create :level
    comment1 = "First"
    comment2 = "Second"
    comment3 = "Third"

    teacher_sign_in_and_comment(teacher, student, level, comment1)
    teacher_sign_in_and_comment(teacher, student, level, comment2)
    teacher_sign_in_and_comment(teacher, student, level, comment3)

    get "#{API}/show_feedback_from_teacher?student_id=#{student.id}&level_id=#{level.id}&teacher_id=#{teacher.id}"

    assert_equal comment3, JSON.parse(@response.body)['comment']
  end

  test 'student can retrieve feedback for a level - one comment, one teacher' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)
    level = create :level
    comment = "Retrieved"

    teacher_sign_in_and_comment(teacher, student, level, comment)
    sign_out teacher

    sign_in student

    get "#{API}/show_feedback_for_level?student_id=#{student.id}&level_id=#{level.id}"

    #puts JSON.parse(@response.body)['feedbacks']

    assert_equal 1, JSON.parse(@response.body)['feedbacks'].count
    assert_equal comment, JSON.parse(@response.body)['feedbacks'][0]['comment']
  end

  test 'student can retrieve feedback for a level - two comments, one teacher' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)
    level = create :level
    comment1 = "First"
    comment2 = "Second"

    teacher_sign_in_and_comment(teacher, student, level, comment1)
    #Mocks delay between teacher leaving comments
    sleep 1
    teacher_sign_in_and_comment(teacher, student, level, comment2)
    sign_out teacher

    sign_in student

    get "#{API}/show_feedback_for_level?student_id=#{student.id}&level_id=#{level.id}"

    assert_equal 1, JSON.parse(@response.body)['feedbacks'].count
    assert_equal comment2, JSON.parse(@response.body)['feedbacks'][0]['comment']
  end

  test 'student can retrieve feedback for a level - two comments, two teachers' do
    teacher1 = create :teacher
    teacher2 = create :teacher
    student = create :student
    section1 = create :section, user: teacher1
    section1.add_student(student)
    section2 = create :section, user: teacher2
    section2.add_student(student)
    level = create :level
    comment1 = "First"
    comment2 = "Second"

    teacher_sign_in_and_comment(teacher1, student, level, comment1)
    sign_out teacher1
    teacher_sign_in_and_comment(teacher2, student, level, comment2)
    sign_out teacher2

    sign_in student

    get "#{API}/show_feedback_for_level?student_id=#{student.id}&level_id=#{level.id}"

    assert_equal 2, JSON.parse(@response.body)['feedbacks'].count
    assert_equal comment1, JSON.parse(@response.body)['feedbacks'][0]['comment']
    assert_equal comment2, JSON.parse(@response.body)['feedbacks'][1]['comment']
  end

  test 'student can retrieve feedback for a level - three comments, two teachers' do
    teacher1 = create :teacher
    teacher2 = create :teacher
    student = create :student
    section1 = create :section, user: teacher1
    section1.add_student(student)
    section2 = create :section, user: teacher2
    section2.add_student(student)
    level = create :level
    comment1 = "First"
    comment2 = "Second"
    comment3 = "Third"

    teacher_sign_in_and_comment(teacher1, student, level, comment1)
    sign_out teacher1
    teacher_sign_in_and_comment(teacher2, student, level, comment2)
    sign_out teacher2
    #Mocks delay between teacher leaving comments
    sleep 1
    teacher_sign_in_and_comment(teacher1, student, level, comment3)
    sign_out teacher1

    sign_in student

    get "#{API}/show_feedback_for_level?student_id=#{student.id}&level_id=#{level.id}"

    assert_equal 2, JSON.parse(@response.body)['feedbacks'].count
    assert_equal comment2, JSON.parse(@response.body)['feedbacks'][0]['comment']
    assert_equal comment3, JSON.parse(@response.body)['feedbacks'][1]['comment']
  end

  test 'student can retrieve feedback for a level - one comment, two teachers' do
    teacher1 = create :teacher
    teacher2 = create :teacher
    student = create :student
    section1 = create :section, user: teacher1
    section2 = create :section, user: teacher2
    section1.add_student(student)
    section2.add_student(student)
    level = create :level
    comment = "Retrieved"

    teacher_sign_in_and_comment(teacher1, student, level, comment)
    sign_out teacher1

    sign_in student

    get "#{API}/show_feedback_for_level?student_id=#{student.id}&level_id=#{level.id}"

    assert_equal 1, JSON.parse(@response.body)['feedbacks'].count
    assert_equal comment, JSON.parse(@response.body)['feedbacks'][0]['comment']
    assert_equal teacher1.id, JSON.parse(@response.body)['feedbacks'][0]['teacher_id']
  end

  test 'student can retrieve feedback for a level - two levels, one comment per level, one teacher' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)
    level1 = create :level
    level2 = create :level
    comment1 = "First"
    comment2 = "Second"

    teacher_sign_in_and_comment(teacher, student, level1, comment1)
    teacher_sign_in_and_comment(teacher, student, level2, comment2)
    sign_out teacher

    sign_in student

    get "#{API}/show_feedback_for_level?student_id=#{student.id}&level_id=#{level1.id}"

    assert_equal 1, JSON.parse(@response.body)['feedbacks'].count
    assert_equal comment1, JSON.parse(@response.body)['feedbacks'][0]['comment']
  end

  test 'returns elegantly when no feedback' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)
    level1 = create :level

    sign_in student

    get "#{API}/show_feedback_for_level?student_id=#{student.id}&level_id=#{level1.id}"

    assert_equal 0, JSON.parse(@response.body)['feedbacks'].count
  end
end
