#!/usr/bin/env ruby
# Backfill existing TeacherFeedbacks to set script_id based on script_level_id.

require 'optparse'

$options = {actually_update: false}
OptionParser.new do |opts|
  opts.banner = "Usage: #{File.basename(__FILE__)} [options]"
  opts.on('-u', '--actually-update', 'Actually perform the update.') do
    $options[:actually_update] = true
  end
  opts.on('-h', '--help', 'Add -u to perform the update.') do
    puts opts
    exit
  end
end.parse!
puts "Called with options: #{$options}"

require_relative '../../../dashboard/config/environment'

$stdout.sync = true

def feedbacks_without_script_id
  TeacherFeedback.with_deleted.where(script_id: nil)
end

def puts_count
  puts "There are #{feedbacks_without_script_id.count} feedbacks without a script_id"
end

def update_script_ids
  puts "starting backfilling script_ids"
  feedbacks_without_script_id.find_in_batches(batch_size: 1000) do |batch|
    print '.'
    ActiveRecord::Base.transaction do
      batch.each do |teacher_feedback|
        # script_level_id is a required field in teacher_feedbacks, and
        # script_id is a required field of script_level. We might hit an error
        # if a script_level_id no longer points to a valid script_level, in which
        # case we want the script to stop so that we can investigate.
        script_id = teacher_feedback.script_level.script_id
        teacher_feedback.update!(script_id: script_id)
      rescue => e
        puts "Error updating teacher feedback id #{teacher_feedback.id}: #{e}"
      end

      raise ActiveRecord::Rollback unless $options[:actually_update]
    end
  end
  puts "finished backfilling script_ids!"
end

puts_count
update_script_ids
puts_count
