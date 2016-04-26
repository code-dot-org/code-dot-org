module InstallHelper
  class << self
    def platform
      require 'mixlib/install'
      script = `#{Mixlib::Install::Generator::Bourne.get_script('platform_detection.sh')} echo "$platform\n$platform_version\n$machine"`
      platform, version, arch = script.split("\n")
      {platform: platform, platform_version: version, architecture: arch}
    end

    def install(version_string)
      require 'mixlib/install'
      Mixlib::Install.new(platform.merge(
        product_name: 'chef',
        product_version: version_string,
        channel: :stable
      ))
    end

    # Support downgrades and upgrades, unless prevent_downgrade is true.
    def update_needed?(version_string, prevent_downgrade = false)
      require "mixlib/versioning"
      install = install(version_string)
      current_version = Mixlib::Versioning.parse(install.current_version)
      return true unless current_version
      available_version = Mixlib::Versioning.parse(install.artifact_info.version)
      prevent_downgrade ?
        (available_version > current_version) :
        (available_version != current_version)
    end

    def version(version_string)
      install(version_string).artifact_info.version
    end

    def install_command(version_string)
      install(version_string).install_command
    end
  end
end
