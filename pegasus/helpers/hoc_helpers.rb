require 'rmagick'
require 'cdo/graphics/certificate_image'

def create_session_row(row)
  retries = 3

  begin
    row[:session] = SecureRandom.hex
    row[:id] = DB[:hoc_activity].insert(row)
  end while row[:id] == 0 && (retries -= 1) > 0

  raise "Couldn't create a unique session row." if row[:id] == 0

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

def complete_tutorial(tutorial={})
  unless settings.read_only
    row = DB[:hoc_activity].where(session: request.cookies['hour_of_code']).first
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
      set_hour_of_code_cookie_for_row(row)
    end
    destination = "http://#{row[:referer]}/congrats?i=#{row[:session]}"
    destination += "&co=#{row[:company]}" unless row[:company].blank?
  end

  dont_cache
  redirect destination || '/congrats'
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
      row = create_session_row(
        referer: request.host_with_port,
        tutorial: tutorial[:code],
        pixel_finished_at: DateTime.now,
        pixel_finished_ip: request.ip,
      )
      set_hour_of_code_cookie_for_row(row)
    end
  end

  dont_cache
  send_file pegasus_dir('sites.v3/code.org/public/images/1x1.png'), type: 'image/png'
end

def launch_tutorial(tutorial,params={})
  unless settings.read_only
    row = create_session_row(
      referer: request.referer_site_with_port,
      tutorial: tutorial[:code],
      company: params[:company],
      started_at: DateTime.now,
      started_ip: request.ip,
    )
    set_hour_of_code_cookie_for_row(row)
  end

  dont_cache
  redirect tutorial[:url], 302
end

def launch_tutorial_pixel(tutorial)
  unless settings.read_only
    row = DB[:hoc_activity].where(session: request.cookies['hour_of_code']).first
    if row && !row[:pixel_started_at] && !row[:pixel_finished_at] && !row[:finished_at]
      DB[:hoc_activity].where(id: row[:id]).update(
        pixel_started_at: DateTime.now,
        pixel_started_ip: request.ip,
      )
    else
      row = create_session_row(
        referer: request.host_with_port,
        tutorial: tutorial[:code],
        company: params[:company],
        pixel_started_at: DateTime.now,
        pixel_started_ip: request.ip,
      )
      set_hour_of_code_cookie_for_row(row)
    end
  end

  dont_cache
  send_file pegasus_dir('sites.v3/code.org/public/images/1x1.png'), type: 'image/png'
end
