# This is a sample job handy for exercising the queue locally from
# dashboard-console, enqueue via `SampleJob.perform_later('world')`.
# By default you'll be using the 'async' adapter, which will run the job
# immediately If you want to test the job with the 'delayed_job' adapter, you
# can do so by editing "dashboard/config/environments/development.rb". See
# comments near `config.active_job.queue_adapter` for more detail.

class SampleJob < ApplicationJob
  queue_as :default

  def perform(*message)
    puts "Hello, #{message}"
    sleep(rand(1..5))
    puts "Goodbye, #{message}"
  end

  before_perform do |job|
    puts "Before perform in #{job.class.name}"
  end

  after_perform do |job|
    puts "After perform in #{job.class.name}"
  end
end
