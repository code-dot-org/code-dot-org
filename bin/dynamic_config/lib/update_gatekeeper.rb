#!/usr/bin/env ruby

puts "Loading environment..."
require_relative '../../../dashboard/config/environment'
require 'dynamic_config/loaders/gatekeeper_loader'

puts "Updating config..."
GatekeeperLoader.load(ARGV[0])
puts "Done"
