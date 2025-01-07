require 'cdo/i18n'

def language_dir_class(locale = request.locale)
  Cdo::I18n.locale_direction(locale)
end
