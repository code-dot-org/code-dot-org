# Some utilities for dealing with files with multiple extension names (IE,
# "foo.tar.gz")
module MultipleExtnameFileUtils
  # Grab an array representing all extensions applied to the given file.
  # IE, "foo.erb.md" -> [".erb", ".md"]

  # Use a positive lookahead regex rather than a simple string match so the
  # periods will be included in the resulting array, to better match the
  # functionality of File.extname
  def self.all_extnames(filename)
    File.basename(filename).split(/(?=\.)/).drop(1)
  end

  # Returns true if any of the extensions used by the given file are in the
  # given list of extension names
  def self.file_has_any_extnames(filename, extnames)
    !(extnames & all_extnames(filename)).empty?
  end

  # Returns true if and only if all of the extensions used by the given file
  # are in the given list of extension names
  def self.file_has_only_extnames(filename, extnames)
    file_extnames = all_extnames(filename).uniq
    (extnames & file_extnames).length == file_extnames.length
  end

  # Returns true if and only if the given path can be found inside the given
  # directory in the filesystem.
  #
  # Used to make sure that tricky URIs with ".." can't load files
  # from outside our template hierarchy
  def self.directory_contains_path(directory, path)
    File.expand_path(path).start_with?(File.expand_path(directory))
  end

  # Find all files of a given name in a given directory that use only the given
  # extnames
  #
  # Note that we only consider extension names not included in the given name,
  # so name="example.js", extnames=["erb"] will match files called
  # "example.js.erb", but not "example.erb"
  def self.find_with_extnames(dir, name, extnames)
    target_name = File.join(dir, name)
    Dir.glob(target_name + ".*").select do |filename|
      directory_contains_path(dir, filename) &&
        file_has_only_extnames(filename.sub(target_name, 'name'), extnames)
    end
  end
end
