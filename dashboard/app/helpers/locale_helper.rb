module LocaleHelper
  # Symbol of best valid locale code to be used for I18n.locale.
  def locale
    current = request.env['cdo.locale']
    # if(current_user && current_user.locale != current)
    #   TODO: Set language cookie and reload the page.
    # end
    current.to_sym
  end

  def locale_dir
    Dashboard::Application::LOCALES[locale.to_s][:dir] || 'ltr'
  end

  # String representing the 2 letter language code.
  # Prefer full locale with region where possible.
  def language(locale_code = locale)
    locale_code.to_s.split('-').first
  end

  # String representing the Locale code for the Blockly client code.
  def js_locale(locale_code = locale)
    locale_code.to_s.downcase.tr('-', '_')
  end

  def options_for_locale_select
    options = []
    Dashboard::Application::LOCALES.each do |locale, data|
      next unless I18n.available_locales.include?(locale.to_sym) && data.is_a?(Hash)
      name = data[:native]
      name = (data[:debug] ? "#{name} DBG" : name)
      options << [name, locale]
    end
    options
  end

  def options_for_locale_code_select
    options = []
    I18n.available_locales.each do |locale|
      options << [locale, locale]
    end
    options
  end

  # Returns an Array of supported locale codes.
  def accepted_locales
    @accepted_locales ||= I18n.available_locales.map(&:to_s)
  end

  # Strips regions off of accepted_locales.
  def accepted_languages
    @accepted_languages ||= accepted_locales.map do |locale|
      language(locale)
    end.uniq
  end

  # Looks up a localized string driven by a database value.
  # See config/locales/data.en.yml for details.
  def data_t(dotted_path, key, default = nil)
    # Escape separator in provided key to support keys containing dot characters.
    try_t(
      key,
      scope: ['data'] + dotted_path.split('.'),
      separator: I18n::Backend::Flatten::SEPARATOR_ESCAPE_CHAR,
      default: default
    )
  end

  # Looks up a localized string driven by a database value.
  # See config/locales/data.en.yml for details.
  def data_t_suffix(dotted_path, key, suffix, options = {})
    I18n.t("data.#{dotted_path}.#{key}.#{suffix}", **options)
  end

  # Tries to access translation, returning nil if not found
  def try_t(dotted_path, params = {})
    I18n.t(dotted_path, **{raise: true}.merge(params))
  rescue
    nil
  end

  def i18n_dropdown
    # NOTE UTF-8 is not being enforced for this form. Do not modify it to accept
    # user input or to persist data without also updating it to enforce UTF-8
    form_tag(locale_url, method: :post, id: 'localeForm', style: 'margin-bottom: 0px;', enforce_utf8: false) do
      (hidden_field_tag :user_return_to, request.url) + (select_tag :locale, options_for_select(options_for_locale_select, locale), onchange: 'this.form.submit();')
    end
  end
end
