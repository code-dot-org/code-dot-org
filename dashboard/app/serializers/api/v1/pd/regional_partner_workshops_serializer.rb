class Api::V1::Pd::RegionalPartnerWorkshopsSerializer < ActiveModel::Serializer
  attributes :id, :name, :group, :workshops, :has_csf, :pl_programs_offered, :applications_principal_approval,
             :are_apps_closed_for_rp

  def workshops
    return nil if object.id.nil?

    workshops = object.pd_workshops.future
    workshops = workshops.where(course: @scope[:course]) if @scope.try(:[], :course)
    workshops = workshops.where(subject: @scope[:subject]) if @scope.try(:[], :subject)
    workshops.map do |workshop|
      {
        id: workshop.id,
        dates: workshop.friendly_date_range,
        location: workshop.friendly_location
      }
    end
  end

  def applications_principal_approval
    object.try(:applications_principal_approval) || nil
  end

  def are_apps_closed_for_rp
    apps_close_str = object.try(:apps_close_date_teacher)
    if apps_close_str
      close_date = Date.parse(apps_close_str)
      return close_date.before?(Date.today)
    end

    false
  end
end
