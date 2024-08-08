module AichatSafetyHelper
  def self.get_llmguard_response(message)
    job = AichatSafetyJob.perform_later(prompt: message)
    job.wait_for_results #=> { "safe": true, ... }
  end
end
