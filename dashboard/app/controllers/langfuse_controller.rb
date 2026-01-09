require 'json'

class LangfuseController < ApplicationController
  include LangfuseHelper

  def add_dataset_item
    dataset_item = JSON.parse(request.body.read)
    response = LangfuseHelper.add_dataset_item(dataset_item)
    return render(status: response[:status], json: response[:json])
  end

  def get_prompt
    prompt_name = prompt_params[:name]
    response = LangfuseHelper.fetch_prompt(prompt_name)
    return render(status: response[:status], json: response[:json])
  end

  private def prompt_params
    params.permit(:name)
  end
end
