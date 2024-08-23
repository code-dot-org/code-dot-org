def parse_email_address_string(string)
  # A comma without surrounding double-quotes isn't necessarily bad, since it
  # might be like this:
  #   friendly name, phd <email@code.org>
  #
  # Though in such a case, it should really be provided like this:
  #   "friendly name, phd" <email@code.org>
  #
  # But we are alerting just in case a sender has attempted to provide multiple
  # email addresses like this:
  #   friendly name <email@code.org>, second person <email2@code.org>
  #
  # Because we deprecated support for this pattern, believing that we've never
  # actually used it.
  #
  # The regular expression itself matches commas unless they are surrounded
  # by a pair of double-quotes, and is adapted from
  # https://stackoverflow.com/a/18893443.
  if /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/.match?(string)
    Harness.error_notify(
      error_message: "Comma outside of surrounding double-quotes detected in address string: #{string}"
    )
    return ""
  end

  # Match the friendly name followed by an email address wrapped in < > at the end of
  # the string.
  # This means that the friendly name can contain additional < or > characters
  # without them being confused with the < > wrapping the email address at the end.
  #
  # Or just treat the entire string as an email address.
  if (/(.*)<(.*)>$/ =~ string).nil?
    {name: nil, email: string}
  else
    {name: $1.strip, email: $2}
  end
end
