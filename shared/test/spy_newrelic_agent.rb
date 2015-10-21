# Test-only NewRelic::Agent API which records logging of events and metrics
# without contacting the remote service.

class NewRelic
  class Agent
    def self.metrics
      @@metrics
    end
    def self.events
      @@events
    end
    def self.increment_metric(metric)
      @@metrics ||= []
      @@metrics.push(metric)
    end
    def self.record_custom_event(event, opts)
      @@events ||= []
      @@events.push([event, opts])
    end
  end
end
