require 'test_helper'

class CourseUnitModuleSelectionTest < ActionView::TestCase
  setup do
    @user = create :teacher
    course = create :plc_course

    @course_unit = create(:plc_course_unit, plc_course: course)

    @stage_cliffs = create(:stage, name: 'Cliff stage', script: @course_unit.script, flex_category: Plc::LearningModule::CONTENT_MODULE)
    @stage_ornithology = create(:stage, name: 'Ornithology stage', script: @course_unit.script, flex_category: Plc::LearningModule::CONTENT_MODULE)
    @stage_ignorance = create(:stage, name: 'Ignorance stage', script: @course_unit.script, flex_category: Plc::LearningModule::CONTENT_MODULE)
    @stage_blue = create(:stage, name: 'Blue stage', script: @course_unit.script, flex_category: Plc::LearningModule::CONTENT_MODULE)

    @stage_honesty = create(:stage, name: 'Honesty stage', script: @course_unit.script, flex_category: Plc::LearningModule::PRACTICE_MODULE)
    @stage_no_nickname = create(:stage, name: 'No nickname stage', script: @course_unit.script, flex_category: Plc::LearningModule::PRACTICE_MODULE)

    @module_cliffs = create(:plc_learning_module, name: 'Getting thrown off cliffs', plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE, stage: @stage_cliffs)
    @module_ornithology = create(:plc_learning_module, name: 'Ornithology', plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE, stage: @stage_ornithology)
    @module_ignorance = create(:plc_learning_module, name: 'Admitting Ignorance', plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE, stage: @stage_ignorance)
    @module_blue = create(:plc_learning_module, name: 'Blue', plc_course_unit: @course_unit, module_type: Plc::LearningModule::CONTENT_MODULE, stage: @stage_blue)

    @module_honesty = create(:plc_learning_module, name: 'Answering questions honestly', plc_course_unit: @course_unit, module_type: Plc::LearningModule::PRACTICE_MODULE, stage: @stage_honesty)
    @module_no_nickname = create(:plc_learning_module, name: 'Not revealing your nickname', plc_course_unit: @course_unit, module_type: Plc::LearningModule::PRACTICE_MODULE, stage: @stage_no_nickname)

    q1_dsl = <<-DSL.strip_heredoc.chomp
    name 'Question 1'
      question 'What is your name?'
      answer 'Sir Lancelot', weight: 1, stage_name: '#{@stage_honesty.name}'
      answer 'Sir Robin', weight: 1, stage_name: '#{@stage_no_nickname.name}'
      answer 'Sir Galahad', weight: 1, stage_name: '#{@stage_honesty.name}'
      answer 'King Arthur', weight: 1, stage_name: '#{@stage_honesty.name}'
      answer 'Mr Edgecase'
    DSL

    q2_dsl = <<-DSL.strip_heredoc.chomp
    name 'Question 2'
      question 'What is your quest?'
      answer 'I seek the grail', weight: 1, stage_name: '#{@stage_honesty.name}'
      answer 'Yes, yes, I seek the Grail', weight: 1, stage_name: '#{@stage_no_nickname.name}'
      answer 'I seek something else'
    DSL

    q3_dsl = <<-DSL.strip_heredoc.chomp
    name 'Question 3'
      question 'What is your favorite color?'
      answer 'Blue', weight: 1, stage_name: '#{@stage_blue.name}'
      answer 'Yellow - no, blue', weight: 1, stage_name: '#{@stage_cliffs.name}'
      answer 'No preference'
    DSL

    q4_dsl = <<-DSL.strip_heredoc.chomp
    name 'Question 4'
      question 'What is the capital of Assyria?'
      answer 'I dont know that!', weight: 1, stage_name: '#{@stage_ignorance.name}'
      answer 'Nineveh'
    DSL

    q5_dsl = <<-DSL.strip_heredoc.chomp
    name 'Question 5'
      question 'What is the airspeed velocity of an unladen swallow?'
      answer 'What do you mean, an African or European Swallow?', weight: 1, stage_name: '#{@stage_ornithology.name}'
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
    create(:script_level, script: @course_unit.script, levels: [@evaluation])
    @activity = create(:activity, user: @user, level: @evaluation)
  end

  test 'submit evaluation enrolls user in appropriate modules' do
    assert_equal [@module_blue.id, @module_honesty.id], get_preferred_modules_for_answers([
      [@evaluation_multi1, 'Sir Lancelot'],
      [@evaluation_multi2, 'I seek the grail'],
      [@evaluation_multi3, 'Blue']
    ])

    assert_equal [@module_ignorance.id, @module_no_nickname.id], get_preferred_modules_for_answers([
      [@evaluation_multi1, 'Sir Robin'],
      [@evaluation_multi2, 'Yes, yes, I seek the Grail'],
      [@evaluation_multi4, 'I dont know that!']
    ])

    assert_equal [@module_cliffs.id, @module_honesty.id], get_preferred_modules_for_answers([
      [@evaluation_multi1, 'Sir Galahad'],
      [@evaluation_multi2, 'I seek the grail'],
      [@evaluation_multi3, 'Yellow - no, blue']
    ])

    assert_equal [@module_ornithology.id, @module_honesty.id], get_preferred_modules_for_answers([
     [@evaluation_multi1, 'King Arthur'],
     [@evaluation_multi2, 'I seek the grail'],
     [@evaluation_multi5, 'What do you mean, an African or European Swallow?']
    ])

    assert_equal [], get_preferred_modules_for_answers([
     [@evaluation_multi1, 'Mr Edgecase'],
     [@evaluation_multi2, 'I seek something else'],
     [@evaluation_multi5, '15 m/s']
    ])
  end

  def get_preferred_modules_for_answers(answers_map)
    answers_data = Hash.new

    answers_map.each do |evaluation_multi, answer|
      answers_data[evaluation_multi.id] = {'result': evaluation_multi.answers.find_index {|x| x['text'] == answer}.to_s}
    end

    level_source = create(:level_source, level: @evaluation, data: answers_data.to_json)
    @activity.update(level_source: level_source)
    @course_unit.determine_preferred_learning_modules @user
  end
end
