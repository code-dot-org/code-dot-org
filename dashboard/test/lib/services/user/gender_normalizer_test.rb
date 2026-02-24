require 'test_helper'

class Services::User::GenderNormalizerTest < ActiveSupport::TestCase
  let(:described_instance) {described_class.new(raw_input: raw_input)}
  let(:raw_input) {nil}

  describe '#call' do
    subject(:normalize) {described_instance.call}

    context 'when female' do
      f_values = %w(f F female Female girl gal woman feminine she her mujer femail fem 여자 여 여성 kız kadın perempuan أنثى بنت انثي žena weiblich vrouw meisje kobieta fille féminin donna chica kvinde pige tjej kvinna ស្រី famale gril)
      f_values.each do |value|
        context "with input #{value}" do
          let(:raw_input) {value}

          it "returns #{Services::User::GenderNormalizer::FEMALE}" do
            _normalize.must_equal Services::User::GenderNormalizer::FEMALE
          end
        end
      end
    end

    context 'when male' do
      m_values = ['m', 'M', 'male', 'Male', 'boy', 'guy', 'man', 'masculine', 'him', 'he', 'hombre', 'dude', 'mail', '남자', '남성', 'erkek', 'laki laki', 'laki-laki', 'männlich', 'mänlich', 'jongen', 'muž', 'mężczyzna', 'homme', 'maschio', 'uomo', 'macho', 'chico', 'pojke', 'mal', 'homem']
      m_values.each do |value|
        context "with input #{value}" do
          let(:raw_input) {value}

          it "returns #{Services::User::GenderNormalizer::MALE}" do
            _normalize.must_equal Services::User::GenderNormalizer::MALE
          end
        end
      end
    end

    context 'when non-binary' do
      n_values = ['n', 'they', 'them', 'nonbinary', 'NonBinary', 'non-binary', 'non binary', 'intersex', 'inter sex', 'genderfluid', 'gender fluid', 'intergender', 'inter gender', 'agender', 'boyflux', 'trans', 'transgender', 'x']
      n_values.each do |value|
        context "with input #{value}" do
          let(:raw_input) {value}

          it "returns #{Services::User::GenderNormalizer::NON_BINARY} for #{value}" do
            _normalize.must_equal Services::User::GenderNormalizer::NON_BINARY
          end
        end
      end
    end

    context 'when other' do
      o_values = ['o', 'O', 'notlisted', 'some nonsense']
      o_values.each do |value|
        context "with input #{value}" do
          let(:raw_input) {value}

          it "returns #{Services::User::GenderNormalizer::OTHER} for #{value}" do
            _normalize.must_equal Services::User::GenderNormalizer::OTHER
          end
        end
      end
    end

    context 'when blank' do
      let(:raw_input) {''}

      it 'returns nil' do
        _normalize.must_be_nil
      end
    end

    context 'when nil' do
      it 'returns nil' do
        _normalize.must_be_nil
      end
    end
  end
end
