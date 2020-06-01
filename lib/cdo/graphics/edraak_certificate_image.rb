# Edraak Specific: Customized copy of original (certificate_image.rb)

def edraak_apply_text(image, text, pointsize, font, color, x_offset, y_offset, width=nil, height=nil, is_rtl=false)
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
    text_overlay = Magick::Image.read("pango:#{text}") do
      # pango:markup is set to false in order to easily prevent pango markup
      # injection from user input.
      define('pango', 'markup', false)

      # If the text doesn't fit the bounding box, then put a '...' at the end.
      define('pango', 'ellipsize', 'end')
      self.background_color = 'none'
      self.pointsize = pointsize
      self.font = font
      # Limit the maximum size of content to protect ourselves against extremely large strings.
      # The multiplier represents the max amount the text can be shrunk to fit the given bounds.
      self.size = "#{width * 3}x#{height * 3}"
      # Center the text in the box.
      self.gravity = Magick::CenterGravity
    end.first

    return unless text_overlay
    # remove empty space around the text
    text_overlay.trim!

    # Change text color
    p = Magick::Pixel.new(0, 0, 0, 65535)
    (0..text_overlay.columns).each do |x|
      (0..text_overlay.rows).each do |y|
        unless text_overlay.pixel_color(x, y) == p
          text_overlay.pixel_color(x, y, color)
        end
      end
    end

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

def edraak_create_course_certificate_image(name, course=nil, sponsor=nil, course_title=nil, lang='ar-SA')
  name = ' ' if name.nil? || name.empty?
  course ||= ScriptConstants::HOC_NAME
  course_title ||= fallback_course_title_for(course)
  font = 'Arial bold'
  image = Magick::Image.read(pegasus_dir('sites.v3', 'code.org', 'public', 'images', 'edraak_certificate.png')).first
  is_rtl = (lang == 'ar-SA')

  x_mid_1 = -300
  x_mid_2 = 1080

  if is_rtl
    text = [
      'شهادة إتمام',
      'مساق',
      '',
      'تم منح شهادة إتمام المساق هذه إلى',
      name,
      'لإتمام المساق التالي بنجاح',
      course_title
    ]

    logo_x_offset = x_mid_1
    image.flop!
  else
    text = [
      'Certificate',
      'of',
      'Completion',
      'This Certificate is Awarded to',
      name,
      'to certify the completion of the course',
      course_title
    ]

    logo_x_offset = x_mid_1 * -1
  end

  edraak_apply_text(image, text[3], 60, font, 'rgb(0,0,0)', x_mid_1, -200, 2100, 80, is_rtl)
  edraak_apply_text(image, text[4], 90, font, 'rgb(61,177,171)', x_mid_1, 0, 2100, 80, is_rtl)
  edraak_apply_text(image, text[5], 60, font, 'rgb(0,0,0)', x_mid_1, 200, 2100, 80, is_rtl)
  edraak_apply_text(image, text[6], 120, font, 'rgb(61,177,171)', x_mid_1, 450, 2100, 80, is_rtl)

  edraak_apply_text(image, text[0], 48, font, 'rgb(255,255,255)', x_mid_2, -500, 272, 80, is_rtl)
  edraak_apply_text(image, text[1], 48, font, 'rgb(255,255,255)', x_mid_2, -420, 272, 80, is_rtl)
  edraak_apply_text(image, text[2], 48, font, 'rgb(255,255,255)', x_mid_2, -340, 272, 80, is_rtl)

  edraak_logo = Magick::Image.read(pegasus_dir('sites.v3', 'code.org', 'public', 'images', 'edraak_logo.png')).first
  edraak_logo.gravity = Magick::CenterGravity
  edraak_logo.resize_to_fit!(750, 350)
  image.composite!(edraak_logo, Magick::CenterGravity, logo_x_offset, -770, Magick::OverCompositeOp)

  image
end
