module Devise::DatabaseAuthenticationOverrides
  extend ActiveSupport::Concern

  def update_without_password(params, *options)
    if params[:races]
      self.races = params[:races].join ','
    end
    params.delete(:races)
    super
  end

  def update_with_password(params, *options)
    if encrypted_password.blank?
      params.delete(:current_password) # user does not have password so current password is irrelevant
      update(params, *options)
    else
      super
    end
  end
end
