module Encryption
  def self.key
    CDO.properties_encryption_key || "thisisafakekeyyyyyyyyyyyyyyyyyyyyy"
  end

  def self.encrypt_string(string)
    cipher = OpenSSL::Cipher::AES.new(128, :CBC)
    cipher.encrypt
    cipher.key = Base64.decode64(self.key)

    cipher.update(string) + cipher.final
  end

  def self.encrypt_object(clear)
    return clear if clear.blank?

    Base64.encode64(encrypt_string(Marshal.dump(clear)))
  end

  def self.decrypt_string(string)
    cipher = OpenSSL::Cipher::AES.new(128, :CBC)
    cipher.decrypt
    cipher.key = Base64.decode64(self.key)

    cipher.update(string) + cipher.final
  end

  def self.decrypt_object(encrypted)
    return encrypted if encrypted.blank?

    Marshal.load(decrypt_string(Base64.decode64(encrypted)))
  end
end
