class RegionalPartnerSerializer < ActiveModel::Serializer
  include Pd::Application::RegionalPartnerTeacherconMapping
  include Pd::SharedWorkshopConstants

  attributes :id, :name, :group, :workshop_type

  def workshop_type
    get_matching_teachercon(object) ? WORKSHOP_TYPES[:teachercon] : WORKSHOP_TYPES[:local_summer]
  end
end
