class CongratsController < ApplicationController
  def index
    view_options(full_width: true, responsive_content: true, has_i18n: true)

    @is_english = request.language == 'en'
    @random_donor_twitter = get_random_donor_twitter
  end
end
