module Api::V1::Pd
  class TeacherApplicationCohortViewSerializer < CohortViewSerializerBase
    # Declare attributes individually instead of using attributes list, to preserve attributes declared on base class
    attribute :friendly_scholarship_status
    attribute :registered_workshop_id

    def registered_workshop_id
      if object.workshop.try(:local_summer?)
        object.registered_workshop? ? object.workshop.id : nil
      end
    end
  end
end
