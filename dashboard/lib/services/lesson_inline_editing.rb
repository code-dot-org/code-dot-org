class Services::LessonInlineEditing
  # Allowlist of (model, field) pairs editable via the in-page lesson editor.
  # See openspec/changes/easy-lesson-editor/. Anything not on this list is
  # rejected by the inline_field endpoint and not advertised by the renderer.
  ALLOWED_FIELDS = {
    'Lesson' => %w(overview purpose preparation assessment_opportunities).freeze,
    'LessonActivity' => %w(name).freeze,
    'ActivitySection' => %w(name description).freeze,
  }.freeze

  ALLOWED_MODELS = ALLOWED_FIELDS.keys.freeze

  IDENTIFIER_SEPARATOR = ':'.freeze

  def self.allowed?(model_name, field)
    return false unless model_name && field
    fields = ALLOWED_FIELDS[model_name.to_s]
    !fields.nil? && fields.include?(field.to_s)
  end

  # Resolve a string model name from the allowlist into its ActiveRecord class.
  # Returns nil for anything not on the allowlist; the caller never gets to
  # constantize an arbitrary user-supplied name.
  def self.model_class(model_name)
    return nil unless ALLOWED_MODELS.include?(model_name.to_s)
    model_name.to_s.constantize
  end

  # Build the "<model>:<id>:<field>" identifier the renderer emits on each
  # editable element and the controller reads on save.
  def self.identifier_for(record, field)
    [record.class.name, record.id, field.to_s].join(IDENTIFIER_SEPARATOR)
  end

  # For a given record, return a hash of {field => identifier} covering every
  # allowlisted field on that record's class. The Lesson show summarizer drops
  # this onto each editable record's payload when inline editing is enabled.
  def self.editable_ids_for(record)
    fields = ALLOWED_FIELDS[record.class.name] || []
    fields.index_with {|f| identifier_for(record, f)}
  end

  # Transform a saved raw value into the form the lesson show page hands to
  # its client-side renderer (SafeMarkdown / EnhancedSafeMarkdown). For markdown
  # fields this means running MarkdownPreprocessor; for plain-text fields the
  # value passes through unchanged. The save endpoint returns this alongside the
  # raw value so the client can re-render the edited field through the same
  # code path a fresh page load would take.
  MARKDOWN_RENDERED_FIELDS = {
    'Lesson' => %w(overview purpose preparation assessment_opportunities).to_set.freeze,
    'ActivitySection' => %w(description).to_set.freeze,
  }.freeze

  def self.render_source(model_name, field, value)
    return '' if value.nil?
    if MARKDOWN_RENDERED_FIELDS[model_name.to_s]&.include?(field.to_s)
      Services::MarkdownPreprocessor.process(value)
    else
      value
    end
  end

  # Parse an identifier string back into {model:, id:, field:}, or nil on any
  # malformed input. Does not check the allowlist; callers should pair this
  # with `allowed?`.
  def self.parse_identifier(identifier)
    return nil unless identifier.is_a?(String)
    parts = identifier.split(IDENTIFIER_SEPARATOR, 3)
    return nil unless parts.length == 3
    model, id, field = parts
    return nil if model.empty? || field.empty?
    id_int = begin
      Integer(id, 10)
    rescue ArgumentError, TypeError
      nil
    end
    return nil unless id_int
    {model: model, id: id_int, field: field}
  end
end
