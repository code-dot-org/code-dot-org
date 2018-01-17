class Api::V1::Pd::RegionalPartnerWorkshopsSerializer < ActiveModel::Serializer
  include Pd::Application::RegionalPartnerTeacherconMapping

  attributes :id, :name, :group, :workshops, :teachercon

  def workshops
    object.try do |partner|
      workshops = partner.pd_workshops_organized
      workshops = workshops.where(course: @scope[:course]) if @scope.try(:[], :course)
      workshops = workshops.where(subject: @scope[:subject]) if @scope.try(:[], :course)
      workshops.map do |workshop|
        {
          id: workshop.id,
          dates: workshop.friendly_date_range,
          location: workshop.location_address
        }
      end
    end
  end

  def teachercon
    get_matching_teachercon object
  end
end
