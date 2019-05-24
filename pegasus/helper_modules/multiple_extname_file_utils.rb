module MultipleExtnameFileUtils
  # Some utilities for dealing with files with multiple extension names (IE,
  # "foo.tar.gz")

  def self.all_extnames(filename)
    # Grab an array representing all extensions applied to the
    # given file.
    # IE, "foo.erb.md" -> [".erb", ".md"]

    # Use a positive lookahead regex rather than a simple string match so the
    # periods will be included in the resulting array, to better match the
    # functionality of File.extname
    File.basename(filename).split(/(?=\.)/).drop(1)
  end

  def self.file_has_any_extnames(filename, extnames)
    # Returns true if any of the extensions used by the given file are in the
    # given list of extension names
    !(extnames & all_extnames(filename)).empty?
  end

  def self.file_has_all_extnames(filename, extnames)
    # Returns true if and only if all of the extensions used by the given file
    # are in the given list of extension names
    file_extnames = all_extnames(filename)
    (extnames & file_extnames).length == file_extnames.length
  end

  def self.find_with_extnames(dir, name, extnames)
    # Find all files of a given name in a given directory that use only the
    # given extnames
    #
    # Note that we only consider extension names not included in the given
    # name, so name="example.js", extnames=["erb"] will match files called
    # "example.js.erb", but not "example.erb"
    target_name = File.join(dir, name)
    Dir.glob(target_name + ".*").select do |filename|
      file_has_all_extnames(filename.sub(target_name, 'name'), extnames)
    end
  end
end
