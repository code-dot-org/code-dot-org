require "cdo/job_with_results"

class AichatSafetyJob < JobWithResults
  self.queue_adapter = :delayed_job
  queue_as :default

  @@timeout_s = 15

  def perform(prompt:)
    results = Python.run do
      pyimport "pycdo.aichat.safety", as: :safety
      safety.is_prompt_safe(prompt: prompt)
    end

    write_results(results)
  end
end
