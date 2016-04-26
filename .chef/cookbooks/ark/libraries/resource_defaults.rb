module Ark
  class ResourceDefaults
    def extension
      resource.extension || generate_extension_from_url(resource.url.clone)
    end

    def prefix_bin
      resource.prefix_bin || prefix_bin_from_node_in_run_context
    end

    def prefix_root
      resource.prefix_root || prefix_root_from_node_in_run_context
    end

    def home_dir
      if resource.home_dir.nil? || resource.home_dir.empty?
        prefix_home = resource.prefix_home || prefix_home_from_node_in_run_context
        ::File.join(prefix_home, resource.name)
      else
        resource.home_dir
      end
    end

    def version
      resource.version || default_version
    end

    def path
      if windows?
        resource.win_install_dir
      else
        ::File.join(resource.prefix_root, "#{resource.name}-#{resource.version}")
      end
    end

    def windows?
      node_in_run_context['platform_family'] == 'windows'
    end

    def path_without_version
      partial_path = resource.path || prefix_root_from_node_in_run_context
      ::File.join(partial_path, resource.name)
    end

    def release_file
      release_filename = "#{resource.name}-#{resource.version}.#{resource.extension}"
      ::File.join(file_cache_path, release_filename)
    end

    def release_file_without_version
      release_filename = "#{resource.name}.#{resource.extension}"
      ::File.join(file_cache_path, release_filename)
    end

    def initialize(resource)
      @resource = resource
    end

    private

    attr_reader :resource

    def generate_extension_from_url(url)
      # purge any trailing redirect
      url =~ %r{^https?:\/\/.*(.bin|bz2|gz|jar|tbz|tgz|txz|war|xz|zip)(\/.*\/)}
      url.gsub!(Regexp.last_match(2), '') unless Regexp.last_match(2).nil?
      # remove tailing query string
      release_basename = ::File.basename(url.gsub(/\?.*\z/, '')).gsub(/-bin\b/, '')
      # (\?.*)? accounts for a trailing querystring
      Chef::Log.debug("DEBUG: release_basename is #{release_basename}")
      release_basename =~ /^(.+?)\.(jar|tar\.bz2|tar\.gz|tar\.xz|tbz|tgz|txz|war|zip|tar)(\?.*)?/
      Chef::Log.debug("DEBUG: file_extension is #{Regexp.last_match(2)}")
      Regexp.last_match(2)
    end

    def prefix_bin_from_node_in_run_context
      node_in_run_context['ark']['prefix_bin']
    end

    def prefix_root_from_node_in_run_context
      node_in_run_context['ark']['prefix_root']
    end

    def prefix_home_from_node_in_run_context
      node_in_run_context['ark']['prefix_home']
    end

    def default_version
      "1"
    end

    def file_cache_path
      Chef::Config[:file_cache_path]
    end

    def node_in_run_context
      resource.run_context.node
    end
  end
end
