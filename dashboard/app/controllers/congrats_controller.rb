class CongratsController < ApplicationController
  def index
    @is_english = request.language == 'en'
  end
end
