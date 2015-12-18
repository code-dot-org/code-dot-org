#!/usr/bin/env ruby
require File.expand_path('../../../pegasus/src/env', __FILE__)
require src_dir 'database'

CODES_ROOT = 'Codes'

APPLE_DIR = 'Apple'
APPLE_CODES = {
  'Australia' => 'AUS_Q1_16_Promo_PINS_Batch_20_10AUD_250cards_120115073758299.lst',
  'Canada' => 'Canada_Q1_16_Promo_PINS_Batch_20_10CAD_750cards_12011507480051.lst',
  'India' => 'India_Q1_16_Promo_PINS_Batch_20_10INR_250cards_120115100758210.lst',
  'Indonesia' => 'Indonesia_Q1_16_Promo_PINS_Batch_20_10IDR_50cards_120115101757994.lst',
  'Italy' => 'ITALY_Q1_16_Promo_PINS_Batch_20_10EUR_750cards_120115102801117.lst',
  'Mexico' => 'Mexico_Q1_16_Promo_PINS_Batch_20_10MXN_50cards_120115102758146.lst',
  'Spain' => 'SPAIN_Q1_16_Promo_PINS_Batch_20_10EUR_200cards_120115114758840.lst',
  'Turkey' => 'Turkey_Q1_16_Promo_PINS_Batch_20_10TRY_700cards_12021507380014.lst',
  'UK' => 'UK_Q1_16_Promo_PINS_Batch_20_10GBP_750cards_120215090801927.lst',
  'US' => 'US_Q1_16_Promo_PINS_Batch_20_10USD_16250cards_120215091859908.lst'
}

AMAZON_DIR = 'Amazon'
AMAZON_CODES = {}

MS_DIR = 'Msft'
MS_CODES = {
  'US' => 'msft_us_only.csv'
}

def import_code(type, value)
  DB[:hoc_survey_prizes].insert(type: type, value: value)
end

def import_apple_codes
  APPLE_CODES.each do |country, file_name|
    file_path = File.join(CODES_ROOT, APPLE_DIR, file_name)
    type = "Apple.#{country}"
    puts "Importing #{type} from #{file_path}"
    count = 0
    File.open(file_path).each_line do |line|
      code = line.strip
      next unless code
      import_code type, code
      count+= 1
    end
    puts "  Imported #{count} codes."
  end
end

def import_amazon_codes
  AMAZON_CODES.each do |country, file_name|
    file_path = File.join(CODES_ROOT, AMAZON_DIR, file_name)
    type = "Amazon.#{country}"
    puts "Importing #{type} from #{file_path}"
    count = 0
    File.open(file_path).each_line do |line|
      code = line.strip
      next unless code
      import_code type, code
      count+= 1
    end
    puts "  Imported #{count} codes."
  end
end

def import_ms_codes
  MS_CODES.each do |country, file_name|
    file_path = File.join(CODES_ROOT, MS_DIR, file_name)
    type = "Microsoft.#{country}"
    puts "Importing #{type} from #{file_path}"
    count = 0
    CSV.foreach(file_path, headers: true) do |row|
      code = row[0].strip
      next unless code
      import_code type, code
      count += 1
    end
    puts "  Imported #{count} codes."
  end
end

import_apple_codes
import_amazon_codes
import_ms_codes
