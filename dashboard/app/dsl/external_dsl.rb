class ExternalDSL < ContentDSL
  def initialize
    @hash = {href: '', options: {skip_dialog: true}}
  end

  def associated_blocks(text)
    @hash[:associated_blocks] = text
  end

  # @override
  def self.i18n_fields
    # external levels do not actually render their 'title' property, for
    # whatever reason, so we actually want to _exclude_ that field from super
    super - %w(title)
  end
end
