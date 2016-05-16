# Utility methods for generating certificate images.
# Note: requires pegasus_dir to be in scope.

require 'rmagick'
require_relative '../script_constants'

def create_certificate_image2(image_path, name, params={})
  name = name.to_s.force_8859_to_utf8.gsub(/@/, '\@').strip
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

# This method returns a newly-allocated Magick::Image object.
# NOTE: the caller MUST ensure image#destroy! is called on the returned image object to avoid memory leaks.
def create_course_certificate_image(name, course=nil, sponsor=nil, course_title=nil)
  name = name.force_8859_to_utf8.gsub(/@/, '\@')
  name = ' ' if name.empty?

  course ||= ScriptConstants::HOC_NAME

  template_file = certificate_template_for(course)

  path = pegasus_dir('sites.v3', 'code.org', 'public', 'images', template_file)
  if prefilled_title_course?(course)
    # only need to fill in student name
    vertical_offset = course == '20-hour' ? -115 : -110
    image = create_certificate_image2(path, name, y: vertical_offset)
  else # all other courses use a certificate image where the course name is also blank
    course_title ||= fallback_course_title_for(course)

    image = Magick::Image.read(path).first

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
  ScriptConstants.script_in_category?(:hoc, course) ||
      ScriptConstants.script_in_category?(:twenty_hour, course)
end

# Specify a fallback certificate title for a given non-HoC course ID. As of HoC
# 2015 this fallback mapping is only ever hit on bulk /certificates pages.
def fallback_course_title_for(course)
  case course
    when ScriptConstants::ARTIST_NAME
      'Artist'
    when ScriptConstants::COURSE1_NAME
      'Course 1'
    when ScriptConstants::COURSE2_NAME
      'Course 2'
    when ScriptConstants::COURSE3_NAME
      'Course 3'
    when ScriptConstants::COURSE4_NAME
      'Course 4'
    else
      course
  end
end

def certificate_template_for(course)
  if ScriptConstants.script_in_category?(:hoc, course)
    if ScriptConstants.script_in_category?(:minecraft, course)
      'MC_Hour_Of_Code_Certificate.jpg'
    else
      'hour_of_code_certificate.jpg'
    end
  elsif ScriptConstants.script_in_category?(:twenty_hour, course)
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
