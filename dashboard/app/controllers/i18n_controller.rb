class I18nController < ApplicationController
  # The max number of i18n string keys which can be recorded in one request.
  # This is to protect us from malicious API calls where thousands or millions of items are given in a single request.
  # It doesn't stop us from receiving it, but it does stop us from doing anything with it.
  I18N_KEY_COUNT_LIMIT = 500

  # POST /i18n/track_string_usage
  # Records the given i18n string usage information
  # {
  #   'string_keys': ['stringkey1', ...],
  #   'url': 'https://code.org/some/page',
  #   'source': 'maze',
  # }
  # string_keys [Array[String]] The i18n string keys which were used and need to be recorded.
  # url [String] The URL where the i18n strings were used.
  # source [String] Context for where the i18n strings came from.
  def track_string_usage
    string_keys = params.require(:string_keys)
    url = params.require(:url)
    source = params.require(:source)

    # Limit the number of strings we will handle in one call.
    return render status: :bad_request, json: {error: 'Too many strings.'}  if string_keys.count > I18N_KEY_COUNT_LIMIT

    string_keys.each do |string_key|
      I18nStringUrlTracker.instance.log(string_key, url, source)
    end

    head :ok
  end
end
