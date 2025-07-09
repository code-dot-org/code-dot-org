class CodeDiffsController < ApplicationController
  def get_code_difference_summary
    response = OpenaiEvaluateHelper.summarize_diff(
      code_diff_params[:old_code], code_diff_params[:new_code]
    )
    puts
    puts
    puts "Response from OpenAI: #{response.inspect}"
    puts
    puts
    return render(status: response[:status], json: response[:json])
  end

  private def code_diff_params
    params.permit(
      :oldCode,
      :newCode
    ).transform_keys {|key| key.to_s.underscore.to_sym}
  end
end
