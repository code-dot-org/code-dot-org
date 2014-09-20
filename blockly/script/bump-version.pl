#!/usr/bin/perl

while (<>) {
  if (/"version": *"(.*\.)(\d+)"/) {
    $bumped = $2 + 1;
    print "  \"version\": \"$1$bumped\",\n";
  } else {
    print;
  }
}
