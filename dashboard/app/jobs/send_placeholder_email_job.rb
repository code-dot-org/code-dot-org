class SendPlaceholderEmailJob < ApplicationJob
  queue_as :default

  def perform(user)
    PlaceholderMailer.placeholder_email(user).deliver_now
  end
end
