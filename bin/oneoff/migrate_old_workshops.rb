#!/usr/bin/env ruby
require 'json'

require_relative '../../dashboard/config/environment'
require File.expand_path('../../../pegasus/src/env', __FILE__)

old_workshops = PEGASUS_DB[:forms].where(kind: 'ProfessionalDevelopmentWorkshop')

old_workshops = old_workshops.to_a.map do |workshop|
  workshop[:data] = JSON.parse(workshop[:data])
  workshop
end

pending = old_workshops.select do |workshop|
  dates = workshop[:data]['dates']
  end_dates = dates.map do |d|
    date = d['date_s']
    if date =~ /^\d\d\/\d\d\/\d\d\d\d$/
      Date.strptime(d['date_s'], "%m/%d/%Y")
    elsif date =~ /^\d\d\/\d\d\/\d\d$/
      Date.strptime(d['date_s'], "%m/%d/%y")
    else
      nil
    end
  end
  end_dates.any? { |d| d && d > Date.today }
end

puts "Found #{pending.length} pending workshops (out of #{old_workshops.length} total)"

pending.each do |workshop|
  location_address = workshop[:data]['location_address_s']

  new_workshop = Pd::Workshop.create(
    workshop_type: workshop[:data]['type_s'],
    organizer_id: workshop[:user_id],
    location_name: workshop[:data]['location_name_s'],
    location_address: location_address,
    processed_location: Pd::Workshop.process_location(location_address),
    course: Pd::Workshop::COURSE_CSF,
    capacity: workshop[:data]['capacity_s'].to_i,
    notes: workshop[:data]['notes_s'],
    section_id: workshop[:data]['section_id_s'].to_i,
    created_at: workshop[:created_at],
    updated_at: workshop[:updated_at]
  )

  facilitator = User.find(new_workshop.organizer_id)
  new_workshop.facilitators = [facilitator]
  new_workshop.save

  puts "Created #{new_workshop.location_name}"

  workshop[:data]['dates'].each do |date|
    start_time = Time.strptime(date['start_time_s'], "%H:%M")
    end_time = Time.strptime(date['end_time_s'], "%H:%M")

    if date['date_s'] =~ /^\d\d\/\d\d\/\d\d\d\d$/
      start_date = Date.strptime(date['date_s'], "%m/%d/%Y")
    elsif date['date_s'] =~ /^\d\d\/\d\d\/\d\d$/
      start_date = Date.strptime(date['date_s'], "%m/%d/%y")
    else
      next
    end

    session = Pd::Session.create(
      workshop: new_workshop,
      start: DateTime.new(start_date.year, start_date.month, start_date.day, start_time.hour, start_time.min),
      end: DateTime.new(start_date.year, start_date.month, start_date.day, end_time.hour, end_time.min),
    )
    puts "\twith session #{session.start} - #{session.end}"
  end
end
