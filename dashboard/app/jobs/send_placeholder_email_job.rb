class SendPlaceholderEmailJob < ApplicationJob
  queue_as :default

  self.queue_adapter = :delayed_job

  def perform(user)
    PlaceholderMailer.placeholder_email(user).deliver_now
  end
end
