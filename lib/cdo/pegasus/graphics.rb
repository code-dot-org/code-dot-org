require 'RMagick'
require 'image_optim'

def load_manipulated_image(path,mode,format,width,height=nil)
  image = case mode
  when :fill
    Magick::Image.read(path).first.resize_to_fill(width, height)
  when :fit
    Magick::Image.read(path).first.resize_to_fit(width, height)
  when :resize
    height ||= width
    Magick::Image.read(path).first.tap{|x|x.resize(width, height) if width > 0}
  else
    nil
  end
  image.format = format
  blob = image.to_blob
  ImageOptim.new({:pngquant => {:quality => 70..85}, :jpegrecompress => {:quality => 0}}).optimize_image_data(blob)
end
