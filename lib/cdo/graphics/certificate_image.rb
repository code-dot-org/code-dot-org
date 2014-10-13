require 'RMagick'

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
