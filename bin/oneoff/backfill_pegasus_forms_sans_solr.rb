#!/usr/bin/env ruby
require_relative '../../lib/cdo/only_one'
abort 'Script already running' unless only_one_running?(__FILE__)

require File.expand_path('../../../pegasus/src/env', __FILE__)
require 'cdo/chat_client'
require 'retryable'
require src_dir 'forms'
require src_dir 'abort_form_error'

BATCH_SIZE = 15000

# load helpers
load pegasus_dir('helpers.rb')

# ClassSubmission forms submitted via Pegasus up until the Solr deprecation have had additional
# relevant metadata written to Solr by process_forms.  After the Solr deprecation,
# new form submissions will have that additional metadata written to MySQL by
# process_forms, going into the existing processed_data column.  This function
# processes the earlier form submissions, generating that additional metadata
# and storing it in the processed_data column.  It only works on forms that
# have already been processed, and it also skips the update if the database
# already contains the additional metadata, which means that it's idempotent.

def process_existing_batch_of_forms
  update_count = 0
  already_written_count = 0
  already_has_key_count = 0
  error_count = 0

  DB[:forms].where(kind: "ClassSubmission").limit(BATCH_SIZE).each do |form|
    kind = Object.const_get(form[:kind])
    data = JSON.load(form[:data])
    processed_data = JSON.load(form[:processed_data]) || {}

    begin
      if kind.respond_to?(:additional_data)
        extra = kind.additional_data(data)

        if (extra.to_a - processed_data.to_a).empty?
          $stderr.puts "Form's processed_data already contains what we meant to write."
          already_written_count += 1
        elsif extra.keys.any? {|key| processed_data.key?(key)}
          $stderr.puts "Form's processed_data already contains one key we meant to write."
          already_has_key_count += 1
        else
          processed_data.merge! extra

          $stderr.puts "Writing #{processed_data.to_json}"
          DB[:forms].where(id: form[:id]).update(processed_data: processed_data.to_json)
          update_count += 1
        end
      end
    rescue AbortFormError => e
      $stderr.puts "Unable to process form #{form[:id]} because #{e.message}."
      error_count += 1
      next
    rescue Exception => e
      $stderr.puts "Unable to process form #{form[:id]} because #{e.message}."
      raise e
    end
  end

  $stderr.puts "Wrote #{update_count} entries"
  $stderr.puts "Skipped #{already_written_count} already written entries"
  $stderr.puts "Skipped #{already_has_key_count} entries already having at least one key"
  $stderr.puts "Skipped #{error_count} entries with errors"

  update_count
end

def main
  process_existing_batch_of_forms
end

main
