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

  def self.find_with_possible_extnames(dir, name, extnames)
    # Find all files of a given name in a given directory that use one or more
    # of the given extnames
    Dir.glob(File.join(dir, "#{name}.*")).select do |filename|
      file_extnames = all_extnames(filename)
      !(extnames & file_extnames).empty?
    end
  end
end
