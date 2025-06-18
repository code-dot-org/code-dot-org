#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

def main
  # As of writing, there are only about 300 Aichat levels.
  Aichat.all.each do |level|
    initial_customizations = level.properties.dig('aichat_settings', 'initialCustomizations')
    if initial_customizations && initial_customizations['selectedModelId'] == 'gpt-4o-mini'
      current_temperature = initial_customizations['temperature']
      updated_temperature = (current_temperature.to_f / 2).round(1)
      level.properties['aichat_settings']['initialCustomizations']['temperature'] = updated_temperature
      level.save!
      puts "updated level #{level.id} temperature from #{current_temperature} to #{updated_temperature}"
    end
  end
end

main
