class Api::V1::Pd::RegionalPartnerSerializer < ActiveModel::Serializer
  attributes :id, :name, :contact_name, :contact_email, :summer_workshops, :application_state, :link_to_partner_application, :cost_scholarship_information, :additional_program_information

  def summer_workshops
    object.upcoming_summer_workshops
  end

  def application_state
    {
      state: object.summer_workshops_application_state,
      earliest_open_date: object.summer_workshops_earliest_apps_open_date
    }
  end
end
