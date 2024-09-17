#!/usr/bin/env ruby

# https://codedotorg.atlassian.net/browse/TEACH-1161
# When cloning CSD for SY 24-25, we hit an issue were all microbit levels were overwritten
# by circuit playground ones. The underlying root cause was that both these levels in 2023
# version of the curriculum had the same prefix, and only differed by the suffix., ie.,
# circuit playground levels had _2023 suffix, while microbit had _mb2022 suffix.

# During cloning, both these suffixes were replaced with _2024 initially, leading to the
# circuit playground levels getting overwritten. To fix the issues, the microbit units were
# deleted and recloned with _mb_2024 suffix. But, this issue could potentially happen when
# cloning for SY 25-26 if both units are cloned with 2025 as suffix. The below script is to
# avoid that issue. It does that by setting name_suffix property of the micro bit levels to
# nil. If its nil, during cloning, only the _2024 part of the microbit suffix would get
# replaced, hence preserving the unique name between circuit playground and microbit.

require_relative '../../../dashboard/config/environment'

def remove_level_name_suffix
  raise unless Rails.application.config.levelbuilder_mode

  levels_to_update = Level.where("name LIKE ?", "%\\_mb\\_2024")
  levels_to_update.each do |level|
    if level.name_suffix == "_mb_2024"
      puts "Processing level [#{level.name}] with name_suffix [#{level.name_suffix}]"

      level.update!(name_suffix: nil)
    else
      puts "Ignoring level [#{level.name}] with name_suffix [#{level.name_suffix}] not matching _mb_2024"
    end
  end
end

remove_level_name_suffix
