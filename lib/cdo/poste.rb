require 'base64'
require 'cdo/db'
require 'cdo/form'
require 'cdo/parse_email_address_string'
require 'digest/md5'
require_relative 'email_validator'
require 'mail'
require 'openssl'
require 'cdo/honeybadger'

module Poste
  def self.logger
    @@logger ||= $log
  end

  def self.emails_dir(*paths)
    pegasus_dir 'emails', *paths
  end

  def self.decrypt(encrypted)
    decrypter = OpenSSL::Cipher.new 'AES-128-CBC'
    decrypter.decrypt
    decrypter.pkcs5_keyivgen(CDO.poste_secret, '8 octets')
    plain = decrypter.update Base64.urlsafe_decode64(encrypted)
    plain << decrypter.final
  end

  # Attempts to decrypt an encrypted Id
  # @param encrypted [String] encrypted id
  # @return [Integer, nil] decrypted id, or nil if it could not be decrypted.
  def self.decrypt_id(encrypted)
    decrypt(encrypted).to_i
  rescue OpenSSL::Cipher::CipherError, ArgumentError => e
    CDO.log.warn "Unable to decrypt poste id: #{encrypted}. Error: #{e.message}"
    nil
  end

  def self.encrypt(plain)
    encrypter = OpenSSL::Cipher.new('AES-128-CBC')
    encrypter.encrypt
    encrypter.pkcs5_keyivgen(CDO.poste_secret, '8 octets')
    encrypted = encrypter.update(plain.to_s)
    encrypted << encrypter.final
    Base64.urlsafe_encode64(encrypted)
  end

  def self.encrypt_id(id)
    encrypt(id)
  end

  # Returns whether there is a dashboard student account associated with the
  # specified hashed_email.
  def self.dashboard_student?(hashed_email)
    dashboard_user = DASHBOARD_DB[:users].
      where(hashed_email: hashed_email).
      first
    return !dashboard_user.nil? && dashboard_user[:user_type] == 'student'
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

  def self.template_extnames
    ['.md', '.haml', '.html']
  end

  # Unsubscribes the specified hashed email.
  # @param email [string | nil] the email to record being unsubscribed.
  #   WARNING: The contact to unsubscribe is chosen using hashed_email.
  # @param hashed_email [string] the MD5 hash of the email to unsubscribe.
  # @param params [hash] A hash of parameters, including ip_address.
  def self.unsubscribe(email, hashed_email, params={})
    email = email.strip.downcase if email
    now = DateTime.now

    contacts = POSTE_DB[:contacts]
    contact = contacts.where(hashed_email: hashed_email).first
    if contact
      contacts.where(id: contact[:id]).update(
        unsubscribed_at: now,
        unsubscribed_ip: params[:ip_address],
      )
    else
      sanitized_email = dashboard_student?(hashed_email) ? '' : email
      contacts.insert(
        email: sanitized_email,
        hashed_email: hashed_email,
        created_at: now,
        created_ip: params[:ip_address],
        unsubscribed_at: now,
        unsubscribed_ip: params[:ip_address],
        updated_at: now,
        updated_ip: params[:ip_address],
      )
    end
  end

  class Template
    def initialize(path)
      @path = path
      @template_type = File.extname(path)[1..-1]
      @header, @html, @text = parse_template(IO.read(path))
    end

    def render(params={})
      if params.key?('form_id')
        form = Form2.from_row(POSTE_DB[:forms].where(id: params['form_id']).first)
        params.merge! form.data
        params.merge! form.processed_data
        params['form'] = form
      end
      bound = OpenStruct.new(params).instance_eval {binding}
      locals = params.symbolize_keys

      header = render_header(bound, locals)
      html = render_html(bound, locals)
      text = render_text(bound, locals)

      [header, html, text]
    end

    private

    def parse_template(content)
      header = nil
      html = nil
      text = nil

      if match = content.match(/^---\s*\n(?<header>.*?\n?)^(---\s*$\n?)(?<html>\s*\n.*?\n?)^(---\s*$\n?)(?<text>\s*\n.*?\n?\z)/m)
        header = match[:header].strip
        html = match[:html].strip
        text = match[:text].strip
      elsif match = content.match(/^---\s*\n(?<header>.*?\n?)^(---\s*$\n?)(?<html>\s*\n.*?\n?\z)/m)
        header = match[:header].strip
        html = match[:html].strip
      else
        html = content.strip
      end

      [header, html, text]
    end

    def render_header(bound, locals={})
      return {} unless @header.present?
      YAML.safe_load(renderer.render(inline: @header, type: :erb, locals: locals))
    end

    def render_html(bound, locals={})
      return nil unless @html.present?
      # All our emails regardless of the extension they use are parsed as ERB
      # in addition to their regular template type.
      html = renderer.render(inline: @html, type: :erb, locals: locals)
      html = renderer.render(inline: html, type: @template_type)

      # Parse the html into a DOM and then re-serialize back to html text in case we were depending on that
      # logic in the click tracking method to clean up or canonicalize the HTML.
      html = Nokogiri::HTML(html).to_html

      html
    end

    def render_text(bound, locals={})
      return nil unless @text.present?
      renderer.render(inline: @text, type: :erb, locals: locals)
    end

    def renderer
      @@renderer ||= begin
        require 'cdo/markdown/handler'
        Cdo::Markdown::Handler.register
        ActionView::Base.new
      end
    end
  end
end

class Deliverer
  def initialize(params)
    @params = params.dup
    @smtp = reset_connection
    @templates = {}
  end

  def reset_connection
    @smtp.finish if @smtp
    @smtp = smtp_connect unless rack_env?(:development)
  end

  POSTE_BASE_URL = (rack_env?(:production) ? 'https://' : 'http://') + CDO.poste_host
  def poste_url(*parts)
    File.join(POSTE_BASE_URL, *parts)
  end

  # lazily-populate this constant so we aren't trying to make database queries
  # whenever this file gets required, just once it starts to get used.
  MESSAGE_TEMPLATES = Hash.new do |h, key|
    h[key] = POSTE_DB[:poste_messages].where(id: key).first
  end

  def send(delivery)
    recipient = POSTE_DB[:contacts].where(id: delivery[:contact_id]).first
    message = MESSAGE_TEMPLATES[delivery[:message_id]]
    encrypted_id = Poste.encrypt_id(delivery[:id])
    params = JSON.parse(delivery[:params])
    unsubscribe_url = poste_url("/u/#{CGI.escape(encrypted_id)}")

    header, html, _ = load_template(message[:name]).render(
      params.merge(
        {
          recipient: OpenStruct.new(recipient),
          unsubscribe_link: unsubscribe_url,
          tracking_pixel: poste_url("/o/#{encrypted_id}"),
        }
      )
    )

    message = StringIO.new

    # Merge contact_email from the delivery for code studio students whose emails we don't store in contacts.
    to_address = parse_address(header['to'], recipient.merge({temporary_email: delivery[:contact_email]}))
    message.puts 'To: ' + format_address(to_address)

    from_address = parse_address(header['from'], {email: 'help@code.org', name: 'Code.org'})
    message.puts 'From: ' + format_address(from_address)

    # List of the email part of all destination addresses, including To, Cc, and Bcc
    # Note if any of these are omitted it won't be delivered to them even though they still appear in the headers.
    # See https://ruby-doc.org/stdlib-2.0.0/libdoc/net/smtp/rdoc/Net/SMTP.html#method-i-send_message
    # and https://stackoverflow.com/questions/2530142/ruby-netsmtp-send-email-with-bcc-recipients
    to_addresses = [to_address[:email]]
    ['Cc', 'Bcc'].each do |field|
      next unless address = parse_address(header[field.downcase])
      message.puts "#{field}: #{format_address(address)}"
      to_addresses << address[:email]
    end

    ['Reply-To', 'Sender'].each do |field|
      next unless address = parse_address(header[field.downcase])
      message.puts "#{field}: #{format_address(address)}"
    end

    subject = header['subject'].to_s.strip
    message.puts 'Subject: ' + subject unless subject.empty?

    message.puts "X-Unsubscribe-Web: #{unsubscribe_url}"
    message.puts "List-Unsubscribe: <#{unsubscribe_url}>"

    message.puts 'MIME-Version: 1.0'

    attachments = header['attachments'] || {}
    if params['attachments']
      attached_files = Poste2.load_attachments(params['attachments'])
      attachments.merge! attached_files
    end

    marker = "==_mimepart_#{SecureRandom.hex(17)}"
    message.puts "Content-Type: multipart/mixed; boundary=\"#{marker}\""

    message.puts ''
    message.puts "--#{marker}"

    message.puts 'Content-Type: text/html; charset=UTF-8'
    message.puts 'Content-Transfer-Encoding: 8bit'
    message.puts ''
    message.write html

    unless attachments.empty?
      attachments.each_pair do |filename, content|
        message.puts ''
        message.puts "--#{marker}"
        message.puts "Content-Type: image/jpeg; charset=UTF-8; filename=\"#{filename}\""
        message.puts 'Content-Transfer-Encoding: base64'
        message.puts "Content-Disposition: attachment; filename=\"#{filename}\""
        message.puts ''

        message.write content.scan(/.{1,61}/).join("\n")
      end
    end

    message.puts ''
    message.puts "--#{marker}--"

    if !rack_env?(:development)
      @smtp.send_message message.string, from_address[:email], *to_addresses
    else
      puts(message.string)
    end
  end

  def load_template(name)
    template = @templates[name]
    return template if template

    path = Poste.resolve_template(name)
    raise ArgumentError, "[Poste] '#{name}' template wasn't found." unless path

    @templates[name] = Poste::Template.new path
  end

  private

  def format_address(address)
    email = address[:email].to_s.strip
    raise ArgumentError, 'No :email' if email.empty?

    name = address[:name].to_s.strip
    return email if name.empty?

    name = "\"#{name.tr('"', '\"').tr("'", "\'")}\"" if name =~ /[;,\"\'\(\)]/
    "#{name} <#{email}>".strip
  end

  def parse_address(address, defaults={})
    address = address.to_s.strip
    return parse_email_address_string(address) unless address.empty?

    # Student accounts don't have a stored email in contacts,
    # so we use the temporary email here when email doesn't exist.
    email = defaults[:email].to_s.strip
    email = defaults[:temporary_email] if email.blank?
    return nil if email.blank?

    {email: email}.tap do |name_and_email|
      name = defaults[:name].to_s.strip
      name_and_email[:name] = name unless name.empty?
    end
  end

  # Attempt SMTP connections up to 5 times, retrying on the following error types AND message match.
  CONNECTION_ATTEMPTS = 5
  RETRYABLE_ERROR_TYPES = [
    Net::SMTPServerBusy,
    Net::SMTPAuthenticationError,
    EOFError
  ].freeze
  RETRYABLE_ERROR_MESSAGES = [
    'Too many connections, try again later',
    'Temporary authentication failure',
    'end of file reached'
  ].map(&:freeze).freeze
  RETRYABLE_ERROR_MESSAGE_MATCH = Regexp.new RETRYABLE_ERROR_MESSAGES.map {|m| "(#{m})"}.join('|')
  def smtp_connect
    Retryable.retryable(
      tries: CONNECTION_ATTEMPTS,
      on: RETRYABLE_ERROR_TYPES,
      matching: RETRYABLE_ERROR_MESSAGE_MATCH
    ) do
      Net::SMTP.new(@params[:address], @params[:port]).tap do |smtp|
        smtp.enable_starttls if @params[:enable_starttls_auto]
        smtp.start(@params[:domain], @params[:user_name], @params[:password], @params[:authentication])
      end
    end
  end
end

module Poste2
  @@url_cache = {}
  @@message_id_cache = {}

  # Returns true if address is a valid email address.
  def self.email_address?(address)
    Cdo::EmailValidator.email_address?(address)
  end

  def self.find_or_create_url(href)
    hash = Digest::MD5.hexdigest(href)

    url_id = @@url_cache[href]
    return url_id if url_id

    url_id =
      if url = POSTE_DB[:poste_urls].where(hash: hash, url: href).first
        url[:id]
      else
        POSTE_DB[:poste_urls].insert(hash: hash, url: href)
      end

    @@url_cache[href] = url_id
  end

  # TODO(asher): Refactor create_recipient and ensure_recipient to share common
  # code.
  def self.create_recipient(email, params={})
    email = email.to_s.strip.downcase
    hashed_email = Digest::MD5.hexdigest(email)
    raise ArgumentError, "Invalid email address (#{email})" unless email_address?(email)

    name = params[:name].strip if params[:name]
    ip_address = params[:ip_address]
    now = DateTime.now

    contact = POSTE_DB[:contacts].where(hashed_email: hashed_email).first
    if contact
      if contact[:name] != name && !name.nil_or_empty?
        POSTE_DB[:contacts].where(id: contact[:id]).update(
          name: name,
          updated_at: now,
          updated_ip: ip_address,
        )
      end
    else
      sanitized_email = Poste.dashboard_student?(hashed_email) ? '' : email
      id = POSTE_DB[:contacts].insert(
        {}.tap do |new_contact|
          new_contact[:email] = sanitized_email
          new_contact[:hashed_email] = hashed_email
          new_contact[:name] = name if name
          new_contact[:created_at] = now
          new_contact[:created_ip] = ip_address
          new_contact[:updated_at] = now
          new_contact[:updated_ip] = ip_address
        end
      )
      contact = {id: id}
    end

    {id: contact[:id], email: email, name: name, ip_address: ip_address}
  end

  DEFAULT_IP_ADDRESS = '127.0.0.1'.freeze
  def self.ensure_recipient(email, params={})
    email = email.to_s.strip.downcase
    hashed_email = Digest::MD5.hexdigest(email)
    raise ArgumentError, 'Invalid email address' unless email_address?(email)

    name = params[:name].strip if params[:name]
    ip_address = params[:ip_address] || DEFAULT_IP_ADDRESS
    now = DateTime.now

    contact = POSTE_DB[:contacts].where(hashed_email: hashed_email).first
    unless contact
      sanitized_email = Poste.dashboard_student?(hashed_email) ? '' : email
      id = POSTE_DB[:contacts].insert(
        {}.tap do |new_contact|
          new_contact[:email] = sanitized_email
          new_contact[:hashed_email] = hashed_email
          new_contact[:name] = name if name
          new_contact[:created_at] = now
          new_contact[:created_ip] = ip_address
          new_contact[:updated_at] = now
          new_contact[:updated_ip] = ip_address
        end
      )
      contact = {id: id}
    end

    {id: contact[:id], email: email, name: name, ip_address: ip_address}
  end

  def self.attachment_dir
    # Get directory from settings (locals.yml / globals.yml)
    # If none specified, use ./poste_attachments
    path = CDO.poste_attachment_dir || File.join(Dir.pwd, 'poste_attachments')
    Dir.mkdir(path) unless Dir.exist?(path)
    path
  end

  # Takes a hash of name=>content, saves each to a file, and returns a
  # hash of name=>saved_filename
  def self.save_attachments(attachments)
    # Prevent saving attachments on a non-daemon server,
    # to avoid missing file errors in deliver_poste_messages which runs on the daemon
    raise "Emails with attachments can only be generated on a daemon server" unless CDO.daemon

    timestamp = DateTime.now.strftime('%Y%m%d_%H%M_%S%L')
    {}.tap do |saved|
      attachments.each do |name, content|
        filename = File.expand_path "#{attachment_dir}/#{timestamp}-#{name}"
        File.open(filename, 'w+b') {|f| f.write content}
        saved[name] = filename
      end
    end
  end

  # Takes a hash of name=>saved_filename, loads each file, and returns a
  # hash of name=>content
  def self.load_attachments(attachments)
    {}.tap do |results|
      attachments.each do |name, filename|
        content = File.binread(filename)
        results[name] = Base64.encode64(content)
      end
    end
  end

  def self.send_message(message_name, recipient, params = {})
    raise ArgumentError, 'No recipient' unless recipient && recipient[:id] && recipient[:email] && recipient[:ip_address]

    if params[:attachments]
      params[:attachments] = save_attachments(params[:attachments])
    end

    message_name = message_name.to_s.strip
    unless message_id = @@message_id_cache[message_name]
      message = POSTE_DB[:poste_messages].where(name: message_name).first
      message ||= POSTE_DB[:poste_messages].where(name: message_name).first if Poste.resolve_template(message_name)
      raise ArgumentError, "No #{message_name} message found." unless message
      message_id = @@message_id_cache[message_name] = message[:id]
    end

    POSTE_DB[:poste_deliveries].insert(
      {
        created_at: DateTime.now,
        created_ip: recipient[:ip_address],
        contact_id: recipient[:id],
        contact_email: recipient[:email],
        hashed_email: Digest::MD5.hexdigest(recipient[:email]),
        message_id: message_id,
        params: (params).to_json,
      }
    )
  end

  class DeliveryMethod
    ALLOWED_SENDERS = Set.new %w[
      pd@code.org
      noreply@code.org
      teacher@code.org
      hadi_partovi@code.org
      survey@code.org
      facilitators@code.org
      volunteers@code.org
      partner@code.org
    ]

    def initialize(settings = nil)
    end

    def deliver!(mail)
      attachments = nil

      # Support multipart/mixed emails consisting of attachment(s) and a main part
      if mail.multipart?
        attachment_parts, body_parts = mail.parts.partition(&:attachment?)
        raise 'Multipart messages are only supported with attachments and a single body' unless body_parts.length == 1
        body_part = body_parts.first

        attachments = {}
        attachment_parts.each do |attachment|
          attachments[attachment.filename] = attachment.body.decoded
        end
      else
        body_part = mail
      end

      content_type = body_part.content_type
      raise ArgumentError, "Unsupported message type: #{content_type}" unless content_type =~ /^text\/html;/ && content_type =~ /charset=UTF-8/
      body = body_part.body.to_s

      sender_email = mail.from.first
      raise ArgumentError, "Unsupported sender: #{sender_email}" unless ALLOWED_SENDERS.include?(sender_email)
      raise ArgumentError, 'Recipient (to field) is required.' unless mail[:to]

      sender = mail[:from].formatted.first
      to_address = mail[:to].addresses.first
      to_name = mail[:to].display_names.first
      mail_params = {
        body: body,
        subject: mail.subject.to_s,
        from: sender
      }

      mail_params[:cc] = mail[:cc].formatted.first if mail[:cc]
      mail_params[:bcc] = mail[:bcc].formatted.first if mail[:bcc]
      mail_params[:reply_to] = mail[:reply_to].formatted.first if mail[:reply_to]
      mail_params[:attachments] = attachments if attachments
      recipient = Poste2.ensure_recipient(to_address, name: to_name, ip_address: '127.0.0.1')
      Poste2.send_message('dashboard', recipient, mail_params)
    end
  end
end
