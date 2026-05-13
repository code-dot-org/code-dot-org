class PortfolioController < ApplicationController
  before_action :authenticate_user!

  def show
    view_options(full_width: true, responsive_content: true)
    display_name = current_user.name.presence || current_user.username
    @portfolio_page_data = {userName: display_name}
    @page_title = "#{display_name}'s Aha! Moments"
  end
end
