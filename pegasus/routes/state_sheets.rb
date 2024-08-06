# redirect state facts sheets to advocacy site
get '/advocacy/state-facts/*' do
  redirect "https://advocacy.code.org/stateofcs/"
end
