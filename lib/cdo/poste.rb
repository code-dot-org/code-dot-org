require 'cdo/db'
require 'mail'

module Poste2

  @@url_cache = {}
  @@message_id_cache = {}

  def self.email_address?(address)
    begin
      email = Mail::Address.new(address)
      return false unless email.address == address
      return false unless email.domain # Must have a domain
      # A valid domain must have dot_atom_text elements size > 1; user@localhost is excluded
      # treetop must respond to domain; we exclude valid email values like <user@localhost.com>
      return false unless (email.__send__(:tree).domain.dot_atom_text.elements.size > 1)
      true
    rescue
      false
    end
  end

  def self.find_or_create_url(href)
    hash = Digest::MD5.hexdigest(href)

    url_id = @@url_cache[href]
    return url_id if url_id

    unless url = DB[:poste_urls].where(hash:hash, url:href).first
      DB[:poste_urls].insert(hash:hash, url:href)
      url = DB[:poste_urls].where(hash:hash, url:href).first
    end

    @@url_cache[href] = url[:id]
  end

  def self.create_recipient(address, params={})
    address = address.to_s.strip.downcase
    raise ArgumentError, 'Invalid email address' unless email_address?(address)

    name = params[:name].strip if params[:name]
    ip_address = params[:ip_address]
    now = DateTime.now

    contacts = PEGASUS_DB[:contacts]

    contact = contacts.where(email:address).first
    if contact
      if contact[:name] != name && !name.nil_or_empty?
        contacts.where(id:contact[:id]).update(
          name:name,
          updated_at:now,
          updated_on:now,
          updated_ip:ip_address,
        )
      end
    else
      contacts.insert({}.tap do |contact|
        contact[:email] = address
        contact[:name] = name if name
        contact[:created_at] = contact[:created_on] = now
        contact[:created_ip] = ip_address
        contact[:updated_at] = contact[:updated_on] = now
        contact[:updated_ip] = ip_address
      end)
      contact = contacts.where(email:address).first
    end

    {id:contact[:id], email:address, name:name, ip_address:ip_address}
  end

  def self.ensure_recipient(address, params={})
    address = address.to_s.strip.downcase
    raise ArgumentError, 'Invalid email address' unless email_address?(address)

    name = params[:name].strip if params[:name]
    ip_address = params[:ip_address]
    now = DateTime.now

    contacts = PEGASUS_DB[:contacts]

    contact = contacts.where(email:address).first
    unless contact
      puts "create"
      contacts.insert({}.tap do |contact|
        contact[:email] = address
        contact[:name] = name if name
        contact[:created_at] = contact[:created_on] = now
        contact[:created_ip] = ip_address
        contact[:updated_at] = contact[:updated_on] = now
        contact[:updated_ip] = ip_address
      end)
      contact = contacts.where(email:address).first
    end

    {id:contact[:id], email:address, name:name, ip_address:ip_address}
  end

  def self.send_message(message_name, recipient, params)
    raise ArgumentError, 'No recipient' unless recipient && recipient[:id] && recipient[:email] && recipient[:ip_address]

    message_name = message_name.to_s.strip
    message_id = @@message_id_cache[message_name]
    unless message_id
      message = DB[:poste_messages].where(name:message_name.to_s.strip).first
      raise ArgumentError, "No #{message_name} message found." unless message
      message_id = @@message_id_cache[message_name] = message[:id]
    end

    DB[:poste_deliveries].insert({
      created_at:DateTime.now,
      created_ip:recipient[:ip_address],
      contact_id:recipient[:id],
      contact_email:recipient[:email],
      message_id:message_id,
      params:(params||{}).to_json,
    })
  end

end
