#!/usr/bin/env ruby

# In order to unqiuely identify the announcements associated
# with a Script, we are generating a UUID key. This can then
# be used to accurately look up the translation amongst a
# Script's array of announcements.

require_relative '../../../dashboard/config/environment'

def backfill_script_announcement_keys
  raise unless Rails.application.config.levelbuilder_mode

  Unit.all.each do |script|
    next unless script.announcements

    # Create UUID key for each announcement
    script.announcements.each do |announcement|
      announcement[:key] = SecureRandom.uuid unless announcement[:key]
    end
    begin
      script.save!
    rescue Exception => exception
      puts "Skipping #{script.id} - #{script.name} because of error:"
      puts exception.message
      next
    end

    # Update its script_json
    script.write_script_json
  end
end

backfill_script_announcement_keys
