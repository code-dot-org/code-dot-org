#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

Pd::Workshop.where("subject LIKE '%Academic Year Workshop%'").select {|w| w.created_at.strftime("%Y") == '2022'}.each do |workshop|
  if workshop.suppress_email?
    workshop.update!(suppress_email: false)
    puts "Successfully updated workshop id #{workshop.id}"
  end
rescue => exception
  puts "Error updating workshop id #{workshop.id}: #{exception}"
end
