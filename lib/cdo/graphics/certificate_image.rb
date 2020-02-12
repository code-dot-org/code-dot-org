# Utility methods for generating certificate images.
# Note: requires pegasus_dir to be in scope.

require 'honeybadger/ruby'
require 'rmagick'
require_relative '../script_constants'

# This method returns a newly-allocated Magick::Image object.
# NOTE: the caller MUST ensure image#destroy! is called on the returned image object to avoid memory leaks.
def create_certificate_image2(image_path, name, params={})
  # Load the certificate template
  background = Magick::Image.read(image_path).first
  font = "Times bold"
  color = "#575757"
  pointsize = 68
  x_offset = params[:x] || 0
  y_offset = params[:y] || 0
  apply_text(background, name, pointsize, font, color, x_offset, y_offset)
  background
end

# applies the given text to the given image object.
def apply_text(image, text, pointsize, font, color, x_offset, y_offset)
  # If there is no text, don't try to render it.
  return if text.nil? || text.strip.empty?
  text = escape_image_magick_string(text)

  begin
    # The text will be put into an image with a transparent background.  This
    # uses 'pango', the OS's text layout engine, in order to dynamically select
    # the correct font. This is important for handling non-latin languages.
    text_overlay = Magick::Image.read("pango:#{text}") do
      # pango:markup is set to false in order to easily prevent pango markup
      # injection from user input.
      define('pango', 'markup', false)
      self.background_color = 'none'
      self.pointsize = pointsize
      self.font = font
      self.fill = color
      # Limit the size of the text_overlay to the size of the background image.
      self.size = "#{image.columns}x#{image.rows}"
    end.first
  rescue Magick::ImageMagickError => exception
    # We want to know what kinds of text we are failing to render.
    Honeybadger.notify(
      exception,
      context: {
        text: text,
      }
    )
    # We can't render the text, so return without applying a transformation.
    return
  end

  return unless text_overlay
  text_overlay.trim!

  # Combine the text image on top of the certificate template image
  image.composite!(text_overlay, Magick::CenterGravity, x_offset, y_offset, Magick::OverCompositeOp)

  # Free the memory in order to avoid memory leaks (images are stored in /tmp
  # until destroyed)
  text_overlay.destroy!
end

# This method returns a newly-allocated Magick::Image object.
# NOTE: the caller MUST ensure image#destroy! is called on the returned image object to avoid memory leaks.
def create_workshop_certificate_image(image_path, fields)
  background = Magick::Image.read(image_path).first

  fields.each do |field|
    string = field[:string].to_s
    next if string.empty?

    y = field[:y] || 0
    x = field[:x] || 0
    pointsize = field[:pointsize] || 70

    apply_text(background, string, pointsize, 'Times bold', 'rgb(87,87,87)', x, y)
  end

  background
end

# Prepare the given string for using in Image Magick.
def escape_image_magick_string(string)
  string = string.dup.force_8859_to_utf8
  # Escape special Image Magick symbols \, @, %, and \n
  # Note we are using the gsub block replacement in order to avoid having to do
  # extra '\' escaping. Otherwise we would have to write '\\\\\\' to insert two
  # backslashes into the string. Using the block replacement results in normal
  # string behavior: '\\\\' results in a string with two backslashes. See the
  # String.gsub docs for more details.  This is for the sake of readable code.
  # literal \ replaced with literal \\
  string = string.gsub(/\\/) {'\\\\'}
  # @ at the front of the string replaced with literal \@
  string = string.gsub(/^@/) {'\\@'}
  # % replaced with literal \%
  string = string.gsub(/%/) {'\\%'}
  # new-line character replaced with literal \\n
  string = string.gsub(/\n/) {'\\\\n'}
  string.strip
end

# This method returns a newly-allocated Magick::Image object.
# NOTE: the caller MUST ensure image#destroy! is called on the returned image object to avoid memory leaks.
def create_course_certificate_image(name, course=nil, sponsor=nil, course_title=nil)
  name = ' ' if name.nil? || name.empty?

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
    apply_text(image, name, 75, 'Helvetica bold', 'rgb(118,101,160)', 0, -141)
    apply_text(image, course_title, 47, 'Helvetica bold', 'rgb(29,173,186)', 0, 11)
  end

  unless sponsor
    weight = SecureRandom.random_number
    donor = DB[:cdo_donors].all.find {|d| d[:twitter_weight_f] - weight >= 0}
    sponsor = donor[:name_s]
  end

  # Note certificate_sponsor_message is in both the Dashboard and Pegasus string files.
  sponsor_message = I18n.t('certificate_sponsor_message', sponsor_name: sponsor)
  apply_text(image, sponsor_message, 18, 'Times bold', 'rgb(87,87,87)', 0, 447)
  image
end

def hoc_course?(course)
  hoc_course = ScriptConstants.script_in_category?(:hoc, course)
  hoc_course ||= Tutorials.new(:tutorials).contents("").any? {|tutorial| tutorial[:code] == course}
  hoc_course
end

def prefilled_title_course?(course)
  hoc_course?(course) || ScriptConstants.script_in_category?(:twenty_hour, course)
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
  if hoc_course?(course)
    if ScriptConstants.script_in_category?(:minecraft, course)
      if course == ScriptConstants::MINECRAFT_HERO_NAME
        'MC_Hour_Of_Code_Certificate_Hero.png'
      elsif course == ScriptConstants::MINECRAFT_AQUATIC_NAME
        'MC_Hour_Of_Code_Certificate_Aquatic.png'
      else
        'MC_Hour_Of_Code_Certificate.png'
      end
    elsif course == 'mee'
      'MC_Hour_Of_Code_Certificate_mee.png'
    elsif course == ScriptConstants::OCEANS_NAME
      'oceans_hoc_certificate.png'
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
