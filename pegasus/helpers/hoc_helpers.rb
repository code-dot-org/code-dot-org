require 'rmagick'
require 'cdo/graphics/certificate_image'
require 'dynamic_config/gatekeeper'

UNSAMPLED_SESSION_ID = 'HOC_UNSAMPLED'

# Creates a session row and sets the hour of code cookie to the session_id,
# if the user is assigned to the sample set (as decided by a random choice
# based on the hoc_activity_sample_proportion DCDO variable).
#
# If, however, the user is not in the sample, returns nil and sets the cookie
# to UNSAMPLED_SESSION_ID.
#
# The "weight" encoded in the session row is set to 1/p, where p is the
# proportion of sessions in the sample, so that reports can compute the
# approximate number of actual sessions by summing over the weights.
def create_session_row_unless_unsampled(row)
  # We don't need to do anything if we've already decided this session is unsampled.
  return if unsampled_session?

  # Decide whether the session should be sampled.
  p = DCDO.get('hoc_activity_sample_proportion', 1.0).to_f
  # don't sample for cartoon network
  p = 1 if row[:company] == 'CN'
  p = 0 if p < 0 # Negative proportions aren't meaningful, so just treat them as disabling logging.
  if Kernel.rand < p  # If p=0, no sessions are in the sample.
    # If we decided to make the session sampled, create the session row and set the hoc cookie.
    row = create_session_row(row, weight: 1.0 / p)
  else
    # Otherwise set the hoc cookie to make the session as unsampled.
    set_hour_of_code_cookie_for_row(session: UNSAMPLED_SESSION_ID)
    row = nil
  end
  row
end

# Creates a session row with the given weight and sets the hour of code cookie to contain
# the session id.
def create_session_row(row, weight: 1.0)
  retries = 3

  begin
    row[:session] = create_session_id(weight)
    row[:id] = DB[:hoc_activity].insert(row)
  end while row[:id] == 0 && (retries -= 1) > 0

  raise "Couldn't create a unique session row." if row[:id] == 0
  set_hour_of_code_cookie_for_row(row)
  row
end

# Create a session id that also encodes the weight of the session.
# We should actually use a separate column for the weight, but need to defer adding
# that column until after the hour of code. (hoc_activity currently has ~100M rows).
def create_session_id(weight)
  # Round to 6 digits after the decimal place to ensure the don't exceed the maximum length (50)
  # of the session column in the database.
  "_#{weight.round(6)}_#{SecureRandom.hex}"
end

# Returns the session id for the current session if sampled, or nil if unset or unsampled.
def session_id
  session_id = request.cookies['hour_of_code']
  (session_id == UNSAMPLED_SESSION_ID) ? nil : session_id
end

def unsampled_session?
  request.cookies['hour_of_code'] == UNSAMPLED_SESSION_ID
end

def session_status_for_row(row)
  row ||= {}

  {
    session: row[:session],
    tutorial: row[:tutorial],
    company: row[:company],
    started: !!row[:started_at],
    pixel_started: !!row[:pixel_started_at],
    pixel_finished: !!row[:pixel_finished_at],
    finished: !!row[:finished_at],
    name: row[:name],
    certificate_sent: !row[:name].blank?,
  }
end

def set_hour_of_code_cookie_for_row(row)
  response.set_cookie('hour_of_code', {value: row[:session], domain: '.code.org', path: '/api/hour/'})
end

def complete_tutorial(tutorial={})
  unless settings.read_only
    # We intentionally allow this DB write even for otherwise unsampled sessions so we can
    # generate personalized, shareable certificates. Only a fraction of users reach the end
    # so its OK to write here.
    row = DB[:hoc_activity].where(session: session_id).first
    if row
      DB[:hoc_activity].where(id: row[:id]).update(
        finished_at: DateTime.now,
        finished_ip: request.ip,
      )
    else
      row = create_session_row(
        referer: request.host_with_port,
        tutorial: tutorial[:code],
        finished_at: DateTime.now,
        finished_ip: request.ip,
      )
    end
    destination = "http://#{row[:referer]}/congrats?i=#{row[:session]}"
    destination += "&co=#{row[:company]}" unless row[:company].blank?
    destination += "&s=#{Base64.urlsafe_encode64(tutorial[:code])}" unless tutorial[:code].blank?
  end

  dont_cache
  redirect (destination || "/congrats?s=#{Base64.urlsafe_encode64(tutorial[:code])}")
end

def complete_tutorial_pixel(tutorial={})
  unless settings.read_only || unsampled_session?
    row = DB[:hoc_activity].where(session: session_id).first
    if row && !row[:pixel_finished_at] && !row[:finished_at]
      DB[:hoc_activity].where(id: row[:id]).update(
        pixel_finished_at: DateTime.now,
        pixel_finished_ip: request.ip,
      )
    else
      create_session_row_unless_unsampled(
        referer: request.host_with_port,
        tutorial: tutorial[:code],
        pixel_finished_at: DateTime.now,
        pixel_finished_ip: request.ip,
      )
    end
  end

  dont_cache
  send_file pegasus_dir('sites.v3/code.org/public/images/1x1.png'), type: 'image/png'
end

def launch_tutorial(tutorial,params={})
  unless settings.read_only || unsampled_session?
    create_session_row_unless_unsampled(
      referer: request.referer_site_with_port,
      tutorial: tutorial[:code],
      company: params[:company],
      started_at: DateTime.now,
      started_ip: request.ip,
    )
  end

  dont_cache
  redirect tutorial[:url], 302
end

def launch_tutorial_pixel(tutorial)
  unless settings.read_only || unsampled_session?
    row = DB[:hoc_activity].where(session: session_id).first
    if row && !row[:pixel_started_at] && !row[:pixel_finished_at] && !row[:finished_at]
      DB[:hoc_activity].where(id: row[:id]).update(
        pixel_started_at: DateTime.now,
        pixel_started_ip: request.ip,
      )
    else
      create_session_row_unless_unsampled(
        referer: request.host_with_port,
        tutorial: tutorial[:code],
        company: params[:company],
        pixel_started_at: DateTime.now,
        pixel_started_ip: request.ip,
      )
    end
  end

  dont_cache
  send_file pegasus_dir('sites.v3/code.org/public/images/1x1.png'), type: 'image/png'
end
