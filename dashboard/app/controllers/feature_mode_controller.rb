# A controller that allows admins to update the current feature mode using the
# FeatureModeManager. Please see that class for an explanation of the various
# feature modes.

class FeatureModeController < ApplicationController
  before_action :authenticate_user!

  # Max time in seconds for settings updates to take effect.
  MAX_UPDATE_TIME = 30

  PLEASE_WAIT_MESSAGE = "Updating feature mode. Please wait #{MAX_UPDATE_TIME} seconds for " \
      'changes to take effect, then send a CloudFront cache invalidation.'.freeze

  # Shows the current or pending feature mode.
  def show
    authorize! :read, :reports
    @current_mode = FeatureModeManager.get_mode(Gatekeeper, DCDO,
      ScriptConfig.hoc_scripts, ScriptConfig.csf_scripts
    )
    @pending_mode = pending_mode
    @unit_names = Gatekeeper.script_names.sort
    @feature_names = Gatekeeper.feature_names.sort

    # If a mode update is still pending, display a notice.
    if @pending_mode && @current_mode != @pending_mode
      @mode = @pending_mode
      flash[:notice] = PLEASE_WAIT_MESSAGE
    elsif @current_mode
      @mode = @current_mode
    else
      @mode = 'custom'
      flash[:alert] = 'The current feature flags do not match any of the pre-defined modes.'
    end
  end

  # Updates the feature mode based on params[:mode].
  def update
    authorize! :read, :reports
    mode = params[:mode]
    FeatureModeManager.set_mode(mode, Gatekeeper, DCDO,
      ScriptConfig.hoc_scripts, ScriptConfig.csf_scripts
    )
    set_pending_mode(mode)
    flash[:notice] = PLEASE_WAIT_MESSAGE
    redirect_to(action: 'show')
  end

  private

  # Returns the pending feature mode, or nil if unset or expired.
  def pending_mode
    if pending_mode_expired?
      session[:pending_mode_time] = nil
      session[:pending_mode] = nil
    end
    session[:pending_mode]
  end

  def set_pending_mode(mode)
    session[:pending_mode_time] = Time.now.to_i
    session[:pending_mode] = mode
  end

  # Returns true if the pending mode in the session should be considered
  # no longer valid because it has pending for longing than MAX_UPDATE_TIME.
  # (Someone else might update the feature mode after we start a pending request
  # so there is no guarantee the mode will eventually equal the pending mode.)
  def pending_mode_expired?
    @expired = session[:pending_mode_time].nil? ||
         (Time.now.to_i > session[:pending_mode_time] + MAX_UPDATE_TIME)
  end
end
