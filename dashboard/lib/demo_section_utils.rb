module DemoSectionUtils
  DEMO_SECTION_NAME = 'Demo Section'.freeze

  def self.create_demo_section(user)
    return unless user.teacher?

    Section.create!(
      user_id: user.id,
      name: DEMO_SECTION_NAME,
      login_type: Section::LOGIN_TYPE_PICTURE
    )
  end
end
