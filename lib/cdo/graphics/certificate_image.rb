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
  course = 'hoc' if course.nil? || course.empty?

  name = name.gsub(/@/,'\@')
  name = ' ' if name.empty?

  template_file = cert_template_for_course(course)

  if prefilled_title_course?(course)
    # only need to fill in name
    vertical_offset = course == '20hours' || course == '20-hour' ? -115 : -110
    image = create_certificate_image2(pegasus_dir('sites.v3', 'code.org', 'public', 'images', template_file), name, y: vertical_offset)
  else # all other courses use a certificate image where the course name is also blank
    image = Magick::Image.read(pegasus_dir('sites.v3', 'code.org', 'public', 'images', template_file)).first

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

    course_vertical_offset = 610
    Magick::Draw.new.annotate(image, 0, 0, 0, course_vertical_offset, cert_display_name_for_course(course)) do
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

def cert_display_name_for_course(course)
  case course
    when 'artist'
      'Artist'
    when 'course1'
      'Course 1'
    when 'course2'
      'Course 2'
    when 'course3'
      'Course 3'
    when 'course4'
      'Course 4'
    else
      course
  end
end

def prefilled_title_course?(course)
  course == '20hours' ||
      course == 'hoc' ||
      course == '20-hour' ||
      course == 'hourofcode' ||
      course == 'Hour of Code' ||
      course == 'starwars' ||
      course == 'mc' ||
      course == 'flappy' ||
      course == 'frozen'
end

def cert_template_for_course(course)
  return 'blank_certificate.png' unless prefilled_title_course?(course)

  if course == '20hours' || course == '20-hour'
    '20hours_certificate.jpg'
  elsif course == 'mc'
    'MC_Hour_Of_Code_Certificate.jpg'
  else
    'hour_of_code_certificate.jpg'
  end
end

# generate a url for a certificate image, given options:
#   name: student name
#   course: course name
#   course_title: course title
#   sponsor: (optional)
def certificate_image_url(opts = {})
  encoded = Base64.urlsafe_encode64(JSON.pretty_generate(opts))
  "http://#{CDO.canonical_hostname('code.org')}/v2/hoc/certificate/#{encoded}.jpg"
end
