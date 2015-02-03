def authentication_callback(params={})
  redirect_uri = params[:redirect_uri] || '/'

  auth = request.env['omniauth.auth']
  email = auth['info']['email'].to_s.strip.downcase
  
  if email =~ /\@code.org$/
    row = {
      google_oauth2: JSON.pretty_generate(auth),
      updated_at: DateTime.now,
      updated_ip: request.ip,
    }
    rows_updated = database[:users].where(email:email).update(row)
    if rows_updated == 0
      row[:email] = email
      row[:id] = database[:users].insert(row)
    end
  end

  session['user.email'] = email

  redirect(redirect_uri, :found)
end

def require_authentication()
  email = session['user.email']

  unless ['/health_check', '/signin', '/signout'].include?(request.path_info) || request.path_info =~ /^\/auth\//
    redirect('/signin', :found) unless email
    redirect('/auth/denied', :found) unless email =~ /\@code.org$/
  end

  cache_control(:private, :must_revalidate, max_age:0) if email
end

def user()
  @user ||= user_
end

def user_()
  return nil unless email = session['user.email']

  if row = database[:users].where(email:email).first
    user = JSON.parse(row[:google_oauth2])['info'].merge({
      'pivotal_token' => row[:pivotal_token],
    })
  else
    first_name = name = email.split('@').first
    user = {'email'=>email, 'name'=>name, 'first_name'=>first_name}
  end
  
  user
end
