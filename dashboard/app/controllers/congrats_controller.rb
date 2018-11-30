class CongratsController < ApplicationController
  def index
    view_options(full_width: true, responsive_content: true, has_i18n: true)

    @random_donor_twitter = get_random_donor_twitter
  end
end
