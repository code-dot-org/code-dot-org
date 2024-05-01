require_relative '../../shared/middleware/helpers/experiments'
require 'date'
# Support for the Colorado Privacy Act (CPA) compliance.
module Cpa
  NEW_USER_LOCKOUT = 'cpa_new_user_lockout'
  ALL_USER_LOCKOUT_WARNING = 'cpa_all_user_lockout_warning'
  ALL_USER_LOCKOUT = 'cpa_all_user_lockout'

  # There are three phases for the Colorado Privacy Act:
  # 1. Nothing - nil
  # 2. New User Accounts must be compliant - 'cpa_new_user_lockout'
  # 3. Existing accounts warned of lockout - 'cpa_all_user_lockout_warning'
  # 4. All User Accounts must be compliant - 'cpa_all_user_lockout'
  # @param current_request [ActionDispatch::Request] the web request being
  # processed
  # The DateTime strings must be ISO 8601 formatted.
  # @param current_time [DateTime] The current time, this should only be set for
  # testing purposes.
  # @return [String, nil] A string representing the current phase of the
  # compliance. nil if no phase.
  def self.cpa_experience(current_request, current_time: DateTime.now)
    # If there is no request being handled, there is no experience to show.
    return nil unless current_request
    # schedule [Map] A map of the CPA phases to dates. Example:
    # {
    #   “new_user_lockout”: “2023-07-01T00:00:00Z”,
    #   “all_user_lockout”: “2024-07-01T00:00:00Z”
    # }
    schedule = experiment_value('cpa_schedule', current_request)
    # override [String] configuration overrides if we are manually testing the
    # experiences. This parameter will default to the query string parameter or
    # cookie 'cpa_experience'.
    override = experiment_value('cpa_experience', current_request)
    # If we detect a configuration override, use that instead.
    return override if override

    # Verify the schedule is well defined.
    return nil unless schedule
    return nil unless schedule[Cpa::NEW_USER_LOCKOUT]
    return nil unless schedule[Cpa::ALL_USER_LOCKOUT_WARNING]
    return nil unless schedule[Cpa::ALL_USER_LOCKOUT]

    # Calculate the phase of the CPA compliance schedule.
    new_user_lockout = DateTime.parse(schedule[Cpa::NEW_USER_LOCKOUT])
    new_user_lockout_warning = DateTime.parse(schedule[Cpa::ALL_USER_LOCKOUT_WARNING])
    all_user_lockout = DateTime.parse(schedule[Cpa::ALL_USER_LOCKOUT])
    if current_time > all_user_lockout
      Cpa::ALL_USER_LOCKOUT
    elsif current_time > new_user_lockout_warning
      Cpa::ALL_USER_LOCKOUT_WARNING
    elsif current_time > new_user_lockout
      Cpa::NEW_USER_LOCKOUT
    else
      nil
    end
  end
end
