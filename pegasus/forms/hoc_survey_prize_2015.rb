class HocSurveyPrize2015
  def self.normalize(data)
    result = {}

    result[:email_s] = Poste.decrypt(data[:code_s])
    result[:prize_choice_s] = required stripped data[:prize_choice_s]

    result
  end

  # Survey closed on 2016-1-15. Do not claim any more prizes.
end
