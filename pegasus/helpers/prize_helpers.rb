require src_dir 'abort_form_error'

def request_ip
  return nil unless defined? request
  request.ip
end

def claim_prize_code(type, email, purpose, params={})
  ip_address = params[:ip_address] || request_ip || '127.0.0.1'

  type = type.downcase
  return 'None' if type == 'none'

  begin
    rows_updated = DB[:hoc_survey_prizes].where(claimant: nil, type: type).limit(1).update(
      claimant: email,
      purpose: purpose,
      claimed_at: DateTime.now,
      claimed_ip: ip_address,
    )

    raise AbortFormError, "Out of '#{type}' codes." if rows_updated == 0
  rescue Sequel::UniqueConstraintViolation
    # This user has already claimed a prize, the query below will return that existing prize.
  rescue
    raise
  end

  prize = DB[:hoc_survey_prizes].where(claimant: email, type: type, purpose: purpose).get(:value)
  return 'None' unless prize
  prize
end

def prize_available?(type)
  !DB[:hoc_survey_prizes].where(claimant: nil, type: type).empty?
end
