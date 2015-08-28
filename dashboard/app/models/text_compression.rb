class TextCompression < Widget
  serialized_attrs %w(
    poems
    dictionary
  )

  before_validation do
    self.href = 'text-compression/text-compression.html'
  end
end
