class SessionsController < Devise::SessionsController
  include UsersHelper

  # see also
  # https://github.com/plataformatec/devise/blob/v3.2/app/controllers/devise/sessions_controller.rb

  # GET /resource/sign_in
  def new
    session[:user_return_to] ||= params[:user_return_to]
    if params[:maker]
      redirect_to maker_google_oauth_confirm_login_path
      return
    end
    @already_hoc_registered = params[:already_hoc_registered]
    @hide_sign_in_option = true
    @is_english = request.language == 'en'
    if params[:providerNotLinked]
      if params[:useClever]
        # The provider was not linked, and we need to tell the user to sign in specifically through Clever
        flash.now[:alert] = I18n.t 'auth.use_clever', provider: I18n.t("auth.#{params[:providerNotLinked]}")
      else
        # This code is only reached through the oauth flow when the user already has an email account.
        # Usually email would not be available for students, this is a special case where oauth fills it in.
        flash.now[:alert] = I18n.t 'auth.not_linked', provider: I18n.t("auth.#{params[:providerNotLinked]}")
        @email = params[:email]
      end
    end
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
      format.any(*navigational_formats) do
        # Ensure no_store cache control for redirect-caching bug on Safari <= 8.
        # Ref: https://bugs.webkit.org/show_bug.cgi?id=77538
        prevent_caching
        redirect_to redirect_path
      end
    end
  end

  # GET /reset_session
  def reset
    client_state.reset
    sign_out if current_user
    reset_session
    render layout: false
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
