module OverrideUpdateTrackedFields
  def update_tracked_fields(request)
    super(request)
    if persisted? && id
      SignIn.create(
        user_id: id,
        sign_in_at: DateTime.now,
        sign_in_count: sign_in_count
      )
    end
    if persisted? && id && current_sign_in_ip
      if UserGeo.find_by_user_id(id).nil?
        UserGeo.create!(
          user_id: id,
          ip_address: current_sign_in_ip
        )
      end
    end
  end
end

User.prepend OverrideUpdateTrackedFields
