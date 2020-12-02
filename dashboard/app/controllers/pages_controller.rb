class PagesController < ApplicationController
  def show
    if valid_page?(params[:page])
      render template: "pages/#{params[:page]}"
    else
      render_404
    end
  end

  def valid_page?(page)
    File.exist?(Pathname.new(Rails.root + "app/views/pages/#{page}.html.haml"))
  end
end
