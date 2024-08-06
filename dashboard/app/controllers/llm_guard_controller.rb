class LlmGuardController < ApplicationController
  def index
    @prompt = "I really appreciate your holp."
  end

  def check_prompt
    #puts PyCall.inspect
    @prompt = params[:prompt]
    @is_toxic = PyCDO.lock_python_gil do
      llmguard = PyCall.import_module('pycdo.genai.llmguard')
      llmguard.is_prompt_toxic(@prompt)
    end
    render :index
  end
end
