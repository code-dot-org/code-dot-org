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

  # GET /lockout
  # This page is for accounts that are locked until parental permission compliance.
  def lockout
    # If the student isn't signed in, go to the login page
    return redirect_to new_user_session_path unless current_user

    # Basic defaults. If the @pending_email is empty, the request was never sent
    @pending_email = ''
    @request_date = DateTime.now
    @student_email = current_user.hashed_email

    # Determine the deletion date as the creation time of the account + 7 days
    @delete_date = current_user.created_at.since(7.days)

    # Find any existing permission request for this user
    # Students might have issued a few requests. We render the latest one.
    permission_request = ParentalPermissionRequest.where(user: current_user).order(updated_at: :desc).limit(1).first

    # If it exists, set the appropriate fields before rendering the lockout UI
    if permission_request
      @pending_email = permission_request.parent_email
      @request_date = permission_request.updated_at
    end
  end

  # Override default Devise sign_out path method
  private def after_sign_out_path_for(resource_or_scope)
    user = resource_or_scope && send(:"current_#{resource_or_scope}")
    if user&.oauth?
      return oauth_sign_out_path(user.provider)
    end

    code_org_root_path
  end
end
