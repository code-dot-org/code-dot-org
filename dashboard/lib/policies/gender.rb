class Policies::Gender
  MALE_REGEX = /(^m$|\bmale|boy|guy|\bm(a|e)n|masculin|him|\bhe\b|hombre|dude|\bmail)/
  FEMALE_REGEX = /(^f$|\bfemal|girl|gal|\bwom(a|e)n|fem(e|i)nin|she|\bher|mujer|\bfemail|\bfem)/
  NON_BINARY_REGEX = /(^n$|they|them|non((\ |-)?)binary|inter(\ )?sex|gender(\ )?fluid|inter(\ )?gender|agender|boyflux|\btrans|\bit)/

  def self.normalize(gender)
    return nil if gender.blank?
    lowercase_gender = gender.downcase
    if NON_BINARY_REGEX.match(lowercase_gender)
      return 'n'
    elsif MALE_REGEX.match(lowercase_gender)
      return 'm'
    elsif FEMALE_REGEX.match(lowercase_gender)
      return 'f'
    else
      return 'o'
    end
  end
end
