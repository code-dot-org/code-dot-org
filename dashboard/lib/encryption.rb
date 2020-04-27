module Encryption
  class KeyMissingError < RuntimeError; end

  # Cipher key length in bits.
  KEY_LENGTH = 128

  def self.key
    raise KeyMissingError.new("please define CDO.properties_encryption_key") if CDO.properties_encryption_key.blank?
    CDO.properties_encryption_key
  end

  def self.encrypt_string(string)
    cipher = OpenSSL::Cipher::AES.new(KEY_LENGTH, :CBC)
    cipher.encrypt
    cipher.key = Base64.decode64(key)

    cipher.update(string) + cipher.final
  end

  def self.encrypt_string_utf8(string)
    encrypted = encrypt_string(string)
    Base64.encode64(encrypted).encode('utf-8')
  end

  def self.encrypt_object(clear)
    return clear if clear.blank?

    Base64.encode64(encrypt_string(Marshal.dump(clear)))
  end

  def self.decrypt_string(string)
    cipher = OpenSSL::Cipher::AES.new(KEY_LENGTH, :CBC)
    cipher.decrypt
    cipher.key = Base64.decode64(key)

    cipher.update(string) + cipher.final
  end

  def self.decrypt_string_utf8(string)
    decrypted = Base64.decode64(string).encode('ascii-8bit')
    decrypt_string(decrypted)
  end

  def self.decrypt_object(encrypted)
    return encrypted if encrypted.blank?

    Marshal.load(decrypt_string(Base64.decode64(encrypted)))
  end
end
