class AddCourseUnitToLearningModules < ActiveRecord::Migration[4.2]
  def up
    add_reference :plc_learning_modules, :plc_course_unit, index: true, foreign_key: true

    # Create a default Plc::CourseUnit to own all orphaned Learning Modules
    default_course = Plc::Course.find_or_create_by! name: 'Default Course'
    default_course_unit = Plc::CourseUnit.find_or_create_by! plc_course: default_course, unit_name: 'Default Unit'
    Plc::LearningModule.update_all plc_course_unit_id: default_course_unit.id

    # For Learning Modules referenced by an Evaluation answer, update the Course Unit (for duplicates, last ref wins)
    Plc::CourseUnit.all.each do |unit|
      unit.plc_evaluation_questions.each do |question|
        question.plc_evaluation_answers.each do |answer|
          answer.plc_learning_module.update! plc_course_unit_id: unit.id unless answer.plc_learning_module.nil?
        end
      end
    end

    if default_course_unit.plc_learning_modules.count == 0
      default_course_unit.delete!
      default_course.delete!
    end

    change_column_null :plc_learning_modules, :plc_course_unit_id, false
  end

  def down
    remove_reference :plc_learning_modules, :plc_course_unit, index: true, foreign_key: true
  end
end
