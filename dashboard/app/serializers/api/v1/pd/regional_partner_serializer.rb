class Api::V1::Pd::RegionalPartnerSerializer < ActiveModel::Serializer
  attributes :id, :name, :group, :contact, :summer_workshops, :apps_dates, :link_to_partner_application, :cost_scholarship_information, :additional_program_information

  def contact
    object.contact.slice(:email, :name)
  end

  def summer_workshops
    object.upcoming_summer_workshops
  end

  def apps_dates
    {
      open_now: object.earliest_summer_workshop_apps_open_date < Time.zone.now,
      earliest_open_date: object.earliest_summer_workshop_apps_open_date,
      closed_now: object.latest_summer_workshop_apps_close_date < Time.zone.now
    }
  end
end
