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
    def self.record_metric(metric, value)
      @@metrics ||= []
      @@metrics.push([metric, value])
    end
    def self.record_custom_event(event, opts)
      @@events ||= []
      @@events.push([event, opts])
    end
  end
end
