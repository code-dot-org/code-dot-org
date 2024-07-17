# redirect state fact sheets with lowercase path to uppercase path
get '/advocacy/state-facts/*.pdf' do |uri|
  if uri == uri.upcase
    pass
  else
    redirect "/advocacy/state-facts/#{uri.upcase}.pdf"
  end
end
