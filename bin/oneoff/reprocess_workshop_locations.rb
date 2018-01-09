#!/usr/bin/env ruby
require_relative '../../dashboard/config/environment'

# Select all starting from January 5th, the date on which the "save city and
# state" change was merged
starting_date = Date.new(2018, 1, 5)

workshops = Pd::Workshop.scheduled_start_on_or_after(starting_date)
total = workshops.each.count

puts "Processing #{total} workshops"
workshops.each.each_with_index do |workshop, i|
  workshop.process_location
  workshop.update_column :processed_location, workshop.processed_location

  puts "Processed #{i}/#{total}" if i % 100 == 0
end
