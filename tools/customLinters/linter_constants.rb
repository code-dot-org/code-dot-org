module LinterConstants
  NOT_ALLOWED_CHARACTERS = [
    '“', # U+201C Left Double Quotation Mark
    '”', # U+201D Right Double Quotation Mark
    '‘', # U+2018 Left Single Quotation Mark
    '’', # U+2019 Right Single Quotation Mark
  ].freeze

  NOT_ALLOWED_REGEX = /[#{NOT_ALLOWED_CHARACTERS.join}]/

  MSG = "Do not use left/right quotation mark. Use \' or \" instead.".freeze
end
