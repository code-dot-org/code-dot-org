# Phase 3 payload: enqueue through ActiveJob exactly as the app does, then
# assert the worker reserved, performed, and succeeded it. work_off on an
# empty queue cannot fail, which is why a real job is enqueued.
class VerifyProbeJob < ActiveJob::Base
  def perform(value)
    raise 'unexpected payload' unless value == 42
  end
end

VerifyProbeJob.perform_later(42)
abort 'job not enqueued' unless Delayed::Job.count == 1

done_count, fail_count = Delayed::Worker.new.work_off
abort "worked=#{done_count} failed=#{fail_count}" unless done_count == 1 && fail_count == 0
puts "DJ-OK worked=#{done_count}"
