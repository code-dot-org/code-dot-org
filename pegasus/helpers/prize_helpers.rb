def claim_prize_code(type, email, params={})
  ip_address = params[:ip_address] || request.ip || '127.0.0.1'

  type = type.downcase
  return 'None' if type == 'none'

  begin
    rows_updated = DB[:hoc_survey_prizes].where(claimant: nil, type: type).limit(1).update(
      claimant: email,
      claimed_at: DateTime.now,
      claimed_ip: ip_address,
    )
    raise StandardError, "Out of '#{type}' codes." if rows_updated == 0
  rescue Sequel::UniqueConstraintViolation
    # This user has already claimed a prize, the query below will return that existing prize.
  rescue
    raise
  end

  DB[:hoc_survey_prizes].where(claimant: email).first[:value]
end
