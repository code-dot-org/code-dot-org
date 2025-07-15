class PreviewController < ApplicationController
  layout false

  # Public preview page, static content
  def show
    render 'preview/show'
  end
end
