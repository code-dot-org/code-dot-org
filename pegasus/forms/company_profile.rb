class CompanyProfile

  def self.normalize(data)
    {}.tap do |result|
      result[:email_s] = 'anonymous@code.org'
      result[:name_s] = required downcased stripped data[:name_s]
      result[:display_name_s] = required stripped data[:display_name_s]
      result[:name_in_header_b] = nil_if_empty data[:name_in_header_b]
      result[:num_employees_i] = nil_if_empty data[:num_employees_i]
      result[:video_key_s] = nil_if_empty stripped data[:video_key_s]
      result[:intro_top_copy_t] = nil_if_empty stripped data[:intro_top_copy_t]
      result[:intro_bottom_copy_t] = nil_if_empty stripped data[:intro_bottom_copy_t]
      result[:additional_actions_copy_t] = nil_if_empty stripped data[:additional_actions_copy_t]
      result[:logo_path_s] = nil_if_empty stripped data[:logo_path_s]
      result[:gplus_b] = nil_if_empty data[:gplus_b]

      if FormError.detect_errors(result).empty?
        result[:logo_path_s] = default_if_empty uploaded_file(data[:logo_file]), result[:logo_path_s]
      end
    end
  end

end
