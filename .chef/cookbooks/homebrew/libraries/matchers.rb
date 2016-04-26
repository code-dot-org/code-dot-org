if defined?(ChefSpec)

  def install_homebrew_package(pkg)
    ChefSpec::Matchers::ResourceMatcher.new(:homebrew_package, :install, pkg)
  end

  def upgrade_homebrew_package(pkg)
    ChefSpec::Matchers::ResourceMatcher.new(:homebrew_package, :upgrade, pkg)
  end

  def remove_homebrew_package(pkg)
    ChefSpec::Matchers::ResourceMatcher.new(:homebrew_package, :remove, pkg)
  end

  def purge_homebrew_package(pkg)
    ChefSpec::Matchers::ResourceMatcher.new(:homebrew_package, :purge, pkg)
  end

  def tap_homebrew_tap(tap)
    ChefSpec::Matchers::ResourceMatcher.new(:homebrew_tap, :tap, tap)
  end

  def untap_homebrew_tap(tap)
    ChefSpec::Matchers::ResourceMatcher.new(:homebrew_tap, :untap, tap)
  end

  def cask_homebrew_cask(cask)
    ChefSpec::Matchers::ResourceMatcher.new(:homebrew_cask, :cask, cask)
  end

  def uncask_homebrew_cask(cask)
    ChefSpec::Matchers::ResourceMatcher.new(:homebrew_cask, :uncask, cask)
  end

  def install_homebrew_cask(cask)
    ChefSpec::Matchers::ResourceMatcher.new(:homebrew_cask, :install, cask)
  end

  def uninstall_homebrew_cask(cask)
    ChefSpec::Matchers::ResourceMatcher.new(:homebrew_cask, :uninstall, cask)
  end

end
