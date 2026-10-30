#!/usr/bin/env ruby

# RED uses Code.org initiative field on Levelbuilder to
# track the success of investments.  Currently self paced
# async and facilitator-led scripts have the same initiative.
# With the new focus on custom workshops, we would like for
# some of these scripts to have different names.

require_relative '../../../dashboard/config/environment'

def backfill_script_announcement_keys
  raise unless Rails.application.config.levelbuilder_mode

  # Inlining the backfill data as per requirements in https://codedotorg.atlassian.net/browse/TEACH-844
  scripts_initiatives_mapping = {
    pd_workshop_activity_csp: %w[vpl-csp-2020 vpl-csp-2021 vpl-csp-2022 vpl-csp-2023-m1 vpl-csp-2023-m2 vpl-csp-2023-m3 vpl-csp-2023-m4 vpl-csp-2023-m5 vpl-csp-2023-m6 vpl-csp-2023-m7 vpl-csp-2023-m8],
    pd_workshop_activity_csd: %w[vpl-csd-2020 vpl-csd-2021 vpl-csd1-summer-pilot-2022 vpl-csd2-summer-pilot-2022 vpl-csd3-summer-pilot-2022 vpl-csd4-summer-pilot-2022 vpl-csd5-summer-pilot-2022 vpl-csd1-ci-pilot-2022 vpl-csd2-ci-pilot-2022 vpl-csd3-ci-pilot-2022 vpl-csd4-ci-pilot-2022 vpl-csd5-ci-pilot-2022 vpl-csd6-ci-pilot-2022 vpl-csd7-ci-pilot-2022 vpl-csd-2022 vpl-csd1-ayw-pilot-2022 vpl-csd2-ayw-pilot-2022 vpl-csd3-ayw-pilot-2022 vpl-csd4-ayw-pilot-2022 vpl-csd5-ayw-pilot-2022 vpl-csd6-ayw-pilot-2022 vpl-csd7-ayw-pilot-2022 vpl-csd8-ayw-pilot-2022 vpl-csd-ci-1 vpl-csd-ci-2 vpl-csd-ci-3 vpl-csd-ci-4 vpl-csd-ci-5 vpl-csd-ci-6 vpl-csd-ci-7 vpl-csd-ci-6b vpl-csd-2023-m1 vpl-csd-2023-m2 vpl-csd-2023-m3 vpl-csd-2023-m4 vpl-csd-2023-m5 vpl-csd-2023-m6 vpl-csd-2023-m7 vpl-csd-2023-m8],
    pd_workshop_activity_csa: %w[self-paced-pl-csa1-2022 self-paced-pl-csa2-2022 self-paced-pl-csa3-2022 vpl-csa-2022 self-paced-pl-csa-2023 self-paced-pl-csa1-2023 self-paced-pl-csa2-2023 self-paced-pl-csa3-2023 self-paced-pl-csa4-2023 vpl-csa-2023-m1 vpl-csa-2023-m2 vpl-csa-2023-m3 vpl-csa-2023-m4 vpl-csa-2023-m5 vpl-csa-2023-m6 vpl-csa-2023-m7 vpl-csa-2023-m8]
  }

  scripts_to_update = scripts_initiatives_mapping.values.flatten

  Unit.all.each do |script|
    next unless scripts_to_update.include?(script.name)

    if (scripts_initiatives_mapping[:pd_workshop_activity_csp]).include?(script.name)
      script.curriculum_umbrella = "PD Workshop Activity CSP"
    elsif (scripts_initiatives_mapping[:pd_workshop_activity_csd]).include?(script.name)
      script.curriculum_umbrella = "PD Workshop Activity CSD"
    elsif (scripts_initiatives_mapping[:pd_workshop_activity_csa]).include?(script.name)
      script.curriculum_umbrella = "PD Workshop Activity CSA"
    end

    begin
      script.save!
    rescue Exception => exception
      puts "Skipping #{script.id} - #{script.name} because of error:"
      puts exception.message
      next
    end

    # Update its script_json
    script.write_script_json
  end
end

backfill_script_announcement_keys
