module VersionRedirectOverrider
  def get_script_version_overrides
    session[:script_version_overrides] ||= []
    session[:script_version_overrides]
  end

  def set_script_version_override(script_name)
    unless get_script_version_overrides.include?(script_name)
      session[:script_version_overrides] << script_name
    end
  end

  def set_redirect_override
    return unless params[:no_redirect]
    set_script_version_override(params[:script_id]) if params[:script_id]
  end

  # TODO: also check script's course
  def override_redirect_for_script?(script)
    get_script_version_overrides.include?(script.name)
  end
end
