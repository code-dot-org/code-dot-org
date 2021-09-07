#!/usr/bin/env ruby
require_relative '../../lib/cdo/only_one'
abort 'Script already running' unless only_one_running?(__FILE__)

require_relative '../../dashboard/config/environment'

def main
  Level.includes(:child_levels).all.each do |level|
    if level.contained_level_names.present?
      begin
        level.setup_contained_levels
      rescue => e
        puts e
      end
    end

    if level.project_template_level_name.present?
      begin
        level.setup_project_template_level
      rescue => e
        puts e
      end
    end
  end
end

main
