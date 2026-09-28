# Devise's `sign_in` takes no reason, so code that knows why it is signing a user in has no way to tell the trackable
# hook that writes the sign_ins row. Extend the signature with that reason rather than have callers set it in a separate
# statement, which can drift from the call it describes or be left behind for a later sign_in to inherit.
#
#   sign_in user, event_type: SignIn::CREDENTIAL, authentication_option: option
#
# Most callers need none of this (Services::SignInAttribution recovers the answer from Warden and OmniAuth on its own).
module SignInAttributionOptions
  def sign_in(resource_or_scope, *args)
    Services::SignInAttribution.extract!(request, args)
    super
  end

  def bypass_sign_in(resource, scope: nil, **attribution)
    Services::SignInAttribution.extract!(request, [attribution])
    super(resource, scope: scope)
  end
end

Rails.application.config.to_prepare do
  # Prepending the Devise module rather than a controller covers every controller that signs a user in, including Devise's own.
  Devise::Controllers::SignInOut.prepend SignInAttributionOptions
end

# :unshift registers this ahead of Devise's trackable hook, so the event is on the
# request before the row that needs it is written.
Warden::Manager.after_set_user({}, :unshift) do |_record, warden, options|
  Services::SignInAttribution.record_warden_event(warden, options)
end
