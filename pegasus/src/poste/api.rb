require 'mail'
require_relative '../env'
require_relative '../database'

module Poste

  class InvalidRecipient < ArgumentError
  end

  def self.email_address?(value)
    begin
      m = Mail::Address.new(value)
      # We must check that value contains a domain and that value is an email address
      r = m.domain && m.address == value
      t = m.__send__(:tree)
      # We need to dig into treetop
      # A valid domain must have dot_atom_text elements size > 1
      # user@localhost is excluded
      # treetop must respond to domain
      # We exclude valid email values like <user@localhost.com>
      # Hence we use m.__send__(tree).domain
      r &&= (t.domain.dot_atom_text.elements.size > 1)
    rescue Exception => e
      false
    end
  end
  
  def self.ip_address?(ip)
    !ip.to_s.empty?
  end
  
  def self.recipient?(recipient)
    return email_address?(recipient[:email]) && ip_address?(recipient[:ip_address])
  end

  def self.send_message(message, recipient, params={})
    raise InvalidRecipient, "'#{recipient}' isn't a reasonable recipient." unless recipient?(recipient)

    message = Message.first(name: message)
    raise ArgumentError.new, "'#{message}' not found." if message.nil?
  
    delivery = Delivery.new(
      message: message,
      contact: ::Contact.create_or_update(recipient),
      created_ip: recipient[:ip_address],
      params: params
    )

    unless delivery.save
      errors = {}
      Delivery.properties.each do |field|
        field_errors = delivery.errors.on(field.name)
        errors[field.name] = field_errors unless field_errors.nil?
      end
      raise ArgumentError.new, errors.to_s
    end

    slog(tag: :email_queued, kind:delivery.message, to:delivery.contact.email, id:delivery.id)
    
    delivery
  end

end