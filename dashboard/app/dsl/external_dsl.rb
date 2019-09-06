class ExternalDSL < ContentDSL
  def initialize
    @hash = {href: '', options: {skip_dialog: true}}
  end

  def i18n_strings
    strings = super
    strings['markdown'] = @hash[:markdown] unless @hash[:markdown].blank?
    strings
  end
end
