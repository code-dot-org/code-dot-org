module GitHelper
  # Detects whether the current git path is hosted in a 'shared volume', e.g. within a Docker container.
  def self.shared_volume?(git_path, home_path)
    if ::File.directory?(git_path)
      stat = ::File.stat(git_path)
      home_stat = ::File.stat(home_path)
      stat.uid != home_stat.uid || stat.dev != home_stat.dev
    else
      false
    end
  end
end
