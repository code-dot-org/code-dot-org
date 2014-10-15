require 'RMagick'

def create_certificate_image(name, course=nil, sponsor=nil)
  image_file = '20hours_certificate.jpg' if course == '20hours'
  image_file ||= 'hour_of_code_certificate.jpg'
  background = Magick::Image.read(pegasus_dir('sites.v3', 'code.org', 'public', 'images', image_file)).first

  width = background.columns
  height = background.rows

  draw = Magick::Draw.new
  name = name.gsub(/@/,'\@')
  name = ' ' if name.empty?

  vertical_offset = course == "20hours" ? 260 : 235
  draw.annotate(background, width,height-vertical_offset,0,0, name.to_s) do
    draw.gravity = Magick::CenterGravity
    self.pointsize = 90
    self.font_family = 'Times'
    self.font_weight = Magick::BoldWeight
    self.stroke = 'none'
    self.fill = 'rgb(87,87,87)'
  end

  unless sponsor
    weight = SecureRandom.random_number
    donor = DB[:cdo_donors].where('((weight_f - ?) >= 0)', weight).first
    sponsor = donor[:name_s]
  end
  draw.annotate(background, width,(height*2)-340,0,0, "#{sponsor} made the generous gift to sponsor your learning.") do
    draw.gravity = Magick::CenterGravity
    self.pointsize = 24
    self.font_family = 'Times'
    self.font_weight = Magick::BoldWeight
    self.stroke = 'none'
    self.fill = 'rgb(87,87,87)'
  end
  background
end

def complete_tutorial(tutorial=nil)
  row = nil

  unless settings.read_only
    row = HourOfActivity.first(:session=>request.cookies['hour_of_code'])
    if row
      row.finished = true
      row.update_ip = request.ip
      row.save
    else
      tutorial_id = tutorial[:code] if tutorial

      row = HourOfActivity.create({
        session:    SecureRandom.hex,
        referer:    request.host_with_port,
        tutorial:   tutorial_id,
        finished:   true,
        create_ip:  request.ip,
      })
      set_tutorial_session_cookie(row.session)
    end
  end

  # TODO(dave): split into complete_tutorial_new and
  # complete_tutorial_old. Also split other methods
  # [launch|complete}_tutorial[_pixel].

  # For now, Do the bare minimum to bring a user with a
  # company-specific cookie to the right congrats page.
  sequel_row = DB[:hoc_activity].where(session:request.cookies['hour_of_code']).first
  company = sequel_row[:company] if sequel_row

  expires 0, :private, :must_revalidate
  if company
    redirect((row ? "http://#{row.referer}/congrats?i=#{row.session}&co=#{company}" : '/congrats'), 302)    
  else
    redirect((row ? "http://#{row.referer}/congrats?i=#{row.session}" : '/congrats'), 302)
  end
end

def complete_tutorial_pixel(tutorial)
  unless settings.read_only
    row = HourOfActivity.first(:session=>request.cookies['hour_of_code'])
    if row && !row.pixel_finished && !row.finished
      row.pixel_finished = true
      row.update_ip = request.ip
      row.save
    else
      row = HourOfActivity.create({
        session:        SecureRandom.hex,
        referer:        request.host_with_port,
        tutorial:       tutorial[:code],
        pixel_finished: true,
        create_ip:      request.ip,
      })
      set_tutorial_session_cookie(row.session)
    end
  end

  expires 0, :private, :must_revalidate
  send_file sites_dir('all/images/1x1.png'), type:'image/png'
end

def launch_tutorial(tutorial,params={})
  unless settings.read_only
    session = SecureRandom.hex

    row = HourOfActivity.create({
      session:    session,
      referer:    request.referer_site_with_port,
      tutorial:   tutorial[:code],
      started:    true,
      create_ip:  request.ip,
    })

    DB[:hoc_activity].insert(
      session:session,
      referer:request.referer_site_with_port,
      tutorial:tutorial[:code],
      company:params[:company],
      started_at:DateTime.now,
      started_ip:request.ip,
    )

    set_tutorial_session_cookie(session)
  end

  expires 0, :private, :must_revalidate
  redirect tutorial[:url], 302
end

def launch_tutorial_pixel(tutorial)
  unless settings.read_only
    row = HourOfActivity.first(:session=>request.cookies['hour_of_code'])
    if row && !row.pixel_started && !row.pixel_finished && !row.finished
      session = row.session
      row.pixel_started = true
      row.update_ip = request.ip
      row.save
    else
      session = SecureRandom.hex
      row = HourOfActivity.create({
        session:        session,
        referer:        request.host_with_port,
        tutorial:       tutorial[:code],
        pixel_started:  true,
        create_ip:      request.ip,
      })
      # Set the cookie to match the session in the HourOfActivity table.
      # TODO: when we move to the hoc_activity table below, set the
      # cookie to match the session in hoc_activity instead.
      set_tutorial_session_cookie(row.session)
    end

    row = DB[:hoc_activity].where(session:request.cookies['hour_of_code'], pixel_started_at:nil, pixel_finished_at:nil, finished_at:nil).first
    if row
      DB[:hoc_activity].where(id:row[:id]).update(pixel_started_at:DateTime.now, pixel_started_ip:request.ip)
    else
      DB[:hoc_activity].insert(
        session:session,
        referer:request.referer_site_with_port,
        tutorial:tutorial[:code],
        company:params[:company],
        pixel_started_at:DateTime.now,
        pixel_started_ip:request.ip,
      )
    end
  end

  expires 0, :private, :must_revalidate
  send_file pegasus_dir('sites.v3/code.org/public/images/1x1.png'), type:'image/png'
end

def set_tutorial_session_cookie(session)
  response.set_cookie('hour_of_code', {value:session, domain:'.code.org', path:'/api/hour/'})
end

def tutorial_status(session)
  pass unless row = HourOfActivity.first(session:session)
  expires 0, :private, :must_revalidate
  content_type :json
  HourOfActivity.stat(row).to_json
end
