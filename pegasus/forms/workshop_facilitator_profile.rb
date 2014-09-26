class WorkshopFacilitatorProfile

  def self.normalize(data)
    {}.tap do |result|
      result[:create_professional_development_workshop] = FieldError.new(nil, :required) unless have_permission?(:create_professional_development_workshop)

      result[:display_name_s] = required stripped data[:display_name_s]
      result[:description_t] = nil_if_empty stripped data[:description_t]

      if FormError.detect_errors(result).empty?
        result[:profile_image_s] = nil_if_empty uploaded_file data[:profile_image_file]
      end
    end
  end

end
