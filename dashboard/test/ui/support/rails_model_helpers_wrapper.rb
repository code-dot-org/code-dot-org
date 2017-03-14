#!/usr/bin/env ruby
require_relative 'rails_model_helpers'
include RailsModelHelpers

unless ARGV.count == 1
  puts "Usage: #{__FILE__} <method>, where method is a method in RailsModelHelpers to execute."
  exit 1
end

method = ARGV.first

send method
puts "#{method} executed successfully!"
