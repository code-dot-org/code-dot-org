require 'json'

class AiObservabilityController < ApplicationController
  include LangfuseHelper

  def add_internal_ai_tutor_dataset_item
    dataset_item = JSON.parse(request.body.read)
    dataset_item['datasetName'] = 'raw-wonky-ai-responses'
    response = LangfuseHelper.add_dataset_item(dataset_item)
    return render(status: response[:status], json: response[:json])
  end
end