module Ark
  class TarCommandBuilder
    def unpack
      "#{tar_binary} #{args} #{resource.release_file}#{strip_args}"
    end

    def dump
      "tar -mxf \"#{resource.release_file}\" -C \"#{resource.path}\""
    end

    def cherry_pick
      "#{tar_binary} #{args} #{resource.release_file} -C #{resource.path} #{resource.creates}#{strip_args}"
    end

    def initialize(resource)
      @resource = resource
    end

    private

    attr_reader :resource

    def node
      resource.run_context.node
    end

    def tar_binary
      resource.run_context.node['ark']['tar']
    end

    def args
      case resource.extension
      when /^(tar)$/         then "xf"
      when /^(tar.gz|tgz)$/  then "xzf"
      when /^(tar.bz2|tbz)$/ then "xjf"
      when /^(tar.xz|txz)$/  then "xJf"
      else raise unsupported_extension
      end
    end

    def strip_args
      resource.strip_components > 0 ? " --strip-components=#{resource.strip_components}" : ""
    end

    def unsupported_extension
      "Don't know how to expand #{resource.url} (extension: #{resource.extension})"
    end
  end
end
