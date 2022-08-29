class ContinuousIntegrationTestEnvironment < ContinuousIntegrationEnvironment
  def notify_success
    if CDO.test_system?
      ChatClient.log "<@#{DevelopersTopic.dotd}> DTT finished", color: 'purple'
      mark_dtt_green
    end
  end

  def check_test_flakiness_test_env
    if CDO.test_system?
      tests_over_flake_threshold = `./bin/test_flakiness -x 0.2`
      flake_factor_message = {}
      if tests_over_flake_threshold.empty?
        flake_factor_message[:color] = 'green'
        flake_factor_message[:message] = "Hooray! There are no UI tests over 0.2 flakiness."
      else
        flake_factor_message[:color] = 'red'
        flake_factor_message[:message] = "Tests exceeding 0.2 flakiness threshold: <br/><pre>#{tests_over_flake_threshold}</pre><br/><br/> Please ensure these tests are being investigated!"
      end
      ChatClient.log flake_factor_message[:message], color: flake_factor_message[:color]
    end
  end
end
