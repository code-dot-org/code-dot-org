# == Schema Information
#
# Table name: projects
#
#  id                      :integer          not null, primary key
#  storage_id              :integer
#  value                   :text(16777215)
#  updated_at              :datetime         not null
#  updated_ip              :string(39)       not null
#  state                   :string(50)       default("active"), not null
#  created_at              :datetime
#  abuse_score             :integer
#  project_type            :string(255)
#  published_at            :datetime
#  standalone              :boolean          default(TRUE)
#  remix_parent_id         :integer
#  skip_content_moderation :boolean
#  uuid                    :string(255)
#
# Indexes
#
#  index_projects_on_uuid               (uuid) UNIQUE
#  storage_apps_project_type_index      (project_type)
#  storage_apps_published_at_index      (published_at)
#  storage_apps_standalone_index        (standalone)
#  storage_apps_storage_id_index        (storage_id)
#  storage_apps_storage_id_state_index  (storage_id,state)
#
class Project < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :restricted,
    storage_id: :restricted,
    value: :restricted,
    updated_at: :restricted,
    updated_ip: :restricted,
    state: :restricted,
    created_at: :restricted,
    abuse_score: :restricted,
    project_type: :restricted,
    published_at: :restricted,
    standalone: :restricted,
    remix_parent_id: :restricted,
    skip_content_moderation: :restricted,
    uuid: :restricted,
  )

  # NOTE: skip_content_moderation is currently not used in the codebase.
  belongs_to :project_storage, foreign_key: 'storage_id', optional: true
  # Note: owner is nil for projects that are owned by users without an account
  has_one :owner, class_name: 'User', through: :project_storage, source: :user
  has_one :channel_token

  # Projects of these types made by a user without an account are visible only to their creator.
  ANONYMOUS_AGE_RESTRICTED_PROJECT_TYPES = %w(applab gamelab weblab).freeze

  UUID_FORMAT = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i

  scope :active, -> {where(state: 'active')}
  scope :not_deleted, -> {where.not(state: 'deleted')}

  before_save :ensure_uuid

  def ensure_uuid
    self.uuid ||= SecureRandom.uuid
  end

  # Finds a project by channel id. Like `find`, this method raises an
  # ActiveRecord::RecordNotFound error if the corresponding project cannot
  # be found.
  def self.find_by_channel_id(channel_id)
    begin
      _, project_id = get_storage_id_and_project_id(channel_id)
    rescue
      raise ActiveRecord::RecordNotFound.new("Invalid channel_id: #{channel_id}")
    end

    Project.find(project_id)
  end

  def channel_id
    get_project_channel_id(storage_id, id)
  end

  # Returns the user_id of the owner of this project. Returns nil if the project
  # is owned by a user without an account. This should always return the same
  # value as project.owner.id but is more efficient if only the user_id is needed.
  def owner_id
    project_storage.user_id
  end

  def apply_project_age_publish_limits?
    # Four cases where we override and always allow publishing:
    # 1) project was created via free play levels on Hour of Code tutorials
    # 2) admin who has project validator permissions
    # 3) user teaches a section with followers added within the past year
    # 4) user is in a section, and was added within past year
    return false if channel_token&.script&.hoc_or_hoai?
    return false if owner&.permission?(UserPermission::PROJECT_VALIDATOR)
    return false if owner&.followers&.any? {|follower| follower.created_at > Time.now - 1.year}
    return false if owner&.followeds&.any? {|followed| followed.created_at > Time.now - 1.year}
    true
  end

  def owner_existed_long_enough_to_publish?
    return false unless owner
    Time.now > owner.created_at + 7.days
  end

  def existed_long_enough_to_publish?
    Time.now > created_at + 30.minutes
  end

  # Returns a project's submission status to determine whether a project is eligible to be submitted
  # to be considered for the public featured project gallery.
  def submission_status
    return SharedConstants::PROJECT_SUBMISSION_STATUS[:ALREADY_SUBMITTED] if published_at
    return SharedConstants::PROJECT_SUBMISSION_STATUS[:PROJECT_TYPE_NOT_ALLOWED] unless SharedConstants::ALL_PUBLISHABLE_PROJECT_TYPES.include?(project_type)
    return SharedConstants::PROJECT_SUBMISSION_STATUS[:SHARING_DISABLED] if owner.sharing_disabled? && SharedConstants::CONDITIONALLY_PUBLISHABLE_PROJECT_TYPES.include?(project_type)
    return SharedConstants::PROJECT_SUBMISSION_STATUS[:RESTRICTED_SHARE_MODE] if Projects.in_restricted_share_mode(channel_id, project_type)
    return SharedConstants::PROJECT_SUBMISSION_STATUS[:OWNER_TOO_NEW] unless owner_existed_long_enough_to_publish?
    return SharedConstants::PROJECT_SUBMISSION_STATUS[:PROJECT_TOO_NEW] unless existed_long_enough_to_publish?
    SharedConstants::PROJECT_SUBMISSION_STATUS[:CAN_SUBMIT]
  end

  # Replaces Projects.merged_row_value.
  def merged_value(channel_id:, is_owner:)
    parsed_value = JSON.parse(value)
    parsed_value.merge(
      id: channel_id,
      isOwner: is_owner,
      createdAt: created_at,
      updatedAt: updated_at,
      publishedAt: published_at,
      projectType: project_type,
      frozen: parsed_value['frozen'],
    )
  end

  # Replaces get_storage_id_and_project_id.
  def self.storage_id_and_project_id(channel_id)
    raise ArgumentError, "`encrypted` must be a string" unless channel_id.is_a? String
    return storage_decrypt_channel_id(channel_id) unless UUID_FORMAT.match?(channel_id)

    ids = where(uuid: channel_id).pick(:storage_id, :id)
    raise ArgumentError, "No project found with uuid #{channel_id}" unless ids
    ids
  end

  # Replaces get_project_channel_id. Callers holding the project pass its uuid to skip the lookup.
  def self.channel_id_for(storage_id, project_id, uuid: nil)
    storage_id = storage_id.to_i
    raise ArgumentError, "`storage_id` must be an integer > 0" unless storage_id > 0
    project_id = project_id.to_i
    raise ArgumentError, "`project_id` must be an integer > 0" unless project_id > 0

    if DCDO.get('project-uuid-in-url', false)
      uuid ||= where(id: project_id).pick(:uuid)
      return uuid if uuid
    end
    storage_encrypt_channel_id(storage_id, project_id)
  end

  # Replaces Projects#create.
  def self.create_channel(storage_id, value, ip:, type: nil, published_at: nil, remix_parent_id: nil, standalone: true, level: nil)
    validate_thumbnail_url(value['thumbnailUrl'])

    project = create!(
      storage_id: storage_id,
      value: value.to_json,
      updated_ip: ip,
      abuse_score: 0,
      project_type: type || level&.project_type,
      published_at: published_at,
      remix_parent_id: remix_parent_id,
      skip_content_moderation: false,
      standalone: standalone,
    )

    if DCDO.get('project-uuid-in-url', false)
      project.uuid
    else
      storage_encrypt_channel_id(project.storage_id, project.id)
    end
  end

  # Replaces Projects#delete.
  def self.delete_channel(storage_id, channel_id)
    project_id = owned_project_id(storage_id, channel_id)
    delete_count = where(id: project_id).update_all(state: 'deleted', updated_at: DateTime.now)
    raise Projects::NotFound, "channel `#{channel_id}` not found" if delete_count == 0
    true
  end

  # Replaces Projects#restore.
  def self.restore_channel(storage_id, channel_id)
    project_id = owned_project_id(storage_id, channel_id)
    update_count = where(id: project_id).update_all(state: 'active', updated_at: DateTime.now)
    raise Projects::NotFound, "channel `#{channel_id}` not found" if update_count == 0
    true
  end

  # Replaces Projects#get.
  def self.get_channel(storage_id, channel_id)
    begin
      owner, project_id = storage_id_and_project_id(channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError => exception
      CDO.log.warn "Error while decrypting channel_id in projects#get. Channel id: #{channel_id}, Exception: #{exception.message}"
      raise Projects::NotFound, "channel `#{channel_id}` not found"
    end
    project = not_deleted.find_by(id: project_id)
    raise Projects::NotFound, "channel `#{channel_id}` not found" unless project

    if owner != storage_id && !ProjectStorage.user_id_for_storage_id(owner)
      begin
        # project_type is not always set for channels backing levels, so fall back to the value blob.
        project_type = project.project_type || JSON.parse(project.value)['projectType']
      rescue JSON::ParserError
        nil
      end
      raise Projects::NotFound, "channel `#{channel_id}` not shareable" if ANONYMOUS_AGE_RESTRICTED_PROJECT_TYPES.include?(project_type)
    end

    project.merged_value(channel_id: channel_id, is_owner: owner == storage_id)
  end

  # Replaces Projects#update.
  def self.update_channel(storage_id, channel_id, value, ip_address, project_type: nil, locale: 'en')
    project_id = owned_project_id(storage_id, channel_id)

    new_name = value['name']
    project = find_by(id: project_id)
    old_name = JSON.parse(project.value)['name']
    if new_name != old_name
      share_failure = title_profanity_privacy_violation(new_name, locale)
      raise ProfanityPrivacyError.new(share_failure.content) if share_failure
    end

    validate_thumbnail_url(value['thumbnailUrl'])

    row = {
      value: value.to_json,
      updated_at: DateTime.now,
      updated_ip: ip_address,
    }
    row[:project_type] = project_type if project_type
    row[:uuid] = SecureRandom.uuid if project.uuid.nil?

    update_count = not_deleted.where(id: project_id).update_all(row)
    raise Projects::NotFound, "channel `#{channel_id}` not found" if update_count == 0

    JSON.parse(row[:value]).merge(id: channel_id, isOwner: true, updatedAt: row[:updated_at])
  end

  # Replaces Projects#publish.
  def self.publish_channel(storage_id, channel_id, type)
    project_id = owned_project_id(storage_id, channel_id)
    projects = not_deleted.where(id: project_id)
    raise Projects::NotFound, "channel `#{channel_id}` not found" unless projects.exists?
    projects.update_all(project_type: type, published_at: DateTime.now)
  end

  # Replaces Projects#unpublish.
  def self.unpublish_channel(storage_id, channel_id)
    project_id = owned_project_id(storage_id, channel_id)
    update_count = not_deleted.where(id: project_id).update_all(published_at: nil)
    raise Projects::NotFound, "channel `#{channel_id}` not found" if update_count == 0
  end

  # Replaces Projects#to_a.
  def self.channels_for_storage(storage_id)
    where(storage_id: storage_id).not_deleted.filter_map do |project|
      channel_id = channel_id_for(project.storage_id, project.id, uuid: project.uuid)
      begin
        project.merged_value(channel_id: channel_id, is_owner: true)
      rescue JSON::ParserError
        nil
      end
    end
  end

  # Replaces Projects#most_recent.
  def self.most_recent_channel(storage_id, key, include_hidden = false)
    project = where(storage_id: storage_id).not_deleted.order(updated_at: :desc).detect do |candidate|
      parsed_value = JSON.parse(candidate.value)
      (include_hidden || !parsed_value['hidden']) && !parsed_value['frozen'] && parsed_value['level'].split('/').last == key
    rescue
      # Malformed channel, or missing level.
    end

    channel_id_for(project.storage_id, project.id, uuid: project.uuid) if project
  end

  # Replaces Projects#project_type_from_channel_id.
  def self.project_type_from_channel_id(storage_id, channel_id)
    merged_value = get_channel(storage_id, channel_id)
    return merged_value[:projectType] if merged_value[:projectType]
    return merged_value['projectType'] if merged_value['projectType']

    match_data = %r{^/projects/([^/]+)$}.match(merged_value['level'])
    return match_data[1] if match_data

    'unknown'
  end

  # Replaces Projects#soft_delete_all.
  def self.soft_delete_all_for_storage(storage_id)
    where(storage_id: storage_id).not_deleted.update_all(state: 'deleted', updated_at: Time.now)
  end

  # Replaces Projects#restore_if_deleted_after.
  def self.restore_for_storage_if_deleted_after(storage_id, deleted_time)
    where(storage_id: storage_id, state: 'deleted', updated_at: deleted_time..).update_all(state: 'active', updated_at: Time.now)
  end

  # Replaces Projects#get_sharing_disabled.
  def self.channel_sharing_disabled?(channel_id, current_user_id)
    owner_storage_id, project_id = storage_id_and_project_id(channel_id)
    owner_user_id = ProjectStorage.user_id_for_storage_id(owner_storage_id)

    return false if current_user_id == owner_user_id
    return false if teaches_student?(owner_user_id, current_user_id)
    return false unless get_user_sharing_disabled(owner_user_id)
    !users_paired_on_level?(project_id, current_user_id, owner_user_id, owner_storage_id)
  rescue ArgumentError, OpenSSL::Cipher::CipherError
    true
  end

  # Replaces Projects#get_is_teacher_of_project_owner.
  def self.teacher_of_owner?(channel_id, current_user_id)
    owner_storage_id, _ = storage_id_and_project_id(channel_id)
    teaches_student?(ProjectStorage.user_id_for_storage_id(owner_storage_id), current_user_id)
  end

  # Replaces Projects#users_paired_on_level?. Sequel never applied paranoia's deleted_at filter, so neither does this.
  def self.users_paired_on_level?(project_id, current_user_id, owner_user_id, owner_storage_id)
    level_id = ChannelToken.with_deleted.where(storage_app_id: project_id, storage_id: owner_storage_id).pick(:level_id)
    return false if level_id.nil?

    PairedUserLevel.exists?(
      driver_user_level_id: UserLevel.with_deleted.where(user_id: owner_user_id, level_id: level_id).select(:id),
      navigator_user_level_id: UserLevel.with_deleted.where(user_id: current_user_id, level_id: level_id).select(:id),
    )
  end

  # Replaces Projects#increment_abuse, including its lost-update race between the read and the write.
  def self.increment_abuse(channel_id, amount, override_frozen = false)
    _owner, project_id = storage_id_and_project_id(channel_id)

    project = not_deleted.find_by(id: project_id)
    raise Projects::NotFound, "channel `#{channel_id}` not found" unless project
    # Frozen projects are featured projects or curriculum exemplars.
    increment_amount = JSON.parse(project.value)['frozen'] && !override_frozen ? 0 : amount
    new_score = project.abuse_score + increment_amount

    update_count = not_deleted.where(id: project_id).update_all(abuse_score: new_score)
    raise Projects::NotFound, "channel `#{channel_id}` not found" if update_count == 0
    new_score
  end

  # Replaces Projects#reset_abuse.
  def self.reset_abuse(channel_id)
    _owner, project_id = storage_id_and_project_id(channel_id)
    update_count = not_deleted.where(id: project_id).update_all(abuse_score: 0)
    raise Projects::NotFound, "channel `#{channel_id}` not found" if update_count == 0
    0
  end

  # Replaces Projects.get_abuse, which raised NoMethodError where this returns nil.
  def self.abuse_score_for(channel_id)
    _owner, project_id = storage_id_and_project_id(channel_id)
    where(id: project_id).pick(:abuse_score)
  end

  # Replaces Projects.remix_ancestry.
  def self.remix_ancestry(channel_id, depth: 1)
    [].tap do |ancestors|
      _owner, project_id = storage_id_and_project_id(channel_id)
      project = find_by(id: project_id)
      while project&.remix_parent_id
        project = find_by(id: project.remix_parent_id)
        ancestors.push channel_id_for(project.storage_id, project.id, uuid: project.uuid) if project
        break if ancestors.size >= depth
      end
    end
  rescue
    []
  end

  private_class_method def self.owned_project_id(storage_id, channel_id)
    owner, project_id = storage_id_and_project_id(channel_id)
    raise Projects::NotFound, "channel `#{channel_id}` not found in your storage" unless owner == storage_id
    project_id
  end

  # A remix's thumbnail URL may carry its parent's channel id; dance and flappy use placeholders under /blockly/media.
  private_class_method def self.validate_thumbnail_url(thumbnail_url)
    return unless thumbnail_url
    return if thumbnail_url.start_with?('/v3/files/') && thumbnail_url.end_with?('.metadata/thumbnail.png')
    return if thumbnail_url.start_with?('/blockly/media')
    raise Projects::ValidationError
  end
end
