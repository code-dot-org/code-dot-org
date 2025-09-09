#!/usr/bin/env ruby

# As of April 10, 2025:
# The total number of sessions with available workshop location data is ~ 20k.
# The sessions table itself only has ~ 150 more sessions, so I decided not to join
# with the workshops table to filter to just workshops with location data.

require_relative '../../dashboard/config/environment'

success_count = 0
failure_count = 0
no_update_count = 0

Pd::Session.
  includes(:workshop).
  where(session_format: :in_person).
  find_each(batch_size: 500) do |session|
    workshop = session.workshop
    next unless workshop

    # Skip sessions that already have location_name or location_address
    next if session.location_name.present? || session.location_address.present?

    session.location_name = workshop.location_name
    session.location_address = workshop.location_address

    if session.changed?
      begin
        session.save!
        success_count += 1
        puts "Updated #{success_count} sessions" if success_count % 100 == 0
      rescue => exception
        failure_count += 1
        puts "Failed to update session #{session.id}: #{exception.message}"
      end
    else
      no_update_count += 1
    end
  end

puts "#{success_count} sessions updated with workshop location"
puts "#{no_update_count} sessions did not need to update"
puts "#{failure_count} sessions failed to update"
