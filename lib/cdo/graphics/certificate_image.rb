require 'rmagick'

def create_certificate_image2(image_path, name, params={})
  name = name.to_s.gsub(/@/,'\@').strip
  name = ' ' if name.empty?

  background = Magick::Image.read(image_path).first

  y = params[:y] || 0
  x = params[:x] || 0
  width = params[:width] || background.columns
  height = params[:height] || background.rows

  draw = Magick::Draw.new
  draw.annotate(background, width, height, x, y, name) do
    draw.gravity = Magick::CenterGravity
    self.pointsize = 90
    self.font_family = 'Times'
    self.font_weight = Magick::BoldWeight
    self.stroke = 'none'
    self.fill = 'rgb(87,87,87)'
  end

  background
end

def create_course_certificate_image(name, course=nil, sponsor=nil)
  name = name.gsub(/@/,'\@')
  name = ' ' if name.empty?

  if course == '20hours' || course == 'hoc' || course == '20-hour' || course == 'hourofcode' || course == 'starwars'
    # only need to fill in name
    image_file = (course == '20hours' || course == '20-hour') ? '20hours_certificate.jpg' : 'hour_of_code_certificate.jpg'
    vertical_offset = course == '20hours' || course == '20-hour' ? -115 : -110
    image = create_certificate_image2(pegasus_dir('sites.v3', 'code.org', 'public', 'images', image_file), name, y: vertical_offset)
  else # all other courses use a certificate image where the course name is also blank
    image_file = 'blank_certificate.png'
    image = Magick::Image.read(pegasus_dir('sites.v3', 'code.org', 'public', 'images', image_file)).first

    # student name
    name_vertical_offset = 445
    Magick::Draw.new.annotate(image, 0, 0, 0, name_vertical_offset, name) do
      self.gravity = Magick::NorthGravity
      self.pointsize = 96
      self.font_family = 'Helvetica'
      self.font_weight = Magick::BoldWeight
      self.stroke = 'none'
      self.fill = 'rgb(118,101,160)' # purple
    end

    # Take course name and convert it to a nicer full course name for the certificate
    case course
      when nil
        full_course_name = ''
      when 'artist'
        full_course_name = 'Artist'
      when 'course1'
        full_course_name = 'Course 1'
      when 'course2'
        full_course_name = 'Course 2'
      when 'course3'
        full_course_name = 'Course 3'
      when 'course4'
        full_course_name = 'Course 4'
      when 'frozen'
        full_course_name = 'Frozen'
      when 'playlab'
        full_course_name = 'Play Lab'
      when 'flappy'
        full_course_name = 'Flappy Bird'
      else
        full_course_name = course
    end

    # course name
    course_vertical_offset = 610
    Magick::Draw.new.annotate(image, 0, 0, 0, course_vertical_offset, full_course_name) do
      self.gravity = Magick::NorthGravity
      self.pointsize = 60
      self.font_family = 'Helvetica'
      self.font_weight = Magick::BoldWeight
      self.stroke = 'none'
      self.fill = 'rgb(29, 173, 186)' # teal
    end
  end

  unless sponsor
    weight = SecureRandom.random_number
    donor = DB[:cdo_donors].where('((weight_f - ?) >= 0)', weight).first
    sponsor = donor[:name_s]
  end

  Magick::Draw.new.annotate(image, 0, 0, 0, 160, "#{sponsor} made the generous gift to sponsor your learning.") do
    self.gravity = Magick::SouthGravity
    self.pointsize = 24
    self.font_family = 'Times'
    self.font_weight = Magick::BoldWeight
    self.stroke = 'none'
    self.fill = 'rgb(87,87,87)'
  end
  image
end

# generate a url for a certificate image, given options:
#   name: student name
#   course: '20hours', 'hoc' or the course title
#   sponsor: (optional)
def certificate_image_url(opts = {})
  encoded = Base64.urlsafe_encode64(JSON.pretty_generate(opts))
  "http://#{CDO.canonical_hostname('code.org')}/v2/hoc/certificate/#{encoded}.jpg"
end
