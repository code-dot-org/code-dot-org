require 'etc'

Ohai.plugin(:Sudo) do
  provides 'user', 'home', 'current_user'

  collect_data(:default) do
    user = Etc.getpwuid(Process.euid).name rescue nil
    user = ENV['SUDO_USER'] if [nil, 'root'].include?(user) && ENV['SUDO_USER']
    user ||= ENV['USER']

    user user
    current_user user
    home Etc.getpwnam(user).dir
  end
end
