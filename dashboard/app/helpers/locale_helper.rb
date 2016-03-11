module LocaleHelper

  # Symbol of best valid locale code to be used for I18n.locale.
  def locale
    current = request.env['cdo.locale']
    #if(current_user && current_user.locale != current)
      # TODO: Set language cookie and reload the page.
    #end
    current.downcase.to_sym
  end

  def locale_dir
    Dashboard::Application::LOCALES[locale.to_s][:dir] || 'ltr'
  end

  # String representing the 2 letter language code.
  # Prefer full locale with region where possible.
  def language
    locale.to_s.split('-').first
  end

  # String representing the Locale code for the Blockly client code.
  def js_locale
    locale.to_s.downcase.gsub('-', '_')
  end

  def options_for_locale_select
    options = []
    Dashboard::Application::LOCALES.each do |locale, data|
      if I18n.available_locales.include?(locale.to_sym) && data.is_a?(Hash)
        name = data[:native]
        name = (data[:debug] ? "#{name} DBG" : name)
        options << [name, locale]
      end
    end
    options
  end

  private

  # Parses and ranks locale code strings from the Accept-Language header.
  def accepted_locales
    header = request.env.fetch('HTTP_X_VARNISH_ACCEPT_LANGUAGE', '')
    begin
      locale_codes = header.split(',').map do |entry|
        locale, weight = entry.split(';')
        weight = (weight || 'q=1').split('=')[1].to_f
        [locale, weight]
      end
      locale_codes.sort_by { |_, weight| -weight }.map { |locale, _| locale.strip }
    rescue
      Logger.warn "Error parsing Accept-Language header: #{header}"
      []
    end
  end

  # Strips regions off of accepted_locales.
  def accepted_languages
    accepted_locales.map { |locale| locale.split('-')[0] }
  end

  # Looks up a localized string driven by a database value.
  # See config/locales/data.en.yml for details.
  def data_t(dotted_path, key)
    try_t("data.#{dotted_path}").try(:[], key.to_sym)
  end

  # Looks up a localized string driven by a database value.
  # See config/locales/data.en.yml for details.
  def data_t_suffix(dotted_path, key, suffix, options = {})
    I18n.t("data.#{dotted_path}.#{key}.#{suffix}", options)
  end

  # Tries to access translation, returning nil if not found
  def try_t(dotted_path, params = {})
    I18n.t(dotted_path, {raise: true}.merge(params)) rescue nil
  end

  def serve_fonts?
    Dashboard::Application::LOCALES[locale.to_s].fetch(:webfonts, true)
  end

  def i18n_dropdown
    form_tag(locale_url, method: :post, id: 'localeForm', style: 'margin-bottom: 0px;') do
      (hidden_field_tag :return_to, request.url) + (select_tag :locale, options_for_select(options_for_locale_select, locale), onchange: 'this.form.submit();')
    end
  end

end
