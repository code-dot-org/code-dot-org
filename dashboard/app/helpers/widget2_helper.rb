module Widget2Helper
  WIDGET2_BASE_DIRECTORY = "#{Rails.root}/config/widget2".freeze

  # Ids, folder names and file names are single path segments: a separator or ".." would
  # escape the widget2 tree.  A widget2 holds text sources, which are read into the
  # level's start sources, and binary assets, which the preview fetches from
  # /widget2/<id>/<path> (Widget2Controller#asset).  Folders go one level deep.
  WIDGET2_ID_PATTERN = /\A[a-z0-9][a-z0-9_-]*\z/
  WIDGET2_FOLDER_NAME_PATTERN = /\A[A-Za-z0-9][A-Za-z0-9_-]*\z/
  WIDGET2_SOURCE_NAME_PATTERN = /\A[A-Za-z0-9][A-Za-z0-9_-]*\.(html|css|js|json|md|txt|csv)\z/
  WIDGET2_ASSET_NAME_PATTERN = /\A[A-Za-z0-9][A-Za-z0-9_-]*\.(png|jpg|jpeg|gif|svg|webp|avif|mp3|wav)\z/
  WIDGET2_ROOT_FOLDER_ID = '0'.freeze

  def valid_widget2_id?(widget2_id)
    WIDGET2_ID_PATTERN.match?(widget2_id.to_s)
  end

  # Retrieve widget2 sources from the file system.  Returns nil when there are none to
  # read, so that a new widget2 opens on the level's own start sources.
  def get_widget2_sources(widget2_id)
    return nil unless valid_widget2_id?(widget2_id)

    widget2_directory = get_widget2_directory(widget2_id)
    source_file_paths = Dir.glob(File.join(widget2_directory, '{*,*/*}')).select {|path| File.file?(path)}.sort
    return nil if source_file_paths.empty?

    folders = {}
    files = {}
    source_file_paths.each do |file_path|
      folder_name, name = File.split(file_path.delete_prefix("#{widget2_directory}/"))
      folder_name = nil if folder_name == '.'
      next if folder_name && !WIDGET2_FOLDER_NAME_PATTERN.match?(folder_name)

      file = {name: name}
      if WIDGET2_SOURCE_NAME_PATTERN.match?(name)
        file[:contents] = File.read(file_path)
      elsif WIDGET2_ASSET_NAME_PATTERN.match?(name)
        file[:url] = widget2_asset_url(widget2_id, folder_name, name)
      else
        next
      end

      folder_id = WIDGET2_ROOT_FOLDER_ID
      if folder_name
        folder = folders.values.find {|f| f[:name] == folder_name}
        unless folder
          folder = {id: (folders.size + 1).to_s, name: folder_name, parentId: WIDGET2_ROOT_FOLDER_ID, open: true}
          folders[folder[:id]] = folder
        end
        folder_id = folder[:id]
      end

      file_id = (files.size + 1).to_s
      files[file_id] = file.merge(id: file_id, folderId: folder_id, active: false)
    end
    return nil if files.empty?

    text_files = files.values.select {|file| file.key?(:contents)}
    active_file = text_files.find {|file| file[:name] == 'index.html' && file[:folderId] == WIDGET2_ROOT_FOLDER_ID} || text_files.first
    active_file[:active] = true if active_file

    {
      folders: folders,
      files: files,
      openFiles: text_files.pluck(:id)
    }
  end

  # The URL the preview fetches a binary asset from; see Widget2Controller#asset.
  def widget2_asset_url(widget2_id, folder_name, name)
    ['/widget2', widget2_id, folder_name, name].compact.join('/')
  end

  # Resolve an asset request to a file inside the widget2 tree.  Returns nil unless every
  # segment is one we serve and the file exists.
  def widget2_asset_path(widget2_id, relative_path)
    return nil unless valid_widget2_id?(widget2_id)

    *folder_names, name = relative_path.to_s.split('/')
    return nil if name.nil? || folder_names.size > 1
    return nil unless WIDGET2_ASSET_NAME_PATTERN.match?(name)
    return nil unless folder_names.all? {|folder_name| WIDGET2_FOLDER_NAME_PATTERN.match?(folder_name)}

    file_path = File.join(get_widget2_directory(widget2_id), *folder_names, name)
    File.file?(file_path) ? file_path : nil
  end

  # Save widget2 text sources to the file system, each into its folder.  Assets carry a
  # URL rather than contents and already live on disk, so they are left alone.  Raises
  # ArgumentError unless the id and every folder and file name are ones we will write.
  def set_widget2_sources(widget2_id, start_sources)
    widget2_directory = get_widget2_directory(widget2_id)
    files = start_sources && start_sources[:files]
    folders = (start_sources && start_sources[:folders]) || {}

    # Check every name before writing any, so a rejected save writes nothing.
    sources = []
    files&.each do |_, file|
      name = file[:name]
      contents = file[:contents]
      next unless name && contents
      unless WIDGET2_SOURCE_NAME_PATTERN.match?(name)
        raise ArgumentError, "Invalid widget2 source file name: #{name.inspect}"
      end

      sources << [widget2_folder_name(folders, file[:folderId]), name, contents]
    end
    return if sources.empty?

    sources.each do |folder_name, name, contents|
      directory = folder_name ? File.join(widget2_directory, folder_name) : widget2_directory
      FileUtils.mkdir_p(directory)
      File.write(File.join(directory, name), contents)
    end
  end

  # Returns a list of available widget2 IDs.
  def get_widget2_ids
    Dir.glob(File.join(WIDGET2_BASE_DIRECTORY, '*')).select {|path| File.directory?(path)}.
      map {|path| File.basename(path)}.select {|widget2_id| valid_widget2_id?(widget2_id)}.sort
  end

  # Returns the edit URL for a widget2.
  private def get_widget2_edit_url(widget2_id)
    check_widget2_id!(widget2_id)
    new_weblab2_project_level_id = Level.find_by_name("New Web Lab 2 Project")&.id
    "/levels/#{new_weblab2_project_level_id}/edit_blocks/widget2_sources?widget2=#{widget2_id}"
  end

  private def get_widget2_directory(widget2_id)
    check_widget2_id!(widget2_id)
    File.join(WIDGET2_BASE_DIRECTORY, widget2_id.to_s)
  end

  private def check_widget2_id!(widget2_id)
    return if valid_widget2_id?(widget2_id)
    raise ArgumentError, "Invalid widget2 id: #{widget2_id.inspect}"
  end

  # A file's folder must be a valid name directly under the root; deeper trees are not
  # supported.  Returns nil for a file at the root.
  private def widget2_folder_name(folders, folder_id)
    return nil if folder_id.blank? || folder_id.to_s == WIDGET2_ROOT_FOLDER_ID

    folder = folders[folder_id.to_s]
    raise ArgumentError, "Unknown widget2 folder: #{folder_id.inspect}" unless folder

    name = folder[:name].to_s
    unless folder[:parentId].to_s == WIDGET2_ROOT_FOLDER_ID && WIDGET2_FOLDER_NAME_PATTERN.match?(name)
      raise ArgumentError, "Invalid widget2 folder name: #{name.inspect}"
    end
    name
  end
end
