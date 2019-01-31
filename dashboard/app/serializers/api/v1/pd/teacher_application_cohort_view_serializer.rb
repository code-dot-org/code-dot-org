module Api::V1::Pd
  class TeacherApplicationCohortViewSerializer < CohortViewSerializerBase
    attributes(*superclass._attributes, :friendly_scholarship_status)
  end
end
