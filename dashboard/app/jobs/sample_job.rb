class SampleJob < ApplicationJob
  queue_as :default

  def perform(*message)
    puts "Hello, #{message}"
  end
end
