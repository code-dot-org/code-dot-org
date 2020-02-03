require 'cdo/poste'

module PosteAssertions
  # Actually runs [mail] through the Poste delivery logic, up to and including
  # inserting it into the poste_deliveries table. (The record is immediately
  # deleted after the assertion).
  #
  # This is an important validation step for mail sent through Poste because our implementation
  # includes some additional constraints, like a limited set of allowed senders.
  #
  # @param [Mail::Message] mail as returned by an ActionMailer::Base's mail() method
  def assert_sendable(mail)
    delivery_method = Poste2::DeliveryMethod.new
    delivery_id = delivery_method.deliver! mail
  ensure
    POSTE_DB[:poste_deliveries].where(id: delivery_id).delete if delivery_id
  end
end
