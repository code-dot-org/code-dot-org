# Create a storage id without an associated user id and track it using a cookie.
def create_storage_id_cookie
  storage_id = user_storage_ids_table.insert(user_id: nil)

  response.set_cookie(storage_id_cookie_name, {
    value: CGI.escape(storage_encrypt_id(storage_id)),
    domain: ".#{request.shared_cookie_domain}",
    path: '/',
    expires: Time.now + (365 * 24 * 3600)
  })

  storage_id
end

def storage_decrypt(encrypted)
  decrypter = OpenSSL::Cipher::Cipher.new 'AES-128-CBC'
  decrypter.decrypt
  decrypter.pkcs5_keyivgen(CDO.channels_api_secret, '8 octets')
  plain = decrypter.update(encrypted)
  plain << decrypter.final
end

def storage_decrypt_id(encrypted)
  _, id, _ = storage_decrypt(encrypted).split(':')
  id = id.to_i
  raise ArgumentError, "`id` must be an integer > 0" unless id > 0
  return id
end

# This method can throw the following errors:
# ArgumentError if encrypted is incorrectly formatted/padded for base64; or
# OpenSSL::Cipher::CipherError if the base64-decoded value is not properly
# encrypted or was encrypted using a different key (e.g. on localhost vs prod).
def storage_decrypt_channel_id(encrypted)
  raise ArgumentError, "`encrypted` must be a string" unless encrypted.is_a? String
  # pad to a multiple of 4 characters to make a valid base64 string.
  encrypted += '=' * ((4 - encrypted.length % 4) % 4)
  storage_id, channel_id = storage_decrypt(Base64.urlsafe_decode64(encrypted)).split(':')
  storage_id = storage_id.to_i
  raise ArgumentError, "`storage_id` must be an integer > 0" unless storage_id > 0
  channel_id = channel_id.to_i
  raise ArgumentError, "`channel_id` must be an integer > 0" unless channel_id > 0
  [storage_id, channel_id]
end

def storage_encrypt(plain)
  encrypter = OpenSSL::Cipher::Cipher.new('AES-128-CBC')
  encrypter.encrypt
  encrypter.pkcs5_keyivgen(CDO.channels_api_secret, '8 octets')
  encrypted = encrypter.update(plain.to_s)
  encrypted << encrypter.final
end

def storage_encrypt_id(id)
  id = id.to_i
  raise ArgumentError, "`id` must be an integer > 0" unless id > 0
  storage_encrypt("#{SecureRandom.random_number(65536)}:#{id}:#{SecureRandom.random_number(65536)}")
end

def storage_encrypt_channel_id(storage_id, channel_id)
  storage_id = storage_id.to_i
  raise ArgumentError, "`storage_id` must be an integer > 0" unless storage_id > 0
  channel_id = channel_id.to_i
  raise ArgumentError, "`channel_id` must be an integer > 0" unless channel_id > 0
  Base64.urlsafe_encode64(storage_encrypt("#{storage_id}:#{channel_id}")).tr('=', '')
end

def storage_id(endpoint)
  return nil if endpoint == 'shared'
  raise ArgumentError, "Unknown endpoint: `#{endpoint}`" unless endpoint == 'user'
  @user_storage_id ||= storage_id_for_user || storage_id_from_cookie || create_storage_id_cookie
end

def storage_id_cookie_name()
  name = "storage_id"
  name += "_#{rack_env}" unless rack_env?(:production)
  name
end

def storage_id_for_user()
  return nil unless request.user_id

  # Return the user's storage-id, if it exists.
  if row = user_storage_ids_table.where(user_id: request.user_id).first
    return row[:id]
  end

  # Take ownership of cookie storage, if it exists.
  if storage_id = storage_id_from_cookie
    # Delete the cookie that was tracking this storage id
    response.delete_cookie(storage_id_cookie_name)

    # Only take ownership if the storage id doesn't already have an owner - it shouldn't but
    # there is a race condition (addressed below)
    rows_updated = user_storage_ids_table.where(id: storage_id,user_id: nil).update(user_id: request.user_id)
    return storage_id if rows_updated > 0

    # We couldn't claim the storage. The most likely cause is that another request (by this
    # user) beat us to the punch so we'll re-check to see if we own it. Otherwise the storage
    # id is either invalid or it belongs to another user (both addressed below)
    return storage_id if user_storage_ids_table.where(id: storage_id,user_id: request.user_id).first
  end

  # We don't have any existing storage id we can associate with this user, so create a new one
  user_storage_ids_table.insert(user_id: request.user_id)
end

def storage_id_from_cookie()
  encrypted = CGI.unescape(request.cookies[storage_id_cookie_name].to_s)
  return nil if encrypted.empty?
  storage_id = storage_decrypt_id(encrypted)
  return nil if storage_id == 0
  storage_id
end

def user_storage_ids_table()
  @user_storage_ids_table ||= PEGASUS_DB[:user_storage_ids]
end

def owns_channel?(encrypted_channel_id)
  owner_storage_id, _ = storage_decrypt_channel_id(encrypted_channel_id)
  owner_storage_id == storage_id('user')
end
