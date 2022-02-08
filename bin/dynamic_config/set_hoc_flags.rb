#!/usr/bin/env ruby
#
# A script to set the Gatekeeper and DCDO flags for HOC 2015 in one of
# several predefined modes:
#
# - red ("read-only" disaster mode for HOC scripts)
# - yellow (non-essential features disabled for HOC scripts)
# - green (all features enabled)
#
# See the documentation below for more details.
puts "Loading..."
require_relative '../../dashboard/config/environment'
require 'pp'

# The names of scripts we expect to see
HIGH_SCALE_UNIT_NAMES = %w(
  frozen
  gumball
  hourofcode
  starwars
  starwarsblocks
  mc
).freeze

def main(argv)
  if argv.size != 1

    puts <<-EOF
Usage: #{$0}: red|yellow|green

 - red: No HOC sharing, no HOC hints, no hoc_activity writes, no signed-in user progress saving, no HOC puzzle rating.
 - yellow: No HOC puzzle rating, no HOC hints, no hoc_activity writes.
 - green: all features turned on. SHOULD NOT BE USED UNTIL HOC IS OVER

 Public caching is enabled for all HOC scripts in all cases because this doesn't take away functionality
EOF
    exit
  end

  mode = argv.shift
  # Set global Gatekeeper and DCDO flags.
  case mode
    when 'red'
      Gatekeeper.set('postMilestone', value: false)
      Gatekeeper.set('tracking_pixel_enabled', value: false)
      Gatekeeper.set('puzzle_rating', value: false)
      DCDO.set('hoc_activity_sample_weight', 0)  # Don't write to hoc_activity.
      DCDO.set('activity_max_rate', 100)
    when 'yellow'
      Gatekeeper.set('postMilestone', value: true)
      Gatekeeper.set('tracking_pixel_enabled', value: false)
      Gatekeeper.set('puzzle_rating', value: false)
      DCDO.set('hoc_activity_sample_weight', 10)  # Sample 1/10 of sessions in hoc_activity.
      DCDO.set('activity_max_rate', 3000)  # Max async op rate per queue processor.
    when 'green'
      Gatekeeper.set('postMilestone', value: true)
      Gatekeeper.set('tracking_pixel_enabled', value: true)
      Gatekeeper.set('puzzle_rating', value: true)
      DCDO.set('hoc_activity_sample_weight', 1)  # Include all sessions in hoc_activity.
      DCDO.set('activity_max_rate', 0)  # No limit.
    else
      raise "Unexpected mode #{mode}"
  end

  # Set script-specific Gatekeeper flags.
  puts "Setting flags to #{mode}"
  HIGH_SCALE_UNIT_NAMES.each do |script_name|
    case mode
    when 'red'
      Gatekeeper.set('shareEnabled', value: false, where: {script_name: script_name})
      Gatekeeper.set('hint_view_request', value: false, where: {script_name: script_name})
    when 'yellow'
      Gatekeeper.set('shareEnabled', value: true, where: {script_name: script_name})
      Gatekeeper.set('hint_view_request', value: false, where: {script_name: script_name})
    when 'green'
      Gatekeeper.set('shareEnabled', value: true, where: {script_name: script_name})
      Gatekeeper.set('hint_view_request', value: true, where: {script_name: script_name})
    else
      raise "Unexpected mode #{mode}"
    end
  end

  pp Gatekeeper.to_hash
end

main(ARGV) if __FILE__ == $0
