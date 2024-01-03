module ActionMailerMetrics
  extend ActiveSupport::Concern

  included do
    before_action :set_metrics_headers
  end

  # Header in an ActionMailer Message which stores the action name that created
  # the message.
  ACTION_HEADER = "X-ActionMailer-Action"

  # Header in ActionMailer Message which stores the class name of the
  # ActionMailer that created the message.
  CLASS_HEADER = "X-ActionMailer-Class"

  UNKNOWN_ACTION = 'unknown_action'.freeze
  UNKNOWN_CLASS = 'unknown_class'.freeze

  # Set custom headers on the message so we know where it originated from.
  def set_metrics_headers
    headers[ACTION_HEADER] = action_name
    headers[CLASS_HEADER] = self.class
  end

  # Returns the ActionMailer action name which created the given message.
  def self.get_message_action(message)
    message_action = message.header[ACTION_HEADER]
    message_action ? message_action.to_s : UNKNOWN_ACTION
  end

  # Returns the ActionMailer class name which created the given message.
  def self.get_message_class(message)
    message_class = message.header[CLASS_HEADER]
    message_class ? message_class.to_s : UNKNOWN_CLASS
  end
end
