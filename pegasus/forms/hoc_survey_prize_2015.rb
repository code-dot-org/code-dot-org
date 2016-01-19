class HocSurveyPrize2015

  def self.normalize(data)
    result = {}

    result[:email_s] = Poste.decrypt(data[:code_s])
    result[:prize_choice_s] = required stripped data[:prize_choice_s]

    result
  end

  def self.process_(form)
    # Survey closed on 2016-1-15. Do not claim any more prizes.
  end

  def self.receipt(data)
    suffix = data['prize_choice_s'].partition('.').first.downcase
    return if suffix == 'none' # no receipt email for none
    suffix = 'msft' if suffix == 'microsoft'
    "12-18-hoc-organizer-survey-#{suffix}"
  end
end
