class Api::V1::TeacherDashboardNoteSerializer < ActiveModel::Serializer
  attributes :id, :title, :body
  attribute :context_type, key: :contextType
  attribute :note_color, key: :noteColor
  attribute :unit_group_id, key: :unitGroupId
  attribute :unit_id, key: :unitId
  attribute :lesson_id, key: :lessonId
  attribute :section_id, key: :sectionId
  attribute :shared_with_section, key: :sharedWithSection
  attribute :shared_section_ids, key: :sharedSectionIds
  attribute :shareable_globally, key: :shareableGlobally
  attribute :owner, key: :isOwner
  attribute :author_name, key: :authorName
  attribute :created_at, key: :createdAt
  attribute :updated_at, key: :updatedAt
  attribute :lock_version, key: :lockVersion

  delegate :shared_section_ids, to: :object

  def shared_with_section
    object.shared_section_ids.present? || object.shared_with_section
  end

  def owner
    object.owner?(scope)
  end

  def author_name
    object.teacher.name
  end

  def created_at
    object.created_at.iso8601
  end

  def updated_at
    object.updated_at.iso8601
  end
end
