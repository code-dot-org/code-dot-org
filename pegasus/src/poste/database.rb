require 'openssl'
require 'base64'

# Answer before deploy DateTime or Date or Both needed?
class Contact
  include DataMapper::Resource

  property :id                , Serial
  property :email             , String, length: 254, format: :email_address, key: true
  property :name              , String, length: 255

  has n, :deliveries, model: 'Poste::Delivery'
  has n, :opens, model: 'Poste::Open', through: :deliveries, via: :opens

  property  :created_at       , DateTime # Automated by dm-timestampes
  property  :created_on       , Date # Automated by dm-timestampes
  property  :created_ip       , IPAddress, required: true

  property  :unsubscribed_at  , DateTime # If these are set the contact has unsubscribed.
  property  :unsubscribed_on  , Date, index: true
  property  :unsubscribed_ip  , IPAddress

  property  :updated_at       , DateTime # Automated by dm-timestampes
  property  :updated_on       , Date # Automated by dm-timestampes
  property  :updated_ip       , IPAddress, required: true

  def email=(e)
    super(Contact.normalize_email(e))
  end

  def name=(n)
    super(Contact.normalize_name(n))
  end

  def self.unsubscribed?(email)
    !!DB[:contacts].where('email = ? AND unsubscribed_on IS NOT NULL', email.to_s.strip.downcase).first
  end

  def self.unsubscribe(email, params={})
    email = email.to_s.strip.downcase
    now = DateTime.now

    contacts = DB[:contacts]
    contact = contacts.where(email:email).first
    if contact
      contacts.where(id:contact[:id]).update(
        unsubscribed_at:now,
        unsubscribed_on:now.to_date,
        unsubscribed_ip:params[:ip_address],
      )
    else
      contacts.insert(
        email:email,
        created_at:now,
        created_on:now.to_date,
        created_ip:params[:ip_address],
        unsubscribed_at:now,
        unsubscribed_on:now.to_date,
        unsubscribed_ip:params[:ip_address],
        updated_at:now,
        updated_on:now.to_date,
        updated_ip:params[:ip_address],
      )
    end
  end

  def self.create_or_update(params)
    email = normalize_email(params[:email])
    name = normalize_name(params[:name])
    ip_address = params[:ip_address]

    who = first(email: email)
    unless who.nil?
      who[:name] = name unless name.empty?
      who[:updated_ip] = ip_address
    else
      who = new({
        email: email,
        name: name,
        created_ip: ip_address,
        updated_ip: ip_address,
      })
    end

    if params[:import_mode]
      unless (created_at = params[:created_at]).nil?
        who.created_on = (who.created_at = created_at).to_date if(who.created_at.nil? || (created_at < who.created_at))
      end
      unless (updated_at = params[:updated_at] || params[:created_at]).nil?
        who.updated_on = (who.updated_at = updated_at).to_date if(who.updated_at.nil? || (updated_at > who.updated_at))
      end
    end

    raise ValidationError.new(who) unless who.save

    who
  end

  private

  def self.normalize_email(e)
    e.to_s.strip.downcase
  end

  def self.normalize_name(n)
    n.to_s.strip
  end
end

module Poste

  # The "Delivery" object holds the state for a single unit of delivery, e.g. a message paired
  # with a recipient and whatever state needed to move the delivery through the system.
  class Delivery
    include DataMapper::Resource
    property :id            , Serial
    belongs_to :contact     , model: '::Contact'
    belongs_to :message     #,
    property :params        , Json, required: true
    has n, :opens           #,
    property :created_at    , DateTime # Automated by dm-timestampes
    property :created_ip    , IPAddress, required: true
    property :sent_at       , DateTime

    def self.get_by_encrypted_id(encrypted_id)
      get(decrypt_id(encrypted_id))
    end

    def self.decrypt_id(encrypted)
      decrypter = OpenSSL::Cipher::Cipher.new 'AES-128-CBC'
      decrypter.decrypt
      decrypter.pkcs5_keyivgen(CDO.poste_secret, '8 octets')
      plain = decrypter.update Base64::urlsafe_decode64(encrypted)
      plain << decrypter.final
      return(plain.to_i)
    end

    def self.encrypt_id(id)
      encrypter = OpenSSL::Cipher::Cipher.new('AES-128-CBC')
      encrypter.encrypt
      encrypter.pkcs5_keyivgen(CDO.poste_secret, '8 octets')
      encrypted = encrypter.update(id.to_s)
      encrypted << encrypter.final
      Base64::urlsafe_encode64(encrypted)
    end

    def encrypted_id
      @encrypted_id ||= Delivery.encrypt_id(id)
    end

    def unsubscribe_link()
      "http://#{CDO.poste_host}/u/#{encrypted_id}"
    end

    def tracking_pixel()
      "http://#{CDO.poste_host}/o/#{encrypted_id}"
    end

  end

  # An "Open" record is created each time a delivery's hidden (1x1 transparent) tracking pixel
  # is requested.
  class Open
    include DataMapper::Resource
    property :id            , Serial
    belongs_to :delivery    #,
    has 1, :contact         , through: :delivery, via: :contact, model: '::Contact'
    has 1, :message         , through: :delivery, via: :message
    property :created_at    , DateTime # Automated by dm-timestampes
    property :created_ip    , IPAddress, required: true
  end

  # A "Message"
  class Message
    include DataMapper::Resource
    property :id            , Serial
    property :name          , String, unique_index: true, required: true
    has n, :deliveries      #,
    has n, :contacts        , through: :deliveries, via: :contact, model: '::Contact'
    has n, :opens           , through: :deliveries, via: :opens

    def self.template_dir(*paths)
      pegasus_dir('emails',*paths)
    end

    def self.template_extnames()
      ['.md','.haml','.html']
    end

    def self.import_templates()
      $log.info "Looking for message templates in '#{template_dir}'"
      Dir.foreach(template_dir) do |filename|
        extname = File.extname(filename)
        next unless template_extnames.include?(extname)

        basename = File.basename(filename, extname)
        unless Message.first(name: basename)
          $log.info "Detected new message template '#{basename}'"
          Message.create(name: basename)
        end
      end
    end

  end

end
