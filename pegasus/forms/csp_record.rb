class CspRecord
  def self.normalize(data)
    {}.tap do |result|
      result[:email_s] = 'anonymous@code.org'
      result[:name_s] = stripped data[:name_s]
      result[:record_data_s] = nil_if_empty stripped data[:record_data_s]
    end
  end
end
