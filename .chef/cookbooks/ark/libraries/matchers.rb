
if defined?(ChefSpec)
  def install_ark(resource_name)
    ChefSpec::Matchers::ResourceMatcher.new(:ark, :install, resource_name)
  end

  def dump_ark(resource_name)
    ChefSpec::Matchers::ResourceMatcher.new(:ark, :dump, resource_name)
  end

  def cherry_pick_ark(resource_name)
    ChefSpec::Matchers::ResourceMatcher.new(:ark, :cherry_pick, resource_name)
  end

  def put_ark(resource_name)
    ChefSpec::Matchers::ResourceMatcher.new(:ark, :put, resource_name)
  end

  def install_with_make_ark(resource_name)
    ChefSpec::Matchers::ResourceMatcher.new(:ark, :install_with_make, resource_name)
  end

  def configure_ark(resource_name)
    ChefSpec::Matchers::ResourceMatcher.new(:ark, :configure, resource_name)
  end

  def setup_py_build_ark(resource_name)
    ChefSpec::Matchers::ResourceMatcher.new(:ark, :setup_py_build, resource_name)
  end

  def setup_py_install_ark(resource_name)
    ChefSpec::Matchers::ResourceMatcher.new(:ark, :setup_py_install, resource_name)
  end

  def setup_py_ark(resource_name)
    ChefSpec::Matchers::ResourceMatcher.new(:ark, :setup_py, resource_name)
  end

  def unzip_ark(resource_name)
    ChefSpec::Matchers::ResourceMatcher.new(:ark, :unzip, resource_name)
  end
end
