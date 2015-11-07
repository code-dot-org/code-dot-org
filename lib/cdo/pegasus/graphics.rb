require 'rmagick'

MAX_DIMENSION = 2880

def load_manipulated_image(path, mode, width, height = nil)

  width = [MAX_DIMENSION, width].min
  height = [MAX_DIMENSION, height].min if height

  case mode
  when :fill
    Magick::Image.read(path).first.resize_to_fill(width, height)
  when :fit
    Magick::Image.read(path).first.resize_to_fit(width, height)
  when :resize
    height ||= width
    Magick::Image.read(path).first.resize(width, height)
  else
    nil
  end
end

def process_image(path, ext_names, max_age, language=nil, site=nil)
  extname = File.extname(path).downcase
  return nil unless ext_names.include?(extname)
  image_format = extname[1..-1]

  basename = File.basename(path, extname)
  dirname = File.dirname(path)

  # Manipulated?
  if dirname =~ /\/(fit-|fill-)?(\d+)x?(\d*)$/ || dirname =~ /\/(fit-|fill-)?(\d*)x(\d+)$/
    manipulation = File.basename(dirname)
    dirname = File.dirname(dirname)
  end

  # Assume we are returning the same resolution as we're reading.
  retina_in = retina_out = basename[-3..-1] == '_2x'

  path = nil
  if ['hourofcode.com', 'translate.hourofcode.com'].include?(site)
    path = resolve_image File.join(language, dirname, basename), ext_names
  end
  path ||= resolve_image File.join(dirname, basename), ext_names
  unless path
    # Didn't find a match at this resolution, look for a match at the other resolution.
    if retina_out
      basename = basename[0...-3]
      retina_in = false
    else
      basename += '_2x'
      retina_in = true
    end
    path = resolve_image File.join(dirname, basename), ext_names
  end
  return nil unless path # No match at any resolution.

  output = {
    cache_control: [:public, :must_revalidate, max_age: max_age],
    last_modified: File.mtime(path),
    content_type: image_format.to_sym,
  }

  if ((retina_in == retina_out) || retina_out) && !manipulation && File.extname(path) == extname
    # No [useful] modifications to make, return the original.
    return output.merge(file: path)
  else
    image = Magick::Image.read(path).first

    mode = :resize

    if manipulation
      matches = manipulation.match /(?<mode>fit-|fill-)?(?<width>\d*)x?(?<height>\d*)$/m
      mode = matches[:mode][0...-1].to_sym unless matches[:mode].blank?
      width = matches[:width].to_i unless matches[:width].blank?
      height = matches[:height].to_i unless matches[:height].blank?

      if retina_out
        # Manipulated images always specify non-retina sizes in the manipulation string.
        width *= 2 if width
        height *= 2 if height
      end
    else
      width = image.columns
      height = image.rows

      # Retina sources need to be downsampled for non-retina output
      if retina_in && !retina_out
        width /= 2
        height /= 2
      end
    end
  end

  case mode
    when :fill
      # If only one dimension provided, assume a square
      width ||= height
      image = image.resize_to_fill(width, height)
    when :fit
      image = image.resize_to_fit(width, height)
    when :resize
      # If only one dimension provided, assume a square
      height ||= width
      width ||= height
      image = image.resize(width, height)
    else
      raise StandardError, 'Unreachable code reached!'
  end

  image.format = image_format
  output.merge(content: image.to_blob)
end

def resolve_image(uri, ext_names)
  ext_names.each do |extname|
    path = deploy_dir("#{uri}#{extname}")
    return path if File.file?(path)
  end
  nil
end
