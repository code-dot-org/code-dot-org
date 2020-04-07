class ProfanityController < ApplicationController
  # POST /profanity/find
  # @param [String] params[:text] String to test
  # @returns [Array<String>|nil] Profane words within the given string
  def find
    render json: ProfanityFilter.find_potential_profanities(params[:text] || "", request.locale)
  end
end
