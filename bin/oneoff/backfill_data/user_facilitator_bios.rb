#!/usr/bin/env ruby
# frozen_string_literal: true

# This script migrates facilitator bios from Pegasus markdown files to the dashboard database

require 'redcarpet'
require 'redcarpet/render_strip'
require 'ruby-progressbar'

require_relative '../../../dashboard/config/environment'

facilitator_bio_paths = Dir[pegasus_dir('sites.v3/code.org/views/workshop_affiliates/*_bio.md')]
progress_bar = ProgressBar.create(total: facilitator_bio_paths.size, format: 'Migrated[%c/%C]: |%W| %a')
markdown_to_text_converter = Redcarpet::Markdown.new(Redcarpet::Render::StripDown)

facilitator_bio_paths.each do |facilitator_bio_path|
  user_id = File.basename(facilitator_bio_path, '_bio.md').to_i
  facilitator_info = User::FacilitatorInfo.find_or_initialize_by(user_id: user_id)
  facilitator_info.bio = markdown_to_text_converter.render(File.read(facilitator_bio_path)).strip
  facilitator_info.save!
rescue StandardError => exception
  progress_bar.log "Failed to migrate facilitator bio from #{facilitator_bio_path}: #{exception.inspect}".red
ensure
  progress_bar.increment
end

progress_bar.finish
