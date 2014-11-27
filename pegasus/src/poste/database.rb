require 'openssl'
require 'base64'

module Poste

  def self.db()
    PEGASUS_DB
  end

  def self.logger()
    @@logger ||= $log
  end

  def self.emails_dir(*paths)
    pegasus_dir 'emails', *paths
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
  
  def self.resolve_template(name)
    template_extnames.each do |extname|
      path = emails_dir "#{name}#{extname}"
      next unless File.file? path

      messages = db[:poste_messages]
      unless messages.where(name:name).first
        id = messages.insert(name:name)
        raise StandardError, "Couldn't create poste_message row for '#{name}'" unless id > 0
        logger.info "Registered new message template '#{name}' as #{id}"
      end

      return path
    end
    nil
  end

  def self.template_extnames()
    ['.md','.haml','.html']
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

end
