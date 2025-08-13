class CodeprojectsPreviewController < ApplicationController
  # Public preview page, static content for now.
  def show
    render 'show', layout: false
  end
end
