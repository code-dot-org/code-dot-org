class CspTable
  def self.normalize(data)
    {}.tap do |result|
      result[:email_s] = 'anonymous@code.org'
      result[:table_name_s] = required stripped data[:table_name_s]
    end
  end
end
