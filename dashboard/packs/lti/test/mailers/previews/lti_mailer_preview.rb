class LtiMailerPreview < ActionMailer::Preview
  include FactoryBot::Syntax::Methods

  def lti_integration_confirmation
    LtiMailer.lti_integration_confirmation("admin@test.com")
  end
end
