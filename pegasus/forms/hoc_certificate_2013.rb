class HocCertificate2013

  def self.normalize(data)
    result = {}
    result[:email_s] = data[:email_s]
    result[:name_s] = nil_if_empty stripped data[:name_s]
    result[:session_s] = nil_if_empty downcased stripped data[:session_s]
    result
  end

  def self.receipt()
    'hoc_certificate'
  end

end
