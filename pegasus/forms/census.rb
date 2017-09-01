require_relative './form'

class Census < Form
  def self.normalize(data)
    result = {}

    result[:email_s] = required data[:email_s]

    result
  end
end
