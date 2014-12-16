class HocSurvey2014
  
  def self.claim_prize_code(type, user_id, params={})
    ip_address = params[:ip_address] || request.ip
  
    begin
      rows_updated = DB[:hoc_survey_prizes].where(claimant:nil, type:type).limit(1).update(
        claimant:user_id,
        claimed_at:DateTime.now,
        claimed_ip:ip_address,
      )
      raise StandardError, "Out of '#{type}' codes." if rows_updated == 0
    rescue Sequel::UniqueConstraintViolation
      # This user has already claimed a prize, the query below will return that existing prize.
    rescue
      raise
    end

    DB[:hoc_survey_prizes].where(claimant:user_id).first
  end

end
