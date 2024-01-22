if defined?(NewRelic::Agent.add_custom_attributes) &&
    defined?(Warden::Manager.after_set_user)
  Warden::Manager.after_set_user do |user, _auth, _opts|
    if user.respond_to?(:id)
      NewRelic::Agent.add_custom_attributes({user_id: user.id})
    end
  end
end
