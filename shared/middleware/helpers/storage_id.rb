# Create a storage id without an associated user id and track it using a cookie.
def create_storage_id_cookie
  storage_id = user_storage_ids_table.insert(user_id:nil)

  # TODO: Encrypt the storage id in the cookie to protect it from being sequential/predicable
  response.set_cookie(storage_id_cookie_name, {
    value:CGI.escape(storage_id.to_s),
    domain:".#{request.site}",
    path:'/v2/apps',
    expires:Time.now + (365 * 24 * 3600)
  })

  storage_id
end

def storage_id(endpoint)
  return nil if ['properties', 'tables'].include?(endpoint)
  raise ArgumentError, "Unknown endpoint: `#{endpoint}`" unless ['user-properties', 'user-tables'].include?(endpoint)
  @user_storage_id ||= storage_id_for_user || storage_id_from_cookie || create_storage_id_cookie
end

def storage_id_cookie_name()
  name = "storage"
  name += "_#{rack_env}" unless rack_env?(:production)
  name
end

def storage_id_for_user()
  return nil unless request.user_id
  
  # Return the user's storage-id, if it exists.
  if row = user_storage_ids_table.where(user_id:request.user_id).first
    return row[:id] 
  end
  
  # Take ownership of cookie storage, if it exists.
  if storage_id = storage_id_from_cookie
    # Delete the cookie that was tracking this storage id
    response.delete_cookie(storage_id_cookie_name)
    
    # Only take ownership if the storage id doesn't already have an owner - it shouldn't but
    # there is a race condition (addressed below)
    rows_updated = user_storage_ids_table.where(id:storage_id,user_id:nil).update(user_id:request.user_id)
    return storage_id if rows_updated > 0
  
    # We couldn't claim the storage. The most likely cause is that another request (by this
    # user) beat us to the punch so we'll re-check to see if we own it. Otherwise the storage
    # id is either invalid or it belongs to another user (both addressed below)
    return storage_id if user_storage_ids_table.where(id:storage_id,user_id:request.user_id).first
  end

  # We don't have any existing storage id we can associate with this user, so create a new one
  user_storage_ids_table.insert(user_id:request.user_id)
end

def storage_id_from_cookie()
  # TODO: Decrypt an encrypted cookie to get the storage id (it's currently plaintext)
  storage_id = CGI.unescape(request.cookies[storage_id_cookie_name].to_s).to_i
  return nil if storage_id == 0
  storage_id
end

def user_storage_ids_table()
  @user_storage_ids_table ||= PEGASUS_DB[:user_storage_ids]
end
