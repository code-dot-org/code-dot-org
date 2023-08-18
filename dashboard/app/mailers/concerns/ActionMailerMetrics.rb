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

  # Set custom headers on the message so we know where it originated from.
  def set_metrics_headers
    headers[ACTION_HEADER] = action_name
    headers[CLASS_HEADER] = self.class
  end

  # Returns the ActionMailer action name which created the given message.
  def self.get_message_action(message)
    message.header[ACTION_HEADER].to_s
  end

  # Returns the ActionMailer class name which created the given message.
  def self.get_message_class(message)
    message.header[CLASS_HEADER].to_s
  end
end
