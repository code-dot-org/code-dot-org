class PdWorkshopMaterials
  def self.normalize(data)
    result = {}

    result[:enrollment_id_i] = required integer data[:enrollment_id_i]
    result[:workshop_id_i] = required integer data[:workshop_id_i]

    result[:name_s] = required stripped data[:name_s]
    result[:school_s] = stripped data[:school_s]
    result[:address_1_s] = required stripped data[:address_1_s]
    result[:address_2_s] = stripped data[:address_2_s]
    result[:city_s] = required stripped data[:city_s]
    result[:state_s] = required stripped data[:state_s]
    result[:zip_code_s] = required zip_code data[:zip_code_s]
    result[:email_s] = required email_address data[:email_s]
    result[:phone_number_s] = required us_phone_number data[:phone_number_s]

    result
  end

  def self.get_source_id(data)
    data[:enrollment_id_i]
  end
end
