class FileUtility

  def self.find_first_existing(*paths)
    paths.flatten.find{|path| File.exist?(path) ? path : nil}
  end

end
