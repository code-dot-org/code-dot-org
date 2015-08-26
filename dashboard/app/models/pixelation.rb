class Pixelation < Widget
  serialized_attrs %w(
    version
    data
    hex
  )

  before_validation do
    self.href = 'pixelation/pixelation.html'
  end
end
