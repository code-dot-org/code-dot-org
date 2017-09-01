require_relative './form'

class Census2017 < Form
  def self.normalize(data)
    result = {}

    result[:email_s] = required data[:email_s]
    result[:name_s] = data[:name_s]
    result[:role_s] = data[:role_s]

    result
  end
end
