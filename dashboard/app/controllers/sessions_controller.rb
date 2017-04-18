class SessionsController < Devise::SessionsController
  # see also
  # https://github.com/plataformatec/devise/blob/v3.2/app/controllers/devise/sessions_controller.rb

  # GET /resource/sign_in
  def new
    session[:return_to] ||= params[:return_to]
    @already_hoc_registered = params[:already_hoc_registered]
    if params[:providerNotLinked]
      # This code is only reached through the oauth flow when the user already has an email account.
      # Usually email would not be available for students, this is a special case where oauth fills it in.
      flash.now[:alert] = I18n.t 'auth.not_linked', provider: I18n.t("auth.#{params[:providerNotLinked]}")
      @email = params[:email]
    end
    super
  end

  # POST /resource/sign_in
  def create
    super
  end

  # DELETE /resource/sign_out
  def destroy
    redirect_path = after_sign_out_path_for(:user)

    sign_out

    yield resource if block_given?

    # We actually need to hardcode this as Rails default responder doesn't
    # support returning empty response on GET request
    respond_to do |format|
      format.all {head :no_content}
      format.any(*navigational_formats) {redirect_to redirect_path}
    end
  end

  private

  # Override default Devise sign_out path method
  def after_sign_out_path_for(resource_or_scope)
    user = resource_or_scope && send(:"current_#{resource_or_scope}")
    if user && user.oauth?
      return oauth_sign_out_path(user.provider)
    end

    code_org_root_path
  end
end
