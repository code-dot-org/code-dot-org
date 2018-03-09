module Api::V1::Pd
  class FacilitatorApplicationCohortViewSerializer < CohortViewSerializerBase
    attributes(
      *superclass._attributes,
      :assigned_fit,
      :registered_fit
    )

    def assigned_fit
      object.fit_workshop.try(&:date_and_location_name)
    end

    def registered_fit
      object.registered_fit_workshop? ? 'Yes' : 'No'
    end
  end
end
