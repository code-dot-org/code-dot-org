require 'sinatra/base'

class VarnishEnvironment < Sinatra::Base

  def self.load_supported_locales
    Dir.glob(pegasus_dir('cache', 'i18n', '*.yml')).map do |i|
      File.basename(i, '.yml').downcase
    end.sort
  end

  configure do
    set :locales_supported, load_supported_locales
  end

  before do
    env['cdo.locale'] = varnish_locale || cookie_locale || default_locale
  end

  after do
  end

  helpers do
    def varnish_locale
      language_to_locale(request.env['HTTP_X_VARNISH_ACCEPT_LANGUAGE'])
    end

    def cookie_locale
      language_to_locale(request.cookies['language_'])
    end

    def default_locale
      'en-US'
    end

    def language_to_locale(language)
      case language
      when 'en'
        return 'en-US'
      when 'es'
        return 'es-ES'
      when 'fa'
        return 'fa-IR'
      else
        language = language.to_s.downcase
        return nil unless locale = settings.locales_supported.find{|i| i==language || i.split('-').first==language}
        parts = locale.split('-')
        return "#{parts[0].downcase}-#{parts[1].upcase}"
      end
    end
  end

end
