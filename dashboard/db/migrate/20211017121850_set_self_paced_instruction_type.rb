class SetSelfPacedInstructionType < ActiveRecord::Migration[5.2]
  def change
    Script.all.each do |script|
      # scripts in unit_groups get their instruction type from their unit group
      next unless script.unit_group
      script.instruction_type = if ['self-paced-pl-csd5-2021', 'self-paced-pl-csd6-2021', 'self-paced-pl-csd7-2021', 'self-paced-pl-csd8-2021'].include?(script.name)
                                  'self_paced'
                                else
                                  'teacher_led'
                                end
    end

    UnitGroup.all.each do |course|
      # default is teacher_led so only need to update unit groups we want to be self_paced
      if ['self-paced-pl-csp-2021', 'self-paced-pl-csd-2021'].include?(course.name)
        course.instruction_type = 'self_paced'
      end
    end
  end
end
