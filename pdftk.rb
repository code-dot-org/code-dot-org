# typed: false
# frozen_string_literal: true

# Pdftk formula
class Pdftk < Formula
  FILENAME = 'pdftk_server-2.02-mac_osx-10.11-setup.pkg'
  homepage 'http://www.pdflabs.com/tools/pdftk-server'
  url "http://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/#{FILENAME}"
  sha256 'c33cf95151e477953cd57c1ea9c99ebdc29d75f4c9af0d5f947b385995750b0c'

  def install
    # Outputs it to pdftk.pkg/*
    safe_system '/usr/bin/xar', '-xf', FILENAME
    Dir.mkdir 'tmp'
    safe_system 'tar -xf pdftk.pkg/Payload -C tmp/.'
    prefix.install Dir['tmp/*']
  end

  test do
    system "#{bin}/pdftk", '--version'
  end
end
