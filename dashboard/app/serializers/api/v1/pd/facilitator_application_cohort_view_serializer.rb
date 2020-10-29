module Api::V1::Pd
  class FacilitatorApplicationCohortViewSerializer < CohortViewSerializerBase
    # Declare attributes individually instead of using attributes list, to preserve attributes declared on base class

    attribute :assigned_fit
    attribute :registered_fit

    def assigned_fit
      object.fit_workshop.try(&:date_and_location_name)
    end

    def registered_fit
      object.registered_fit_workshop? ? 'Yes' : 'No'
    end
  end
end
