class MusiclabController < ApplicationController
  ANALYTICS_KEY = CDO.amplitude_api_key

  def index
    view_options(no_footer: true, full_width: true)
    @body_classes = "music-black"
  end

  def menu
    view_options(full_width: true, responsive_content: true, no_padding_container: true)
  end

  # TODO: This is a temporary addition to serve the analytics API key
  # specifically for Music Lab. When we start using Amplitude for other
  # applications, we should create a dedicated controller/util that serves
  # API keys for various analytics projects, not just Music Lab.
  # We may also need to move the Amplitude analytics reporting
  # client to the back-end to avoid exposing keys (as we are currently).

  # GET /musiclab/analytics_key
  def get_analytics_key
    render(json: {key: ANALYTICS_KEY})
  end
end
