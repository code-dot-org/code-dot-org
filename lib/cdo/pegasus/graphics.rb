require 'RMagick'

def load_manipulated_image(path,mode,width,height=nil)
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
