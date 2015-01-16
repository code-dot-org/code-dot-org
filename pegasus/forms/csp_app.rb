class CspApp
  def self.normalize(data)
    {}.tap do |result|
      result[:email_s] = 'anonymous@code.org'
      result[:app_name_s] = required stripped data[:app_name_s]
    end
  end
end
