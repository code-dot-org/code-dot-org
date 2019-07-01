require 'cdo/firehose'

I18n::Instrument.configure do |config|
  config.on_lookup do |key, value|
    unless value.blank?
      key_parts = key.split('.')
      #puts "Looked up i18n key #{key_parts[1..-1].join('.')} and got value #{value} for locale #{I18n.locale.to_s}, translation key is #{key_parts[0]}"
      FirehoseClient.instance.put_record(
        study: 'dashboard_translation_coverage',
        locale: I18n.locale.to_s,
        translation_locale: key_parts[0],
        data: {
          i18n_key: key_parts[1..-1]
        }
      )
    end
  end

  #config.on_record do |params|
  #  puts params.inspect
  #end

  config.on_check_enabled do
    true
  end
end
