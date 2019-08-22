require 'cdo/firehose'

# Configure I18n instrumentation to log calls to I18n.t to firehose.
#
# Can be disabled via DCDO flags
#
# see https://github.com/lumoslabs/i18n-instrument for more
I18n::Instrument.configure do |config|
  config.on_record do |params|
    # The first "entry" in the key is always the locale; this is redundant for
    # our purposes since we want to be able to track string usage across
    # locales, so the first thing we do is pull that out
    i18n_key = params[:key].
      split(I18n.default_separator).
      drop(1).
      join(I18n.default_separator)

    FirehoseClient.instance.put_record(
      study: 'dashboard_translation_coverage',
      event: 'lookup',
      data_string: i18n_key,
      data_json: params.to_json
    )
  end

  config.on_check_enabled do
    DCDO.get('i18n_instrumentation_enabled', true)
  end
end
