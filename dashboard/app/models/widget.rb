class Widget < Level
  serialized_attrs %w(
    href
    skip_dialog
  )

  before_validation do
    self.skip_dialog = true
  end
end
