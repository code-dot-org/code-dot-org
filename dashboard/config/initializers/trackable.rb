module OverrideUpdateTrackedFields
  def update_tracked_fields(request)
    super(request)
    if self.persisted? && self.id
      SignIn.create(
        user_id: self.id,
        sign_in_at: DateTime.now,
        sign_in_count: self.sign_in_count
      )
    end
    if self.persisted? && self.id && self.current_sign_in_ip
      if UserGeo.find_by_user_id(self.id).nil?
        UserGeo.create!(
          user_id: self.id,
          ip_address: self.current_sign_in_ip
        )
      end
    end
  end
end

User.prepend OverrideUpdateTrackedFields
