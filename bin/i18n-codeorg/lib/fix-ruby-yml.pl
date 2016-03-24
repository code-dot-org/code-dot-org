while(<>) {
  # Remove ---
  s/^---\n//;
  # Fixes the "no:" problem.
  s/^([a-z]+(?:-[A-Z]+)?):(.*)/"\1":\2/g;
  print;
}
