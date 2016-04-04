# Fixes two issues in Yaml files:
# 1) The locale keys must be quoted, otherwise Norwegian's `no: 1`
#    is parsed as `{false=>1}`.
# 2) All translated messages should be quoted.

while(<>) {
  # Fixes the "no:" problem.
  s/^([a-z]+(?:-[A-Z]+)?):(.*)/"\1":\2/g;
  # Wraps unquoted strings in double quotes, escaping existing quotes.
  # Does not touch already quoted or single quoted strings.
  if (/^ +[a-zA-Z0-9_ ]+?: *(.+)$/) {
    if ($1 !~ /^(".*"|'.*'|\|.*)$/) {
      s/"/\\"/g;
      s/^([ a-zA-Z0-9_ ]+?): *(.*)$/\1: "\2"/;
    }
  }
  print;
}
