class SetSelfPacedInstructionType < ActiveRecord::Migration[5.2]
  def change
    Script.all.each do |script|
      if !script.unit_group && [].include?(script.name)
        script.instruction_type = 'self_paced'
      end
    end

    UnitGroup.all.each do |course|
      if [].include?(course.name)
        course.instruction_type = 'self_paced'
      end
    end
  end
end
