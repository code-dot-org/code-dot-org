require 'json'

class LangfuseController < ApplicationController
  include LangfuseHelper

  def get_prompt
    prompt_name = prompt_params[:name]
    response = LangfuseHelper.fetch_prompt(prompt_name)
    return render(status: response[:status], json: response[:json])
  end

  private def prompt_params
    params.permit(:name)
  end
end
