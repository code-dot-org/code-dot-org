#!/usr/bin/env ruby

# In case of units that are part of unit groups, the expectation is
# that the version_year propoerty at the unit level is set to nil
# and the version_year from unit group is used across the code base.
#
# As described in https://codedotorg.atlassian.net/browse/TEACH-1492,
# we identified a set of units that are part of unit groups, but with version_year
# set to a not-null value. A small subset of these had those years different from
# the value at unit group level.
#
# This script iterates over all these units and sets the version year property to nil

require_relative '../../../dashboard/config/environment'

def set_nil_version_year(actual_execution)
  raise unless Rails.application.config.levelbuilder_mode

  # The list of scripts were identified by filtering out all units which are part of unit groups
  # and have version_year set to nil. See JIRA task for the script that was executed in levelbuiler
  # to get this info.
  units_to_update = ['csp1-2017',  'csp2-2017',  'csp3-2017',  'csp4-2017',  'csp5-2017',  'csd3-2017',  'csd1-2017',  'csd2-2017',  'csd4-2017',  'csppostap-2017',  'csd6-2017',  'csd5-2017',  'csp-create-2017',  'csd3-2018',  'csd2-2018',  'csd6-2018',  'csp1-2018',  'csd1-2018',  'csd4-2018',  'csd5-2018',  'csp3-2018',  'csp-explore-2018',  'csp-create-2018',  'csp2-2018',  'csp4-2018',  'csp5-2018',  'csppostap-2018',  'csp-explore-2017',  'csd1-2019',  'csd2-2019',  'csd3-2019',  'csd4-2019',  'csd5-2019',  'csd6-2019',  'csp1-2019',  'csp2-2019',  'csp3-2019',  'csp4-2019',  'csp5-2019',  'csp-explore-2019', 'csp-create-2019', 'csppostap-2019', 'csd6-2020', 'csd6-2021', 'self-paced-pl-csd1-2021', 'self-paced-pl-csd2-2021', 'self-paced-pl-csd3-2021', 'self-paced-pl-csd4-2021', 'self-paced-pl-csp1-2021', 'self-paced-pl-csp2-2021', 'self-paced-pl-csp3-2021', 'self-paced-pl-csp4-2021', 'csp1-2022', 'csp2-2022', 'csp3-2022', 'csp4-2022', 'csp5-2022', 'csp6-2022', 'csp8-2022', 'csp9-2022', 'csp10-2022', 'csd1-2022', 'csd2-2022', 'csd3-2022', 'csd4-2022', 'csd5-2022', 'csd7-2022', 'self-paced-pl-csd3-2022', 'self-paced-pl-csd1-2022', 'self-paced-pl-csd2-2022', 'self-paced-pl-csd4-2022', 'self-paced-pl-csp1-2022', 'self-paced-pl-csp2-2022', 'self-paced-pl-csp3-2022', 'self-paced-pl-csp4-2022', 'csd1-2023', 'csd2-2023', 'csd4-2023', 'csd5-2023', 'csd3-2023', 'csd7-2023', 'self-paced-pl-physical-computing1', 'self-paced-pl-physical-computing2', 'csp1-2023', 'csp2-2023', 'csp3-2023', 'csp4-2023', 'csp5-2023', 'csp6-2023', 'csp8-2023', 'csp9-2023', 'csp10-2023', 'self-paced-pl-k5-getting-started', 'csd6a-2023', 'self-paced-pl-physical-computing1-2023', 'self-paced-pl-physical-computing2-2023', 'self-paced-pl-csd1-2023', 'self-paced-pl-csd2-2023', 'self-paced-pl-csd3-2023', 'self-paced-pl-csd4-2023', 'self-paced-pl-csd5-2023', 'self-paced-pl-microbit1', 'self-paced-pl-microbit2', 'self-paced-pl-csp1-2023', 'self-paced-pl-csp2-2023', 'self-paced-pl-csp3-2023', 'self-paced-pl-csp4-2023', 'self-paced-pl-aiml1', 'self-paced-pl-aiml2', 'csa-postap-se-and-computer-vision-2023', 'self-paced-pl-csd-unit1-1-2023', 'self-paced-pl-csd-unit1-2-2023', 'self-paced-pl-csd-unit2-1-2023', 'self-paced-pl-csd-unit2-2-2023', 'self-paced-pl-csd-unit3-1-2023', 'self-paced-pl-csd-unit3-2-2023', 'self-paced-pl-csd-unit4-1-2023', 'self-paced-pl-csd-unit4-2-2023', 'self-paced-pl-csd-unit5-1-2023', 'self-paced-pl-csd-unit5-2-2023', 'csd1-2024', 'csd2-2024', 'csd3-2024', 'csd4-2024', 'csd5-2024', 'csd6a-2024', 'csd7-2024', 'self-paced-pl-k5-2024-2', 'self-paced-pl-k5-2024-1', 'csp1-2024', 'csp2-2024', 'csp3-2024', 'csa-postap-se-and-computer-vision-2024', 'csp4-2024', 'csp5-2024', 'csp6-2024', 'csp8-2024', 'csp9-2024', 'csp10-2024', 'csa-postap-se-and-computer-vision-2025', 'self-paced-pl-microbit-2024-1', 'self-paced-pl-microbit-2024-2', 'self-paced-pl-microbit-2024-6', 'k5-maker-pilot-2024-1', 'k5-maker-pilot-2024-2', 'k5-maker-pilot-2024-3', 'k5-maker-pilot-2024-4', 'k5-maker-pilot-2024-5', 'fcs2-beta-2024', 'fcs3-beta-2024', 'fcs4-beta-2024', 'fcs5-beta-2024', 'fcs6-beta-2024', 'fcs1a-beta-2024', 'fcs1b-beta-2024', 'self-paced-pl-csd1-2024', 'self-paced-pl-csd2-2024', 'self-paced-pl-csd3-2024', 'self-paced-pl-csd4-2024', 'self-paced-pl-csd5-2024', 'self-paced-pl-csd-unit1-1-2024', 'self-paced-pl-csd-unit1-2-2024', 'self-paced-pl-csd-unit2-1-2024', 'self-paced-pl-csd-unit2-2-2024', 'self-paced-pl-csd-unit3-1-2024', 'self-paced-pl-csd-unit3-2-2024', 'self-paced-pl-csd-unit5-1-2024', 'self-paced-pl-csd-unit5-2-2024', 'self-paced-pl-physical-computing1-2024', 'self-paced-pl-physical-computing2-2024', 'vpl-csa-2024-m7', 'vpl-csa-2024-m8', 'vpl-csp-2024-m7', 'vpl-csp-2024-m8', 'self-paced-pl-csp1-2024', 'self-paced-pl-csp2-2024', 'self-paced-pl-csp3-2024', 'self-paced-pl-csp4-2024', 'self-paced-pl-microbit1-2024', 'self-paced-pl-microbit2-2024', 'self-paced-pl-aiml1-2024', 'self-paced-pl-aiml2-2024', 'self-paced-pl-csd-unit4-1-2024', 'self-paced-pl-csd-unit4-2-2024', 'self-paced-pl-ai-101-mod1', 'self-paced-pl-ai-101-mod2', 'self-paced-pl-ai-101-mod3', 'self-paced-pl-ai-101-mod4', 'self-paced-pl-ai-101-mod5', 'fcs1c-beta-2024', 'focus-on-coding2-2024', 'focus-on-creativity2-2024', 'focus-on-design-with-purpose2-2024', 'self-paced-pl-foundations-unit3', 'self-paced-pl-foundations-unit4', 'self-paced-pl-foundations-unit1', 'self-paced-pl-foundations-unit2', 'self-paced-pl-computer-vision', 'self-paced-pl-coding-with-ai', 'self-paced-pl-computer-vision-2024', 'self-paced-pl-coding-with-ai-2024', 'sandbox-welcome-to-maker', 'self-paced-pl-foundations-intro', 'self-paced-pl-foundations-getting-started', 'self-paced-pl-foundations-teaching-cs', 'k5plgamedesign', 'k5howaimakesdecisions', 'k5maker', 'k5microbitmaker', 'k5maker4thgrade', 'k5maker5thgrade', 'intro-to-data-science-2024', 'data-science-with-python-2024', 'getting-started-with-code', 'getting-started-with-code-maker', 'getting-started-with-code-game-design', 'exploring-gen-ai1-2024', 'exploring-gen-ai2-2024', 'self-paced-pl-exploring-gen-ai', 'self-paced-pl-equitymodule-unit1', 'self-paced-pl-equitymodule-unit2', 'sandbox-teaching-getting-started', 'sandbox-pl-teaching-k5-music-lab', '6-12-intro-to-programming-python', '6-12-computer-systems-and-devices']

  # iterate over each script to be updated
  units_to_update.each do |unit_name|
    unit = Unit.find_by_name(unit_name)
    if unit.nil?
      warn "Unable to find script with name #{unit_name}"
      next
    end

    unless unit.unit_group
      puts "#{unit_name} is not part of unit group. Skipping."
      next
    end

    if unit.version_year.nil?
      puts "#{unit_name} already has version_year set to nil. Skipping."
      next
    end

    puts "Updating version_year to nil for unit [#{unit_name}]"
    unless actual_execution
      puts "Skipping due to dry run mode. Call the script with '-for-real' argument for actual execution."
      next
    end

    unit.version_year = nil

    begin
      unit.save!
    rescue Exception => exception
      warn "Skipping #{script.id} - #{script.name} because of error:"
      warn exception.message
      next
    end

    # Update its script_json
    unit.write_script_json
  end
end

set_nil_version_year(ARGV.length == 1 && ARGV[0] == "-for-real")
