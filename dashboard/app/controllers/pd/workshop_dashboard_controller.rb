module Pd
  class WorkshopDashboardController < ApplicationController
    before_action :authenticate_user!
    def index
      @permission = nil

      contact_rp = RegionalPartner.find_by(contact: current_user)

      if current_user.admin?
        @permission = :admin
      else
        permission_list = []
        permission_list << :workshop_organizer if current_user.workshop_organizer?
        permission_list << :facilitator if current_user.facilitator?
        permission_list << :plp if contact_rp
        @permission = permission_list unless permission_list.empty?
      end

      unless @permission
        render_404
        return
      end

      @available_regional_partners = current_user.regional_partners.to_a
      @available_regional_partners << contact_rp if contact_rp
      @available_regional_partners.map! do |rp|
        {id: rp.id, name: rp.name}
      end

      view_options(full_width: true)
    end
  end
end
