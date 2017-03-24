include_recipe 'ark'

ark 'ngrok' do
  url 'https://dl.ngrok.com/ngrok_2.0.19_linux_amd64.zip'
  strip_components 0
end

require 'etc'
user = Etc.getlogin
home = Etc.getpwnam(user).dir

directory("#{home}/.ngrok2") {user user}

template "#{home}/.ngrok2/ngrok.yml" do
  source 'ngrok.yml.erb'
  sensitive true # Contains ngrok auth token
  user user
end
