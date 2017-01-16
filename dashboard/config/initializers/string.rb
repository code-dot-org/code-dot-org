class String
  # Similar to titleize (http://apidock.com/rails/String/titleize),
  # but it doesn't strip the trailing '_id'
  #
  #   'account_id'.titleize == 'Account'
  #   'account_id'.titleize_with_id == 'Account Id'
  #
  # @return [String]
  def titleize_with_id
    titleize + (end_with?('_id') ? ' Id' : '')
  end
end
