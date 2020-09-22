class ProfanityController < ApplicationController
  before_action :authenticate_user!

  # POST /profanity/find
  # @param [String] params[:text] String to test
  # @param [String] params[:language] Language of the text to test
  # @param [Boolean] params[:should_cache] Whether or not we should use the cache on this request
  # @returns [Array<String>|nil] Profane words within the given string
  def find
    profanity_result = []
    unless params[:text].nil?
      if params[:should_cache]
        cache_key = "profanity/#{params[:language] || request.locale}/#{params[:text]}"
        profanity_result = Rails.cache.fetch(cache_key) do
          ProfanityFilter.find_potential_profanities(params[:text], params[:language] || request.locale)
        end
      else
        profanity_result = ProfanityFilter.find_potential_profanities(params[:text], params[:language] || request.locale)
      end
    end
    render json: profanity_result
  end
end
