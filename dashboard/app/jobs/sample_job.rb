# This is a sample job handy for exercising the queue locally from
# dashboard-console, enqueue via `SampleJob.perform_later('world')`.
# By default you'll be using the 'async' adapter, which will run the job
# immediately If you want to test the job with the 'delayed_job' adapter, you
# can do so by editing "locals.yml". See comments in locals.yml.default
# near `active_job_queue_adapter` for more detail.

class SampleJob < ApplicationJob
  # Event Callbacks
  before_enqueue do |job|
    puts "In #{job.class.name} - before_enqueue"
  end

  around_enqueue do |job, block|
    puts "In #{job.class.name} - around_enqueue (before)"
    block.call
    puts "In #{job.class.name} - around_enqueue (after)"
  end

  after_enqueue do |job|
    puts "In #{job.class.name} - after_enqueue"
  end

  before_perform do |job|
    puts "In #{job.class.name} - before_perform"
  end

  around_perform do |job, block|
    puts "In #{job.class.name} - around_perform (before)"
    block.call
    puts "In #{job.class.name} - around_perform (after)"
  end

  after_perform do |job|
    puts "In #{job.class.name} - after_perform"
  end

  # Primary Job Method
  def perform(*message)
    puts "In #{self.class.name} - perform"
    sleep(rand(1..5))
    puts "Hello, #{message}"
  end
end
