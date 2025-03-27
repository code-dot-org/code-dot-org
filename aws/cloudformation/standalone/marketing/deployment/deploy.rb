#!/usr/bin/env ruby
require_relative './config'

puts "\nTransforming ERB to YAML..."
` erb -T - -r ./config.rb marketing.yml.erb > marketing.yml `
return unless $?&.exitstatus == 0
puts "Success!"
