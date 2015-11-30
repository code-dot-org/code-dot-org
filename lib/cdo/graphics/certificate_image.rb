# Utility methods for generating certificate images.
# Note: requires pegasus_dir to be in scope.

require 'rmagick'
require_relative '../scripts/script_info'

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

def create_course_certificate_image(name, course=nil, sponsor=nil, course_title=nil)
  name = name.gsub(/@/,'\@')
  name = ' ' if name.empty?

  template_file = certificate_template_for_course(course)

  if prefilled_title_course?(course)
    # only need to fill in student name
    vertical_offset = course == '20-hour' ? -115 : -110
    image = create_certificate_image2(pegasus_dir('sites.v3', 'code.org', 'public', 'images', template_file), name, y: vertical_offset)
  else # all other courses use a certificate image where the course name is also blank
    # assuming that cert links for non-HoC / 20-hour courses will not exposed outside of
    # code paths that pass along the course title. Throw if assumption invalid, if detected,
    # re-implement course -> course_title mapping or find way to pass along
    course_title ||= fallback_course_title_for(course)

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
    Magick::Draw.new.annotate(image, 0, 0, 0, course_vertical_offset, course_title) do
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

def prefilled_title_course?(course)
  ScriptInfo.hoc?(course) || ScriptInfo.twenty_hour?(course)
end

def fallback_course_title_for(course)
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

def certificate_template_for_course(course)
  if ScriptInfo.hoc?(course)
    if ScriptInfo.minecraft?(course)
      'MC_Hour_Of_Code_Certificate.jpg'
    else
      'hour_of_code_certificate.jpg'
    end
  elsif ScriptInfo.twenty_hour?(course)
    '20hours_certificate.jpg'
  else
    'blank_certificate.png'
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
