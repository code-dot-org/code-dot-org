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

  expires 0, :private, :must_revalidate
  redirect((row ? "http://#{row.referer}/congrats?i=#{row.session}" : '/congrats'), 302)
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

def launch_tutorial(tutorial)
  unless settings.read_only
    row = HourOfActivity.create({
      session:    SecureRandom.hex,
      referer:    request.referer_site_with_port,
      tutorial:   tutorial[:code],
      started:    true,
      create_ip:  request.ip,
    })
    set_tutorial_session_cookie(row.session)
  end

  expires 0, :private, :must_revalidate
  redirect tutorial[:url], 302
end

def launch_tutorial_pixel(tutorial)
  unless settings.read_only
    row = HourOfActivity.first(:session=>request.cookies['hour_of_code'])
    if row && !row.pixel_started && !row.pixel_finished && !row.finished
      row.pixel_started = true
      row.update_ip = request.ip
      row.save
    else
      row = HourOfActivity.create({
        session:        SecureRandom.hex,
        referer:        request.host_with_port,
        tutorial:       tutorial[:code],
        pixel_started:  true,
        create_ip:      request.ip,
      })
      set_tutorial_session_cookie(row.session)
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
