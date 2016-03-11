require 'cdo/db'
require_relative 'email_validator'
require 'mail'
require 'openssl'
require 'base64'

module Poste

  def self.logger()
    @@logger ||= $log
  end

  def self.emails_dir(*paths)
    pegasus_dir 'emails', *paths
  end

  def self.decrypt(encrypted)
    decrypter = OpenSSL::Cipher::Cipher.new 'AES-128-CBC'
    decrypter.decrypt
    decrypter.pkcs5_keyivgen(CDO.poste_secret, '8 octets')
    plain = decrypter.update Base64::urlsafe_decode64(encrypted)
    plain << decrypter.final
  end

  def self.decrypt_id(encrypted)
    return decrypt(encrypted).to_i
  end

  def self.encrypt(plain)
    encrypter = OpenSSL::Cipher::Cipher.new('AES-128-CBC')
    encrypter.encrypt
    encrypter.pkcs5_keyivgen(CDO.poste_secret, '8 octets')
    encrypted = encrypter.update(plain.to_s)
    encrypted << encrypter.final
    Base64::urlsafe_encode64(encrypted)
  end

  def self.encrypt_id(id)
    encrypt(id)
  end

  def self.resolve_template(name)
    template_extnames.each do |extname|
      path = emails_dir "#{name}#{extname}"
      next unless File.file? path

      messages = POSTE_DB[:poste_messages]
      unless messages.where(name: name).first
        id = messages.insert(name: name)
        raise StandardError, "Couldn't create poste_message row for '#{name}'" unless id > 0
        logger.info "Registered new message template '#{name}' as #{id}" if logger
      end

      return path
    end
    nil
  end

  def self.template_extnames()
    ['.md','.haml','.html']
  end

  def self.unsubscribed?(email)
    !!POSTE_DB[:contacts].where('email = ? AND unsubscribed_on IS NOT NULL', email.to_s.strip.downcase).first
  end

  def self.unsubscribe(email, params={})
    email = email.to_s.strip.downcase
    now = DateTime.now

    contacts = POSTE_DB[:contacts]
    contact = contacts.where(email: email).first
    if contact
      contacts.where(id: contact[:id]).update(
        unsubscribed_at: now,
        unsubscribed_on: now.to_date,
        unsubscribed_ip: params[:ip_address],
      )
    else
      contacts.insert(
        email: email,
        created_at: now,
        created_on: now.to_date,
        created_ip: params[:ip_address],
        unsubscribed_at: now,
        unsubscribed_on: now.to_date,
        unsubscribed_ip: params[:ip_address],
        updated_at: now,
        updated_on: now.to_date,
        updated_ip: params[:ip_address],
      )
    end
  end

end

module Poste2

  @@url_cache = {}
  @@message_id_cache = {}

  # Returns true if address is a valid email address.
  def self.email_address?(address)
    EmailValidator::email_address?(address)
  end

  def self.find_or_create_url(href)
    hash = Digest::MD5.hexdigest(href)

    url_id = @@url_cache[href]
    return url_id if url_id

    if url = POSTE_DB[:poste_urls].where(hash: hash, url: href).first
      url_id = url[:id]
    else
      url_id = POSTE_DB[:poste_urls].insert(hash: hash, url: href)
    end

    @@url_cache[href] = url_id
  end

  def self.create_recipient(address, params={})
    address = address.to_s.strip.downcase
    raise ArgumentError, "Invalid email address (#{address})" unless email_address?(address)

    name = params[:name].strip if params[:name]
    ip_address = params[:ip_address]
    now = DateTime.now

    contacts = POSTE_DB[:contacts]

    contact = contacts.where(email: address).first
    if contact
      if contact[:name] != name && !name.nil_or_empty?
        contacts.where(id: contact[:id]).update(
          name: name,
          updated_at: now,
          updated_on: now,
          updated_ip: ip_address,
        )
      end
    else
      id = contacts.insert({}.tap do |contact|
        contact[:email] = address
        contact[:name] = name if name
        contact[:created_at] = contact[:created_on] = now
        contact[:created_ip] = ip_address
        contact[:updated_at] = contact[:updated_on] = now
        contact[:updated_ip] = ip_address
      end)
      contact = {id: id}
    end

    {id: contact[:id], email: address, name: name, ip_address: ip_address}
  end

  def self.ensure_recipient(address, params={})
    address = address.to_s.strip.downcase
    raise ArgumentError, 'Invalid email address' unless email_address?(address)

    name = params[:name].strip if params[:name]
    ip_address = params[:ip_address]
    now = DateTime.now

    contacts = POSTE_DB[:contacts]

    contact = contacts.where(email: address).first
    unless contact
      id = contacts.insert({}.tap do |contact|
        contact[:email] = address
        contact[:name] = name if name
        contact[:created_at] = contact[:created_on] = now
        contact[:created_ip] = ip_address
        contact[:updated_at] = contact[:updated_on] = now
        contact[:updated_ip] = ip_address
      end)
      contact = {id: id}
    end

    {id: contact[:id], email: address, name: name, ip_address: ip_address}
  end

  def self.send_message(message_name, recipient, params)
    raise ArgumentError, 'No recipient' unless recipient && recipient[:id] && recipient[:email] && recipient[:ip_address]

    message_name = message_name.to_s.strip
    unless message_id = @@message_id_cache[message_name]
      message = POSTE_DB[:poste_messages].where(name: message_name).first
      message ||= POSTE_DB[:poste_messages].where(name: message_name).first if Poste.resolve_template(message_name)
      raise ArgumentError, "No #{message_name} message found." unless message
      message_id = @@message_id_cache[message_name] = message[:id]
    end

    POSTE_DB[:poste_deliveries].insert({
      created_at: DateTime.now,
      created_ip: recipient[:ip_address],
      contact_id: recipient[:id],
      contact_email: recipient[:email],
      message_id: message_id,
      params: (params||{}).to_json,
    })
  end

  class DeliveryMethod

    ALLOWED_SENDERS = Set.new ['pd@code.org', 'noreply@code.org']
    def initialize(settings)
    end

    def deliver!(mail)
      content_type = mail.header['Content-Type'].to_s
      raise ArgumentError, "Unsupported message type: #{content_type}" unless content_type =~ /^text\/html;/ && content_type =~ /charset=UTF-8/
      sender = mail.from.first
      raise ArgumentError, "Unsupported sender: #{sender}" unless ALLOWED_SENDERS.include?(sender)

      subject = mail.subject.to_s
      body = mail.body.to_s

      recipient = Poste2::ensure_recipient(mail.to.first, ip_address: '127.0.0.1')
      Poste2::send_message('dashboard', recipient, body: body, subject: subject, from: sender)
    end

  end

end
