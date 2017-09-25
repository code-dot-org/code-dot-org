class DeletedUser
  include Singleton

  def name
    I18n.t('user.deleted_user')
  end
end
