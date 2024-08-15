class Policies::User
  # Returns the user.attributes along with the attributes of select
  # associations.
  def self.user_attributes(user)
    attributes = user.attributes
    authentication_options = user.authentication_options.map {|ao| ao.attributes.compact}

    # Remove the plaintext email from the session cache
    attributes.delete("email")

    attributes.merge('authentication_options_attributes' => authentication_options).compact
  end
end
