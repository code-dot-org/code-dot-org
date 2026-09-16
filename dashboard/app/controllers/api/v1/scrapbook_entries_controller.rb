class Api::V1::ScrapbookEntriesController < Api::V1::JSONApiController
  before_action :authenticate_user!

  def create
    entry =
      if params[:channel_id].present?
        ScrapbookEntry.find_or_initialize_by(
          user_id: current_user.id,
          channel_id: params[:channel_id]
        )
      else
        ScrapbookEntry.find_or_initialize_by(
          user_id: current_user.id,
          script_id: params[:script_id],
          level_id: params[:level_id]
        )
      end
    entry.assign_attributes(normalized_entry_params)
    if entry.save
      render json: entry_with_names(entry, lookup_unit(entry), lookup_level(entry))
    else
      render json: {errors: entry.errors.full_messages}, status: :unprocessable_entity
    end
  end

  # Accepts a single multipart image, validates it server-side (the client
  # checks are advisory only), stores it in S3, and returns the proxy URL the
  # client should round-trip back as before_asset_url/after_asset_url.
  def image
    file = params[:image]
    return render json: {error: 'image is required'}, status: :unprocessable_entity unless file.respond_to?(:read)

    data = file.read
    if data.bytesize > Scrapbook::ImageStore::MAX_BYTES
      return render json: {error: 'image is too large'}, status: :unprocessable_entity
    end

    content_type = Scrapbook::ImageStore.detect_content_type(data)
    unless content_type
      return render json: {error: 'unsupported image type'}, status: :unprocessable_entity
    end

    filename = Scrapbook::ImageStore.put(current_user.id, data, content_type)
    render json: {url: image_proxy_url(current_user.id, filename)}
  end

  def destroy
    entry = ScrapbookEntry.find_by(id: params[:id], user_id: current_user.id)
    if entry.nil?
      head :not_found
      return
    end
    entry.destroy
    head :no_content
  end

  def index
    entries = ScrapbookEntry.where(user_id: current_user.id)
    if params[:channel_id].present?
      entries = entries.where(channel_id: params[:channel_id])
    else
      entries = entries.where(script_id: params[:script_id]) if params[:script_id].present?
      entries = entries.where(level_id: params[:level_id]) if params[:level_id].present?
    end
    entries = entries.order(created_at: :desc).to_a

    units = Unit.where(id: entries.map(&:script_id).compact.uniq).index_by(&:id)
    levels = Level.where(id: entries.map(&:level_id).compact.uniq).index_by(&:id)

    render json: entries.map {|entry| entry_with_names(entry, units[entry.script_id], levels[entry.level_id])}
  end

  private def lookup_unit(entry)
    entry.script_id && Unit.find_by(id: entry.script_id)
  end

  private def lookup_level(entry)
    entry.level_id && Level.find_by(id: entry.level_id)
  end

  private def entry_with_names(entry, unit, level)
    {
      id: entry.id,
      script_id: entry.script_id,
      level_id: entry.level_id,
      channel_id: entry.channel_id,
      script_title: unit&.localized_title,
      level_name: level&.name,
      level_url: build_entry_url(entry, unit),
      before_asset_url: image_proxy_url(entry.user_id, entry.before_asset_url),
      after_asset_url: image_proxy_url(entry.user_id, entry.after_asset_url),
      entry_text: entry.entry_text,
    }
  end

  # Stored values are bare S3 filenames; the client only ever sees a tokenized
  # proxy path that streams the image back through #image in ScrapbookController.
  private def image_proxy_url(user_id, filename)
    return nil if filename.blank?
    "/scrapbook/images/#{Scrapbook::ImageStore.signed_token(user_id, filename)}"
  end

  # The client round-trips the tokenized proxy URL it was handed at upload time.
  # Verify the token and recover the bare filename we persist; drop anything
  # whose token is invalid or belongs to another user (the model validation and
  # the token signature both back this up).
  private def normalized_entry_params
    attrs = scrapbook_entry_params.to_h
    [:before_asset_url, :after_asset_url].each do |key|
      next unless attrs.key?(key)
      attrs[key] = filename_from_ref(attrs[key])
    end
    attrs
  end

  private def filename_from_ref(value)
    return nil if value.blank?
    token = value.split('/').last
    payload = Scrapbook::ImageStore.verify_token(token)
    return nil unless payload && payload[:user_id] == current_user.id
    payload[:filename]
  end

  private def build_entry_url(entry, unit)
    return build_channel_url(entry.channel_id) if entry.channel_id.present?
    return nil unless unit
    level_ids = [entry.level_id] +
      ParentLevelsChildLevel.where(child_level_id: entry.level_id).pluck(:parent_level_id)
    script_level = ScriptLevel.joins(:levels).
      where(script_id: entry.script_id, levels: {id: level_ids}).first
    return nil unless script_level&.lesson
    "/s/#{unit.name}/lessons/#{script_level.lesson.relative_position}/levels/#{script_level.position}"
  end

  # For standalone projects we have to look up the project type to build the
  # canonical /projects/:key/:channel_id/edit URL.
  private def build_channel_url(channel_id)
    return nil if channel_id.blank?
    storage_id = storage_id_for_user_id(current_user.id)
    return nil unless storage_id
    project_type = Projects.new(storage_id).project_type_from_channel_id(channel_id)
    return nil if project_type.blank?
    "/projects/#{project_type}/#{channel_id}/edit"
  rescue StandardError
    nil
  end

  private def scrapbook_entry_params
    params.require(:scrapbook_entry).permit(
      :before_asset_url,
      :after_asset_url,
      entry_text: {}
    )
  end
end
