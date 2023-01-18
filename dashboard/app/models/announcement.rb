class Announcement
  include ActiveModel::Model
  include ActiveModel::Serializers::JSON

  # TODO: Update existing model's (Unit, Lessons, etc.) announcements to use this class.
  # Currently this class is purely for serialization within the translation pipeline.
  # rubocop:disable Naming/MethodName
  attr_accessor :key, :notice, :details, :link, :type, :visibility, :dismissible, :buttonText
  # rubocop:enable Naming/MethodName
end
