class ExternalDSL < ContentDSL
  def initialize
    @hash = {href: '', options: {skip_dialog: true}}
  end

  def self.non_i18n_fieldnames
    super + %w(href)
  end
end
