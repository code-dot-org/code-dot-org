module Api::V1::Pd
  class TcFitCohortViewTeacherconRegistrationSerializer < TcFitCohortViewSerializer
    attributes(*superclass._attributes)

    def school_name
      # Get from applicant
      object.user.try(&:school_info).try(&:school).try(&:name)
    end

    def district_name
      # Get from applicant
      object.user.try(&:school_info).try(&:school).try(&:school_district).try(&:name)
    end

    def assigned_workshop
      hash = object.sanitize_form_data_hash
      hash && hash[:date] ? "#{hash[:date]}, #{hash[:city]}" : ""
    end

    def registered_workshop
      # We don't have a known specific workshop here, but since it's a teachercon registration
      # we know they are registered
      true
    end

    def locked
      true
    end

    def status
      object.pd_application.try(:status)
    end
  end
end
