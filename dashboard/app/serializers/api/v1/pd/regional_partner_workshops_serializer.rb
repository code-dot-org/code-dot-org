class Api::V1::Pd::RegionalPartnerWorkshopsSerializer < ActiveModel::Serializer
  attributes :id, :name, :group, :workshops, :has_csf

  def workshops
    object.try do |partner|
      workshops = partner.pd_workshops.future
      workshops = workshops.where(course: @scope[:course]) if @scope.try(:[], :course)
      workshops = workshops.where(subject: @scope[:subject]) if @scope.try(:[], :subject)
      workshops.map do |workshop|
        {
          id: workshop.id,
          dates: workshop.friendly_date_range,
          location: workshop.location_address
        }
      end
    end
  end
end
