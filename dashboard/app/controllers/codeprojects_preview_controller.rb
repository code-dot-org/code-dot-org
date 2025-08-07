class CodeprojectsPreviewController < ApplicationController
  skip_before_action :verify_authenticity_token
  # Public preview page, static content for now.
  def show
    render 'show', layout: false
  end
end
