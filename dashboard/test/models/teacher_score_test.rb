require 'test_helper'
require 'timecop'

class TeacherScoreTest < ActiveSupport::TestCase
  setup do
    @teacher = create :teacher
    @student_1 = create :student
    @student_2 = create :student
    @student_3 = create :student
    @section = create :section, user: @teacher
    @section.add_student(@student_1)
    @section.add_student(@student_2)
    @section.add_student(@student_3)
    @script = create :script
    @lesson_group = create :lesson_group, script: @script
    @stage = create :lesson, script: @script, lesson_group: @lesson_group
    @script_level = create(
      :script_level,
      script: @script,
      lesson: @stage,
      levels: [
        create(:unplugged, name: 'test level 1')
      ]
    )
    @score = 100
    @score_2 = 0
    @level_1 = @script_level.levels[0]
  end

  test 'score level for student - no UserLevel' do
    teacher_scores_count_before = TeacherScore.all.count
    user_level_count_before = UserLevel.all.count

    TeacherScore.score_level_for_student(
      @teacher.id, @student_1.id, @level_1.id, @script.id, @score
    )

    teacher_scores_count_after = TeacherScore.all.count
    user_level_count_after = UserLevel.all.count

    assert_equal(user_level_count_after, user_level_count_before + 1)
    newly_created_user_level = UserLevel.last
    assert_equal(newly_created_user_level.user_id, @student_1.id)
    assert_equal(newly_created_user_level.level_id, @level_1.id)

    assert_equal(teacher_scores_count_after, teacher_scores_count_before + 1)
    newly_created_teacher_score = TeacherScore.last
    assert_equal(newly_created_teacher_score.teacher_id, @teacher.id)
    assert_equal(newly_created_teacher_score.score, @score)
    assert_equal(newly_created_teacher_score.user_level_id, newly_created_user_level.id)
  end

  test 'score level for student - update UserLevel' do
    user_level = UserLevel.create(
      user: @student_1,
      level: @level_1,
      script: @script,
      attempts: 1,
      best_result: Activity::MINIMUM_PASS_RESULT
    )

    teacher_scores_count_before = TeacherScore.all.count
    user_level_count_before = UserLevel.all.count

    TeacherScore.score_level_for_student(
      @teacher.id, @student_1.id, @level_1.id, @script.id, @score
    )

    teacher_scores_count_after = TeacherScore.all.count
    user_level_count_after = UserLevel.all.count

    assert_equal(user_level_count_after, user_level_count_before)

    assert_equal(teacher_scores_count_after, teacher_scores_count_before + 1)
    newly_created_teacher_score = TeacherScore.last
    assert_equal(newly_created_teacher_score.teacher_id, @teacher.id)
    assert_equal(newly_created_teacher_score.score, @score)
    assert_equal(newly_created_teacher_score.user_level_id, user_level.id)
  end

  test 'score stage for section' do
    teacher_scores_count_before = TeacherScore.all.count
    user_level_count_before = UserLevel.all.count
    student_count = @section.students.count

    TeacherScore.score_stage_for_section(
      @section.id, @stage.id, @score
    )

    teacher_scores_count_after = TeacherScore.all.count
    user_level_count_after = UserLevel.all.count

    assert_equal(user_level_count_after, user_level_count_before + student_count)

    assert_equal(teacher_scores_count_after, teacher_scores_count_before + student_count)
  end

  test 'get scores for stage looks at most recent score' do
    Timecop.freeze do
      TeacherScore.score_level_for_student(
        @teacher.id, @student_1.id, @level_1.id, @script.id, @score
      )

      Timecop.travel(1.day)

      TeacherScore.score_level_for_student(
        @teacher.id, @student_1.id, @level_1.id, @script.id, @score_2
      )
    end

    assert_equal(TeacherScore.get_level_scores_for_stage_for_students(@stage, @section.students.pluck(:id)), {@student_1.id => {@level_1.id => @score_2}})
  end

  test 'get scores for stage for students' do
    TeacherScore.score_stage_for_section(
      @section.id, @stage.id, @score
    )

    assert_equal(
      TeacherScore.get_level_scores_for_stage_for_students(
        @stage,
        @section.students.pluck(:id)
      ),
      {
        @student_1.id => {@level_1.id => @score},
        @student_2.id => {@level_1.id => @score},
        @student_3.id => {@level_1.id => @score}
      }
    )
  end

  test 'get scores for script for section' do
    TeacherScore.score_stage_for_section(
      @section.id, @stage.id, @score
    )
    page = 1
    assert_equal(
      TeacherScore.get_level_scores_for_script_for_section(
        @script.id,
        @section.id,
        page
      ),
      {
        @script.id => {
          @stage.id => {
            @student_1.id => {@level_1.id => @score},
            @student_2.id => {@level_1.id => @score},
            @student_3.id => {@level_1.id => @score}
          }
        }
      }
    )
  end
end
