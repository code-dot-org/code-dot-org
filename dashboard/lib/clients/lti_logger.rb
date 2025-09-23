class LtiLogger
  NAMESPACE = 'LTI'.freeze

  def self.log_event(event, attributes = {})
    log_payload = {event: event, namespace: NAMESPACE}.merge(attributes)
    CDO.log.info log_payload.to_json
  end
end
