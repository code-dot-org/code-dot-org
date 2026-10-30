#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

Pd::Session.includes(:workshop).where(session_format: nil).where(deleted_at: nil).find_each(batch_size: 500) do |session|
  workshop = session.workshop
  next unless workshop

  session.session_format = workshop.virtual ? 'virtual' : 'in_person'
  session.save!
end
