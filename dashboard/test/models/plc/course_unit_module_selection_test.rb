require 'test_helper'

class CourseUnitModuleSelectionTest < ActionView::TestCase
  setup do
    @user = create :teacher
    plc_course = create :plc_course

    @course_unit = create(:plc_course_unit, plc_course: plc_course)

    @content_lesson_group = create(:lesson_group, key: Plc::LearningModule::CONTENT_MODULE, script: @course_unit.script)
    @practice_lesson_group = create(:lesson_group, key: Plc::LearningModule::PRACTICE_MODULE, script: @course_unit.script)

    @lesson_cliffs = create(:lesson, name: 'Cliff lesson', script: @course_unit.script, lesson_group: @content_lesson_group)
    @lesson_ornithology = create(:lesson, name: 'Ornithology lesson', script: @course_unit.script, lesson_group: @content_lesson_group)
    @lesson_ignorance = create(:lesson, name: 'Ignorance lesson', script: @course_unit.script, lesson_group: @content_lesson_group)
    @lesson_blue = create(:lesson, name: 'Blue lesson', script: @course_unit.script, lesson_group: @content_lesson_group)

    @lesson_honesty = create(:lesson, name: 'Honesty lesson', script: @course_unit.script, lesson_group: @practice_lesson_group)
    @lesson_no_nickname = create(:lesson, name: 'No nickname lesson', script: @course_unit.script, lesson_group: @practice_lesson_group)

    @module_cliffs = create(:plc_learning_module, name: 'Getting thrown off cliffs', plc_course_unit: @course_unit, module_type: @lesson_cliffs.lesson_group.key, lesson: @lesson_cliffs)
    @module_ornithology = create(:plc_learning_module, name: 'Ornithology', plc_course_unit: @course_unit, module_type: @lesson_ornithology.lesson_group.key, lesson: @lesson_ornithology)
    @module_ignorance = create(:plc_learning_module, name: 'Admitting Ignorance', plc_course_unit: @course_unit, module_type: @lesson_ignorance.lesson_group.key, lesson: @lesson_ignorance)
    @module_blue = create(:plc_learning_module, name: 'Blue', plc_course_unit: @course_unit, module_type: @lesson_blue.lesson_group.key, lesson: @lesson_blue)

    @module_honesty = create(:plc_learning_module, name: 'Answering questions honestly', plc_course_unit: @course_unit, module_type: @lesson_honesty.lesson_group.key, lesson: @lesson_honesty)
    @module_no_nickname = create(:plc_learning_module, name: 'Not revealing your nickname', plc_course_unit: @course_unit, module_type: @lesson_no_nickname.lesson_group.key, lesson: @lesson_no_nickname)

    q1_dsl = <<-DSL.strip_heredoc.chomp
    name 'Question 1'
      question 'What is your name?'
      answer 'Sir Lancelot', weight: 1, stage_name: '#{@lesson_honesty.name}'
      answer 'Sir Robin', weight: 1, stage_name: '#{@lesson_no_nickname.name}'
      answer 'Sir Galahad', weight: 1, stage_name: '#{@lesson_honesty.name}'
      answer 'King Arthur', weight: 1, stage_name: '#{@lesson_honesty.name}'
      answer 'Mr Edgecase'
    DSL

    q2_dsl = <<-DSL.strip_heredoc.chomp
    name 'Question 2'
      question 'What is your quest?'
      answer 'I seek the grail', weight: 1, stage_name: '#{@lesson_honesty.name}'
      answer 'Yes, yes, I seek the Grail', weight: 1, stage_name: '#{@lesson_no_nickname.name}'
      answer 'I seek something else'
    DSL

    q3_dsl = <<-DSL.strip_heredoc.chomp
    name 'Question 3'
      question 'What is your favorite color?'
      answer 'Blue', weight: 1, stage_name: '#{@lesson_blue.name}'
      answer 'Yellow - no, blue', weight: 1, stage_name: '#{@lesson_cliffs.name}'
      answer 'No preference'
    DSL

    q4_dsl = <<-DSL.strip_heredoc.chomp
    name 'Question 4'
      question 'What is the capital of Assyria?'
      answer 'I dont know that!', weight: 1, stage_name: '#{@lesson_ignorance.name}'
      answer 'Nineveh'
    DSL

    q5_dsl = <<-DSL.strip_heredoc.chomp
    name 'Question 5'
      question 'What is the airspeed velocity of an unladen swallow?'
      answer 'What do you mean, an African or European Swallow?', weight: 1, stage_name: '#{@lesson_ornithology.name}'
      answer '15 m/s'
    DSL

    @evaluation_multi1 = EvaluationMulti.create_from_level_builder({name: 'Question 1'}, {dsl_text: q1_dsl})
    @evaluation_multi2 = EvaluationMulti.create_from_level_builder({name: 'Question 2'}, {dsl_text: q2_dsl})
    @evaluation_multi3 = EvaluationMulti.create_from_level_builder({name: 'Question 3'}, {dsl_text: q3_dsl})
    @evaluation_multi4 = EvaluationMulti.create_from_level_builder({name: 'Question 4'}, {dsl_text: q4_dsl})
    @evaluation_multi5 = EvaluationMulti.create_from_level_builder({name: 'Question 5'}, {dsl_text: q5_dsl})

    levelgroup_dsl = <<-DSL.strip_heredoc.chomp
    name 'Crossing the bridge of death'
      title 'Bridge of Death Evaluation'
      submittable 'true'

      page
      level 'Question 1'
      level 'Question 2'
      level 'Question 3'
      level 'Question 4'
      level 'Question 5'
    DSL

    @evaluation = LevelGroup.create_from_level_builder({name: 'evaluation'}, {dsl_text: levelgroup_dsl})
    create(:script_level, script: @course_unit.script, levels: [@evaluation], lesson: @lesson_honesty)
    @user_level = create(:user_level, user: @user, script: @course_unit.script, level: @evaluation)
    @activity = create(:activity, user: @user, level: @evaluation)
    @user_level = create(:user_level, user: @user, level: @evaluation)
  end

  test 'submit evaluation enrolls user in appropriate modules' do
    assert_equal [@module_blue, @module_honesty], get_preferred_modules_for_answers(
      [
        [@evaluation_multi1, 'Sir Lancelot'],
        [@evaluation_multi2, 'I seek the grail'],
        [@evaluation_multi3, 'Blue']
      ]
    )

    assert_equal [@module_ignorance, @module_no_nickname], get_preferred_modules_for_answers(
      [
        [@evaluation_multi1, 'Sir Robin'],
        [@evaluation_multi2, 'Yes, yes, I seek the Grail'],
        [@evaluation_multi4, 'I dont know that!']
      ]
    )

    assert_equal [@module_cliffs, @module_honesty], get_preferred_modules_for_answers(
      [
        [@evaluation_multi1, 'Sir Galahad'],
        [@evaluation_multi2, 'I seek the grail'],
        [@evaluation_multi3, 'Yellow - no, blue']
      ]
    )

    assert_equal [@module_ornithology, @module_honesty], get_preferred_modules_for_answers(
      [
        [@evaluation_multi1, 'King Arthur'],
        [@evaluation_multi2, 'I seek the grail'],
        [@evaluation_multi5, 'What do you mean, an African or European Swallow?']
      ]
    )

    assert_equal [], get_preferred_modules_for_answers(
      [
        [@evaluation_multi1, 'Mr Edgecase'],
        [@evaluation_multi2, 'I seek something else'],
        [@evaluation_multi5, '15 m/s']
      ]
    )
  end

  def get_preferred_modules_for_answers(answers_map)
    answers_data = Hash.new

    answers_map.each do |evaluation_multi, answer|
      answers_data[evaluation_multi.id] = {'result': evaluation_multi.answers.find_index {|x| x['text'] == answer}.to_s}
    end

    level_source = create(:level_source, level: @evaluation, data: answers_data.to_json)
    @user_level.update(level_source: level_source)
    @activity.update(level_source: level_source)
    @user_level.update(level_source: level_source)
    @course_unit.determine_preferred_learning_modules @user
  end
end
