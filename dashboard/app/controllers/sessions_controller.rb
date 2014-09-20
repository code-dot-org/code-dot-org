class SessionsController < Devise::SessionsController
  before_filter :nonminimal

  # see also
  # https://github.com/plataformatec/devise/blob/v3.2/app/controllers/devise/sessions_controller.rb

  # GET /resource/sign_in
  def new
    session[:return_to] = params[:return_to]
    super
  end

  # DELETE /resource/sign_out
  def destroy
    redirect_path = after_sign_out_path_for_user(current_user)

    sign_out

    yield resource if block_given?

    # We actually need to hardcode this as Rails default responder doesn't
    # support returning empty response on GET request
    respond_to do |format|
      format.all { head :no_content }
      format.any(*navigational_formats) { redirect_to redirect_path }
    end
  end

  private

  def after_sign_out_path_for_user(user)
    if user && user.oauth?
      return oauth_sign_out_path(user.provider)
    end
    
    code_org_root_path
  end
end
