require 'cdo/shared_cache'

# Persist user attributes into the session and/or a shared cache during a multi-step
# registration process.
#
# This concern assumes it will be included on User.
module PartialRegistration
  extend ActiveSupport::Concern

  USER_ATTRIBUTES_SESSION_KEY = 'devise.user_attributes'

  # A common error during registration, especially when OAuth is involved, is a
  # Cookie Overflow.  This module stores attributes for a partially-created user
  # in the _learn_session cookie, which cannot exceed 4KB.  In fact, it we seem
  # to encounter issues when the cookie is more than 2KB, since Devise and other
  # parts of our application may also be using the session.
  # To work around this, we keep known large values out of the session and
  # instead store them in the shared application cache.
  ATTRIBUTES_TO_KEEP_IN_CACHE = %w(
    school
    full_address
  )
  # also these large values from the user serialized properties blob
  PROPERTIES_TO_KEEP_IN_CACHE = %w(
    oauth_token
    oauth_refresh_token
  )
  # We also drop some user model attributes that we know we don't need to preserve
  # if we haven't created a user yet.
  ATTRIBUTES_TO_DROP = %w(
    id
    studio_person_id
    reset_password_token
    reset_password_sent_at
    remember_created_at
    sign_in_count
    current_sign_in_at
    last_sign_in_at
    current_sign_in_ip
    last_sign_in_ip
    created_at
    updated_at
    username
    admin
    total_lines
    secret_picture_id
    secret_words
    active
    deleted_at
    purged_at
    invitation_token
    invitation_created_at
    invitation_sent_at
    invitation_accepted_at
    invitation_limit
    invited_by_id
    invited_by_type
    invitations_count
  )

  module ClassMethods
    def new_from_partial_registration(session)
      raise 'No partial registration was in progress' unless PartialRegistration.in_progress? session
      new(session[USER_ATTRIBUTES_SESSION_KEY]) do |user|
        cache = CDO.shared_cache
        [*ATTRIBUTES_TO_KEEP_IN_CACHE, *PROPERTIES_TO_KEEP_IN_CACHE].each do |param|
          next if user.send(param)
          # Grab the value from memcached if it's there
          cache_key = PartialRegistration.cache_key(param, user)
          user.send("#{param}=", cache.read(cache_key)) if cache
        end
        yield user if block_given?
      end
    end
  end

  def self.in_progress?(session)
    !!session[USER_ATTRIBUTES_SESSION_KEY]
  end

  def self.persist_attributes(session, user)
    user = user.dup
    user_attributes = user.attributes.to_h

    # Because some user attributes (especially oauth tokens) are quite large, we pass
    # them through via the application cache instead of the session cookie.
    # They are pulled out again in new_from_partial_registration
    cache = CDO.shared_cache
    if cache
      ATTRIBUTES_TO_KEEP_IN_CACHE.each do |attr_name|
        attr_value = user_attributes.delete(attr_name)
        cache_key = PartialRegistration.cache_key(attr_name, user)
        cache.write(cache_key, attr_value)
      end

      PROPERTIES_TO_KEEP_IN_CACHE.each do |param|
        param_value = user_attributes['properties'].delete(param)
        cache_key = PartialRegistration.cache_key(param, user)
        cache.write(cache_key, param_value)
      end
    end

    # Because we want to keep the session cookie as small as possible, we also drop these
    # user attributes that we don't need to preserve from a partial registration
    ATTRIBUTES_TO_DROP.each do |attr_name|
      user_attributes.delete(attr_name)
    end

    session[USER_ATTRIBUTES_SESSION_KEY] = user_attributes
  end

  def self.get_provider(session)
    in_progress?(session) ? session[USER_ATTRIBUTES_SESSION_KEY]['provider'] : nil
  end

  def self.cancel(session)
    provider = get_provider(session) || 'email'
    SignUpTracking.log_cancel_finish_sign_up(session, provider)
    SignUpTracking.end_sign_up_tracking(session)
    session.delete(USER_ATTRIBUTES_SESSION_KEY)
    session
  end

  def self.cache_key(param_name, user)
    if user.uid.present?
      "#{user.provider}-#{user.uid}-#{param_name}"
    else
      "#{User.hash_email(user.email)}-#{param_name}"
    end
  end
end
