# Utility methods for generating certificate images.
# Note: requires pegasus_dir to be in scope.
require 'honeybadger/ruby'
require 'rmagick'
# needed for force_8859_to_utf8
require 'cdo/pegasus/string'

# The area in pixels under the "Certificate of Completion" on the certificate reserved for the name.
CERT_NAME_AREA_WIDTH = 900
CERT_NAME_AREA_HEIGHT = 80

CERTIFICATE_COURSE_TYPES = {
  HOC: 'hoc',
  PL: 'pl',
  ACCELERATED: 'accelerated',
  OTHER: 'other',
}

class CertificateImage
  # This method returns a newly-allocated Magick::Image object.
  # NOTE: the caller MUST ensure image#destroy! is called on the returned image object to avoid memory leaks.
  def self.create_certificate_image2(image_path, name, params = {})
    # Load the certificate template
    background = Magick::Image.read(image_path).first
    font = "Times bold"
    color = "#575757"
    pointsize = 68
    x_offset = params[:x] || 0
    y_offset = params[:y] || 0

    apply_text(background, name, pointsize, font, color, x_offset, y_offset, CERT_NAME_AREA_WIDTH, CERT_NAME_AREA_HEIGHT)
    background
  end

  # Applies the given text to the given image object.
  # The text is shrunk to fit the given width and height.
  #
  # @param [Magick::Image] image is the background to put text on.
  # @param [String] text is the string to add to the image.
  # @param [Integer] pointsize is the max size to display the text at.
  # @param [String] font to use e.g. 'Helvetica bold'
  # @param [String] color of the text e.g. 'rgb(118,101,160)'
  # @param [Integer] x_offset of the position to center the text at.
  # @param [Integer] y_offset of the position to center the text at.
  # @param [Integer] width in pixels of the bounding box for the text.
  # If no width is given, then the text is bound to the width of the background image.
  # @param [Integer] height in pixels of the bounding box for the text.
  # If no height is given, then the text is bound to the height of the background image.
  def self.apply_text(image, text, pointsize, font, color, x_offset, y_offset, width = nil, height = nil)
    # If there is no text, don't try to render it.
    return if text.nil? || text.strip.empty?
    # If there is no background image, there is nothing to do.
    return if image.nil?

    text = escape_image_magick_string(text)
    # If no bounding box given, default to the background image width & height.
    width ||= image.columns
    height ||= image.rows

    begin
      # The text will be put into an image with a transparent background.  This
      # uses 'pango', the OS's text layout engine, in order to dynamically select
      # the correct font. This is important for handling non-latin languages.
      # The text_overlay is first generated at full size and then resized to fit
      # the given bounding box width & height.
      text_overlay = Magick::Image.read("pango:#{text}") do |img|
        # pango:markup is set to false in order to easily prevent pango markup
        # injection from user input.
        img.define('pango', 'markup', false)
        # If the text doesn't fit the bounding box, then put a '...' at the end.
        img.define('pango', 'ellipsize', 'end')
        img.background_color = 'none'
        img.pointsize = pointsize
        img.font = font
        img.fill = color
        # Limit the maximum size of content to protect ourselves against extremely large strings.
        # The multiplier represents the max amount the text can be shrunk to fit the given bounds.
        img.size = "#{width * 3}x#{height * 3}"
        # Center the text in the box.
        img.gravity = Magick::CenterGravity
      end.first

      return unless text_overlay
      # remove empty space around the text
      text_overlay.trim!
      # resize the text to fit the given bounding box unless it is already smaller.
      text_overlay.resize_to_fit!(width, height) if text_overlay.columns > width
      # Combine the text image on top of the certificate template image
      image.composite!(text_overlay, Magick::CenterGravity, x_offset, y_offset, Magick::OverCompositeOp)

      # Free the memory in order to avoid memory leaks (images are stored in /tmp
      # until destroyed)
      text_overlay.destroy!
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
  end

  # This method returns a newly-allocated Magick::Image object.
  # NOTE: the caller MUST ensure image#destroy! is called on the returned image object to avoid memory leaks.
  def self.create_workshop_certificate_image(image_path, fields)
    background = Magick::Image.read(image_path).first

    fields.each do |field|
      string = field[:string].to_s
      next if string.empty?

      # The x,y position to center the text at.
      x = field[:x] || 0
      y = field[:y] || 0
      # The width/height in pixels of the bounding box for the text.
      width = field[:width]
      height = field[:height]
      pointsize = field[:pointsize] || 70
      apply_text(background, string, pointsize, 'Times bold', 'rgb(87,87,87)', x, y, width, height)
    end

    background
  end

  # Prepare the given string for using in Image Magick.
  def self.escape_image_magick_string(string)
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
  def self.create_course_certificate_image(name, course = nil, donor_name = nil, course_title = nil, default_random_donor: false)
    name = ' ' if name.blank?

    course ||= ScriptConstants::HOC_NAME

    template_file = certificate_template_for(course)

    path = pegasus_dir('sites.v3', 'code.org', 'public', 'images', template_file)
    if prefilled_title_course?(course)
      # only need to fill in student name
      vertical_offset = course == '20-hour' ? -125 : -120
      image = create_certificate_image2(path, name, y: vertical_offset)
      donor_text_y_offset = 447
    else
      unit_or_unit_group = CurriculumHelper.find_matching_unit_or_unit_group(course)
      image = Magick::Image.read(path).first

      text_constants = {
        'self_paced_pl_certificate.png': {
          name: {
            font_size: 62,
            x_offset: 0,
            y_offset: -248,
            height: 70,
            width: CERT_NAME_AREA_WIDTH,
          },
          two_titles: {
            unit_group_height: 85,
            unit_group_font_size: 62,
            unit_group_x_offset: 0,
            unit_group_y_offset: -57,
            unit_height: 71,
            unit_font_size: 57,
            unit_x_offset: 0,
            unit_y_offset: 36,
          },
          one_title: {
            font_size: 62,
            x_offset: 0,
            y_offset: 0,
            height: 171,
          },
          course_title_width: 1400,
          donor_text_y_offset: 611,
        },
        'blank_certificate.png': {
          name: {
            font_size: 75,
            x_offset: 0,
            y_offset: -135,
            height: CERT_NAME_AREA_HEIGHT,
            width: CERT_NAME_AREA_WIDTH,
          },
          two_titles: {
            unit_group_width: 1000,
            unit_group_height: 50,
            unit_group_font_size: 40,
            unit_group_x_offset: 0,
            unit_group_y_offset: 0,
            unit_width: 800,
            unit_height: 40,
            unit_font_size: 32,
            unit_x_offset: 0,
            unit_y_offset: 47,
          },
          one_title: {
            font_size: 47,
            x_offset: 0,
            y_offset: 15,
            height: 60,
            width: 1000,
          },
          donor_text_y_offset: 447,
        },
      }
      cert_text_constants = text_constants[template_file.to_sym]

      name_constants = cert_text_constants[:name]
      apply_text(image, name, name_constants[:font_size], 'Helvetica bold', 'rgb(118,101,160)', name_constants[:x_offset], name_constants[:y_offset], name_constants[:width], name_constants[:height])

      # When we have a unit within a unit_group, we want to display both the unit and unit_group titles.
      # When we have a standalone unit or the unit group, we only display the localized title of unit_or_unit_group.
      if unit_or_unit_group.is_a?(Unit) && unit_or_unit_group.unit_group.present?
        unit = unit_or_unit_group
        unit_group = unit.unit_group

        course_titles_constants = cert_text_constants[:two_titles]

        apply_text(
          image,
          unit_group.localized_title,
          course_titles_constants[:unit_group_font_size],
          'Helvetica bold',
          'rgb(29,173,186)',
          course_titles_constants[:unit_group_x_offset],
          course_titles_constants[:unit_group_y_offset],
          cert_text_constants[:course_title_width],
          course_titles_constants[:unit_group_height]
        )

        apply_text(
          image,
          unit.localized_title,
          course_titles_constants[:unit_font_size],
          'Helvetica bold',
          'rgb(29,173,186)',
          course_titles_constants[:unit_x_offset],
          course_titles_constants[:unit_y_offset],
          cert_text_constants[:course_title_width],
          course_titles_constants[:unit_height]
        )
      else
        course_titles_constants = cert_text_constants[:one_title]
        apply_text(
          image,
          course_title,
          course_titles_constants[:font_size],
          'Helvetica bold',
          'rgb(29,173,186)',
          course_titles_constants[:x_offset],
          course_titles_constants[:y_offset],
          cert_text_constants[:course_title_width],
          course_titles_constants[:height]
        )
      end

      if template_file == 'self_paced_pl_certificate.png'
        total_minutes = unit_or_unit_group&.duration_in_minutes || 0
        total_hours_to_half_hour = (total_minutes / 30).round / 2.0
        # Round up to half an hour if less than 30 minutes.
        total_hours_to_half_hour = 0.5 if total_hours_to_half_hour == 0
        hours_string = format('%<duration>g', duration: total_hours_to_half_hour)
        apply_text(image, hours_string, 30, 'Times bold', 'rgb(87,87,87)', -248, 124, 80, 30)
      end
      donor_text_y_offset = cert_text_constants[:donor_text_y_offset]
    end

    if default_random_donor && !donor_name
      donor = DashboardCdoDonor.get_random_donor_by_weight
      donor_name = donor[:name_s]
    end

    if donor_name
      # Note certificate_sponsor_message is in both the Dashboard and Pegasus string files.
      sponsor_message = I18n.t('certificate_sponsor_message', sponsor_name: donor_name)
      # The area in pixels which will display the sponsor message.
      sponsor_area_width = 1400
      sponsor_area_height = 35
      apply_text(image, sponsor_message, 18, 'Times bold', 'rgb(87,87,87)', 0, donor_text_y_offset, sponsor_area_width, sponsor_area_height)
    end
    image
  end

  def self.accelerated_course?(course)
    [ScriptConstants::ACCELERATED_NAME, ScriptConstants::TWENTY_HOUR_NAME].include?(course)
  end

  # assume any unrecognized course name is a hoc course
  def self.hoc_course?(course_name)
    course_type(course_name) == CERTIFICATE_COURSE_TYPES[:HOC]
  end

  def self.course_type(course_name)
    return CERTIFICATE_COURSE_TYPES[:ACCELERATED] if accelerated_course?(course_name)

    unit_or_unit_group = CurriculumHelper.find_matching_unit_or_unit_group(course_name)
    course_version = unit_or_unit_group&.get_course_version
    return CERTIFICATE_COURSE_TYPES[:HOC] if course_version&.hoc?
    return CERTIFICATE_COURSE_TYPES[:PL] if course_version&.pl_course?
    return CERTIFICATE_COURSE_TYPES[:OTHER] if course_version
    CERTIFICATE_COURSE_TYPES[:HOC]
  end

  def self.prefilled_title_course?(course)
    return false if %w(blank_certificate.png self_paced_pl_certificate.png).include?(certificate_template_for(course))
    true
  end

  def self.certificate_template_for(course)
    course_type = course_type(course)
    if ScriptConstants.unit_in_category?(:minecraft, course)
      case course
      when ScriptConstants::MINECRAFT_HERO_NAME
        'MC_Hour_Of_Code_Certificate_Hero.png'
      when ScriptConstants::MINECRAFT_AQUATIC_NAME
        'MC_Hour_Of_Code_Certificate_Aquatic.png'
      when ScriptConstants::MINECRAFT_AI_NAME
        'MC_Hour_Of_Code_Certificate_Generation_Ai.png'
      else
        'MC_Hour_Of_Code_Certificate.png'
      end
    elsif course == 'mee'
      'MC_Hour_Of_Code_Certificate_mee.png'
    elsif course == 'mee_empathy'
      'MC_Hour_Of_Code_Certificate_mee_empathy.png'
    elsif course == 'mee_timecraft'
      'MC_Hour_Of_Code_Certificate_mee_timecraft.png'
    elsif course == 'mee_estate'
      'MC_Hour_Of_Code_Certificate_mee_estate.png'
    elsif course == ScriptConstants::OCEANS_NAME
      'oceans_hoc_certificate.png'
    elsif accelerated_course?(course)
      # The 20-hour course is referred to as "accelerated" throughout the
      # congrats and certificate pages (see csf_finish_url).
      '20hours_certificate.jpg'
    elsif course_type == 'hoc'
      'hour_of_code_certificate.jpg'
    elsif course_type == 'pl'
      'self_paced_pl_certificate.png'
    else
      'blank_certificate.png'
    end
  end
end
