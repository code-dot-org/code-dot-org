require "cdo/job_with_results"

class AichatSafetyJob < JobWithResults
  queue_as :default

  @@timeout_s = 15

  def perform(prompt:)
    results = PythonVenv.run_python_block(args_dict: {prompt: prompt}) do |args_dict|
      <<~PYTHON
        from pycdo.aichat.safety import is_prompt_safe
        _return(is_prompt_safe(**#{args_dict}))
      PYTHON
    end

    # Eventually:
    # pyimport "pycdo.aichat.safety", as: :safety
    # safety.is_prompt_safe(prompt: prompt)

    write_results(results)
  end
end
