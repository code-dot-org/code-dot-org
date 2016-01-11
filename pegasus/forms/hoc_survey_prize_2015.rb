class HocSurveyPrize2015

  def self.normalize(data)
    result = {}

    result[:email_s] = Poste.decrypt(data[:code_s])
    result[:prize_choice_s] = required stripped data[:prize_choice_s]

    result
  end

  def self.process_(form)
    data = JSON.load(form[:data])
    {}.tap do |results|
      results['prize_code_s'] = claim_prize_code(data['prize_choice_s'], data['email_s'], 'Hoc2015', ip_address: form[:created_ip]);
    end
  end

  def self.receipt(data)
    suffix = data['prize_choice_s'].partition('.').first.downcase
    return if suffix == 'none' # no receipt email for none
    suffix = 'msft' if suffix == 'microsoft'
    "12-18-hoc-organizer-survey-#{suffix}"
  end
end
