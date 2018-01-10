module Pd
  class ApplicationDashboardController < ApplicationController
    authorize_resource class: 'Pd::Application::ApplicationBase'

    def index
      view_options(full_width: true)

      is_workshop_admin = current_user.permission? UserPermission::WORKSHOP_ADMIN
      workshops = if is_workshop_admin
        Pd::Workshop.where(subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP)
      else
        Pd::Workshop.where(subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, regional_partner: current_user.regional_partners)
      end.in_state(Pd::Workshop::STATE_NOT_STARTED).scheduled_start_on_or_before(Date.today.end_of_year)

      summer_workshops = workshops.map do |workshop|
        {
          value: workshop.id,
          label: "#{workshop.friendly_date_range}, #{workshop.location_city}"
        }
      end

      @script_data = {
        props: {
          regionalPartnerName: current_user.regional_partners.first.try(:name),
          regionalPartnerGroup: current_user.regional_partners.first.try(:group),
          regionalPartners: RegionalPartner.select("id, name"),
          isWorkshopAdmin: is_workshop_admin,
          canLockApplications: can?(:manage, Pd::Application::ApplicationBase),
          summerWorkshops: summer_workshops
        }.to_json
      }
    end
  end
end
