module Api::V1::Pd
  class TeacherApplicationCohortViewSerializer < CohortViewSerializerBase
    attributes(*superclass._attributes, :friendly_scholarship_status, :registered_workshop_id)

    def registered_workshop_id
      if object.workshop.try(:local_summer?)
        object.registered_workshop? ? object.workshop.id : nil
      end
    end
  end
end
