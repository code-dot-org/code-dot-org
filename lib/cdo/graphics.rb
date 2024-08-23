require 'rmagick'
MAX_DIMENSION = 2880

# This method returns a newly-allocated Magick::ImageList object.
# NOTE: the caller MUST ensure image#destroy! is called on each returned image object to avoid memory leaks.
def load_manipulated_image(path, mode, width, height, scale = nil)
  ilist = Magick::ImageList.new.read(path)
  ilist.to_a.each do |image|
    # If only one dimension provided, assume a square
    height ||= width
    width ||= height

    # If both dimensions are nil, assume the original image dimension
    width ||= image.columns
    height ||= image.rows

    if scale
      width *= scale
      height *= scale
    end

    width = [MAX_DIMENSION, width].min
    height = [MAX_DIMENSION, height].min

    case mode
    when :fill
      image.resize_to_fill!(width, height)
    when :fit
      image.resize_to_fit!(width, height)
    when :resize
      image.resize!(width, height)
    else
      nil
    end
  end
  ilist
end

def process_image(path, ext_names, language = nil, site = nil)
  extname = File.extname(path).downcase
  return nil unless ext_names.include?(extname)
  image_format = extname[1..]

  basename = File.basename(path, extname)
  dirname = File.dirname(path)

  mode = :resize
  width = nil
  height = nil
  manipulated = false

  # Manipulated?
  if (m = dirname.match /^(?<basedir>.*)\/(?<mode>fit-|fill-)?(?<width>\d*)x?(?<height>\d*)(\/(?<dir>.*))?$/m)
    mode = m[:mode][0..-2].to_sym unless m[:mode].nil_or_empty?
    width = m[:width].to_i unless m[:width].nil_or_empty?
    height = m[:height].to_i unless m[:height].nil_or_empty?
    manipulated = width || height
    dirname = File.join(m[:basedir].to_s, m[:dir].to_s)
  end

  # Assume we are returning the same resolution as we're reading.
  retina_in = retina_out = basename[-3..] == '_2x'

  path = nil
  if site == 'hourofcode.com'
    path = resolve_image File.join(language, dirname, basename)
  end
  path ||= resolve_image File.join(dirname, basename)
  unless path
    # Didn't find a match at this resolution, look for a match at the other resolution.
    if retina_out
      basename = basename[0...-3]
      retina_in = false
    else
      basename += '_2x'
      retina_in = true
    end
    path = resolve_image File.join(dirname, basename)
  end
  return nil unless path # No match at any resolution.
  output = {
    last_modified: File.mtime(path),
    content_type: image_format.to_sym,
  }

  if (retina_out || !retina_in) && !manipulated && File.extname(path) == extname
    # No [useful] modifications to make, return the original.
    return output.merge(file: path)
  end

  scale = 1
  if manipulated
    # Manipulated images always specify non-retina sizes in the manipulation string.
    scale = 2 if retina_out
  else
    # Retina sources need to be downsampled for non-retina output
    scale = 0.5 if retina_in && !retina_out
  end

  begin
    image_list = load_manipulated_image(path, mode, width, height, scale)
    image_blob = image_list.to_blob do |img|
      img.format = image_format
      if CDO.image_optim && %w(jpg jpeg).include?(image_format)
        img.compression = Magick::LosslessJPEGCompression
        img.quality = 100
      else
        img.quality = 90
      end
    end
    output.merge(content: image_blob)
  ensure
    image_list&.to_a&.map(&:destroy!)
  end
end

def optimize_image(blob)
  image = Magick::Image.from_blob(blob).first
  image.to_blob {self.quality = 85}
ensure
  image&.destroy!
end
