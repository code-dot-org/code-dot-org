class CongratsController < ApplicationController
  def index
    view_options(full_width: true, responsive_content: true, has_i18n: true)

    # Select two different donors, because the first must have a twitter
    # handle and the second must be equally weighted across all donors.
    @random_donor_twitter = CdoDonor.get_random_donor_twitter
    @random_donor_name = CdoDonor.get_random_donor_name
  end
end
