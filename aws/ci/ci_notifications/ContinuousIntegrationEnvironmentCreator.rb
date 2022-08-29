class ContinuousIntegrationEnvironmentCreator
  def create(environment)
    case environment
    when :levelbuilder
      get_ci_level_builder_environment
    when :production
      get_ci_production_environment
    when :test
      get_ci_test_environment
    end
  end

  private

  def get_ci_test_environment
    @@test_notificator ||= ContinuousIntegrationTestEnvironment
  end

  def get_ci_production_environment
    @@production_notificator ||= ContinuousIntegrationProductionEnvironment
  end

  def get_ci_level_builder_environment
    @@level_builder_notificator ||= ContinuousIntegrationLevelBuilderEnvironment
  end
end
