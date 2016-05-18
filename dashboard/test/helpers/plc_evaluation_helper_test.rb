require 'test_helper'

class PlcEvaluationHelperTest < ActionView::TestCase
  setup do
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


    q1_dsl = <<DSL
    name 'Question 1'
    question 'What is your name?'
    answer 'Sir Lancelot', weight: 1, stage_name: '#{@stage_honesty.name}'
    answer 'Sir Robin', weight: 1, stage_name: '#{@stage_no_nickname.name}'
    answer 'Sir Galahad', weight: 1, stage_name: '#{@stage_honesty.name}'
    answer 'King Arthur', weight: 1, stage_name: '#{@stage_honesty.name}'
    answer 'Mr Edgecase'
DSL

    q2_dsl = <<DSL
    name 'Question 2'
    question 'What is your quest?'
    answer 'I seek the grail', weight: 1, stage_name: '#{@stage_honesty.name}'
    answer 'Yes, yes, I seek the Grail', weight: 1, stage_name: '#{@stage_no_nickname.name}'
    answer 'I seek something else'
DSL

    q3_dsl = <<DSL
    name 'Question 3'
    question 'What is your favorite color?'
    answer 'Blue', weight: 1, stage_name: '#{@stage_blue.name}'
    answer 'Yellow - no, blue', weight: 1, stage_name: '#{@stage_cliffs.name}'
    answer 'No preference'
DSL

    q4_dsl = <<DSL
    name 'Question 4'
    question 'What is the capital of Assyria?'
    answer 'I dont know that!', weight: 1, stage_name: '#{@stage_ignorance.name}'
    answer 'Nineveh'
DSL

    q5_dsl = <<DSL
    name 'Question 5'
    question 'What is the airspeed velocity of an unladen swallow?'
    answer 'What do you mean, an African or European Swallow?', weight: 1, stage_name: '#{@stage_ornithology.name}'
    answer '15 m/s'
DSL
  
    
  end
end
