module Ark
  class UnzipCommandBuilder
    def unpack
      if resource.strip_components > 0
        unzip_with_strip_components
      else
        "unzip -q -o #{resource.release_file} -d #{resource.path}"
      end
    end

    def dump
      "unzip  -j -q -o \"#{resource.release_file}\" -d \"#{resource.path}\""
    end

    # rubocop:disable Metrics/AbcSize
    def cherry_pick
      cmd = "unzip -t #{resource.release_file} \"*/#{resource.creates}\" ; stat=$? ;"
      cmd += "if [ $stat -eq 11 ] ; then "
      cmd += "unzip  -j -o #{resource.release_file} \"#{resource.creates}\" -d #{resource.path} ;"
      cmd += "elif [ $stat -ne 0 ] ; then false ;"
      cmd += "else "
      cmd += "unzip  -j -o #{resource.release_file} \"*/#{resource.creates}\" -d #{resource.path} ;"
      cmd += "fi"
      cmd
    end
    # rubocop:enable Metrics/AbcSize

    def initialize(resource)
      @resource = resource
    end

    private

    attr_reader :resource

    def unzip_with_strip_components
      tmpdir = make_temp_directory
      strip_dir = '*/' * resource.strip_components
      cmd = "unzip -q -o #{resource.release_file} -d #{tmpdir}"
      cmd += " && rsync -a #{tmpdir}/#{strip_dir} #{resource.path}"
      cmd += " && rm -rf #{tmpdir}"
      cmd
    end

    def make_temp_directory
      require 'tmpdir'
      Dir.mktmpdir
    end
  end
end
