require 'cdo/github'
require 'cdo/developers_topic'

CHECK_DTS_ACTIONS = [
  'opened',
  'reopened',
  'edited',
  'synchronize',
].freeze

# Controller actions used for internal developer tools
class DevController < ApplicationController
  # Disable Rails' layout and CSRF verification for these API routes
  layout false
  skip_before_action :verify_authenticity_token

  def check_dts
    return head :forbidden unless rack_env?(:staging)
    return head :service_unavailable unless CDO.github_webhook_secret

    # verify signature
    signature = 'sha1=' + OpenSSL::HMAC.hexdigest(
      OpenSSL::Digest.new('sha1'),
      CDO.github_webhook_secret,
      request.body.read
    )
    signature_valid = ActiveSupport::SecurityUtils.secure_compare(
      signature,
      request.env['HTTP_X_HUB_SIGNATURE']
    )
    return head :forbidden unless signature_valid

    # verify PR data
    data = JSON.parse(params[:payload])
    data_valid = CHECK_DTS_ACTIONS.include?(data['action']) &&
      request.env['HTTP_X_GITHUB_EVENT'] == 'pull_request' &&
      data['pull_request']['base']['ref'] == 'staging'
    unless data_valid
      return render(
        status: :accepted,
        plain: 'I only check the DTS status for PRs against staging'
      )
    end

    # set initial DTS for specified PR
    GitHub.configure_octokit
    if DevelopersTopic.dts?
      GitHub.set_dts_check_pass(data['pull_request'])
    else
      GitHub.set_dts_check_fail(data['pull_request'])
    end

    return render plain: 'success'
  end
end
