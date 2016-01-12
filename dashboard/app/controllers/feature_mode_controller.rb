# A controller that allows admins to update the current feature mode using the
# FeatureModeManager. Please see that class for an explanation of the various
# feature modes.

class FeatureModeController < ApplicationController
  before_filter :authenticate_user!

  # Max time in seconds for settings updates to take effect.
  MAX_UPDATE_TIME = 30

  # Shows the current or pending feature mode. The mode is pending if it was updated so recently
  # that it is not necessarily reflected in the gatekeeper and dcdo settings.
  def show
    authorize! :read, :reports
    @current_mode = FeatureModeManager.get_mode(Gatekeeper, DCDO, ScriptConfig.cached_scripts)

    @pending_node = pending_mode
    if @pending_mode && @current_mode != @pending_node
      # If a mode update is still pending, show that mode and display a notice.
      @mode = @pending_mode
      flash[:notice] = "Updating mode to #{@pending_node.upcase}. Please wait 30 seconds for changes to take effect."
    elsif @current_mode
      # Show the mode determine from the gatekeeper settings.
      @mode =  @current_mode
    else
      @mode = 'custom'
      flash[:alert] = 'The current feature flags do not match any of the pre-defined modes.'
    end
  end

  # Updates the feature mode based on params[:mode].
  def update
    mode = params[:mode]
    session[:pending_mode] = mode
    session[:pending_mode_time] = Time.now
    FeatureModeManager.set_mode(mode, Gatekeeper, DCDO, ScriptConfig.cached_scripts)
    redirect_to(action: 'show')
  end

  private

  # Returns the most recent mode applied during the past MAX_UPDATE_TIME seconds, which
  # may not yet be reflected in the gatekeeper configuration.
  def pending_mode
    if pending_mode_expired?
      session[:pending_mode] = nil
    end
    session[:pending_mode]
  end

  def pending_mode_expired?
    !session[:pending_mode_time] || (Time.now.to_i - session[:pending_mode_time].to_i) > MAX_UPDATE_TIME
  end
end