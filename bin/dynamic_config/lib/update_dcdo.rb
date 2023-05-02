#!/usr/bin/env ruby

puts "Loading environment..."
require_relative '../../../dashboard/config/environment'
require 'dynamic_config/loaders/dcdo_loader'

puts "Updating config..."
DCDOLoader.load(ARGV[0])
puts "Done"
