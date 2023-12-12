#!/usr/bin/env ruby

# Sets instruction_type on UnitGroup and Script
# Scripts that are in UnitGroups get their instruction_type from
# their UnitGroup so we don't need to set their instruction_type
# For now we are just setting self_paced on PL courses but this
# could be updated and used in the future to set instruction_type
# for others courses

require_relative '../../dashboard/config/environment'

def set_instruction_type
  raise unless Rails.application.config.levelbuilder_mode

  self_paced_units = ['self-paced-pl-csd5-2021', 'self-paced-pl-csd6-2021', 'self-paced-pl-csd7-2021', 'self-paced-pl-csd8-2021']
  Unit.all.each do |script|
    # scripts in unit_groups get their instruction type from their unit group
    next if script.unit_group

    script.instruction_type = if self_paced_units.include?(script.name)
                                'self_paced'
                              else
                                'teacher_led'
                              end
    script.update!(skip_name_format_validation: true)
    script.write_script_json
  end

  self_paced_unit_groups = ['self-paced-pl-csp-2021', 'self-paced-pl-csd-2021']
  UnitGroup.all.each do |course|
    # default is teacher_led so only need to update unit groups we want to be self_paced
    next unless self_paced_unit_groups.include?(course.name)

    course.instruction_type = 'self_paced'
    course.save!
    course.write_serialization
  end
end

set_instruction_type
