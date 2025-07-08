class CodeDiffsController < ApplicationController
  def get_code_difference_summary
    puts "code_diff_params:"
    puts code_diff_params
    puts
    response = OpenaiEvaluateHelper.summarize_diff(
      code_diff_params[:oldCode], code_diff_params[:newCode]
    )
    puts
    puts
    puts "Response from OpenAI: #{response.inspect}"
    puts
    puts
    if response[:status] == :success
      response[:json]['content']
    else
      Rails.logger.error("Error summarizing code difference: #{response[:error]}")
      nil
    end
  end

  private def code_diff_params
    params.permit(
      :oldCode,
      :newCode
    ).transform_keys {|key| key.to_s.underscore.to_sym}
  end
end
