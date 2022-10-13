class SetCourseTypeOnPlUnitGroups < ActiveRecord::Migration[5.2]
  def change
    Script.all.each do |script|
      if script.old_professional_learning_course?
        script.update!(skip_name_format_validation: true)
      end
    end
  end
end
