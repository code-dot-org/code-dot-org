require 'rmagick'
require 'cdo/graphics/certificate_image'
require 'dynamic_config/gatekeeper'

UNSAMPLED_HOC_COOKIE = 'HOC_UNSAMPLED'

def create_session_row(row, weight: 1.0)
  retries = 3

  begin
    row[:session] = SecureRandom.hex
    row[:id] = DB[:hoc_activity].insert(row)
  end while row[:id] == 0 && (retries -= 1) > 0

  raise "Couldn't create a unique session row." if row[:id] == 0
  set_hour_of_code_cookie_for_row(row[:session])
end

def create_session_row_if_in_sample(row)
  p = DCDO.get('hoc_activity_sample_proportion', default: 1.0).to_f
  p = 1.0 if p == 0.0  # Don't sample if the proportion is invalid.
  if rand() < p
    row = create_session_row(row, weight: 1.0 / p)
  else
    set_hour_of_code_cookie_for_row({session: HOC_UNSAMPLED})
    row = nil
  end
  row
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

def set_unsampled_hour_of_code_cookie
  set_hour_of_code_cookie_for_row({session: HOC_UNSAMPLED})
end

def complete_tutorial(tutorial={})
  hoc_cookie = request.cookies['hour_of_code']
  unless settings.read_only
    # We intentionally allow this DB write even when hoc_activity_writes_disabled
    # is set so we can generate personalized, shareable certificates.
    row = DB[:hoc_activity].where(session: hoc_cookie).first unless
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
  unless settings.read_only
    row = DB[:hoc_activity].where(session: request.cookies['hour_of_code']).first
    if row && !row[:pixel_finished_at] && !row[:finished_at]
      DB[:hoc_activity].where(id: row[:id]).update(
        pixel_finished_at: DateTime.now,
        pixel_finished_ip: request.ip,
      )
    else
      row = create_session_row_if_in_sample(
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
  unless settings.read_only
    row = create_session_row_if_in_sample(
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
  unless settings.read_only || hoc_activity_writes_disabled
    row = DB[:hoc_activity].where(session: request.cookies['hour_of_code']).first
    if row && !row[:pixel_started_at] && !row[:pixel_finished_at] && !row[:finished_at]
      DB[:hoc_activity].where(id: row[:id]).update(
        pixel_started_at: DateTime.now,
        pixel_started_ip: request.ip,
      )
    else
      row = create_session_row_if_in_sample(
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
