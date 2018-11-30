# Test-only NewRelic::Agent API which records logging of events and metrics
# without contacting the remote service.

class CDOImpl
  def newrelic_logging
    true
  end
end

module NewRelic
  module Agent
    def self.config
      {}
    end

    def self.metrics
      @@metrics ||= []
    end

    def self.events
      @@events ||= []
    end

    def self.record_metric(metric, value)
      @@metrics ||= []
      @@metrics.push([metric, value])
    end

    def self.record_custom_event(event, opts)
      @@events ||= []
      @@events.push([event, opts])
    end

    # return metrics whose names match the regex
    def self.get_metrics(regex)
      @@metrics ||= []
      @@metrics.select do |metric|
        regex.match metric.first
      end
    end

    # return events whose names match the regex
    def self.get_events(regex)
      @@events ||= []
      @@events.select do |event|
        regex.match event.first
      end
    end

    def self.add_custom_attributes(params)
      (@@attributes ||= {}).merge!(params)
    end

    def self.custom_attributes
      @@attributes ||= {}
    end

    def self.reset_stub
      @@attributes = {}
      @@events = []
      @@metrics = []
    end
  end
end
