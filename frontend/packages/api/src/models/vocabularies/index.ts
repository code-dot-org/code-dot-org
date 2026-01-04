/** Defines a vocabulary definition in internal unit data */
export interface VocabularyDefinition {
  key: string;
  word: string;
  definition: string;
  seeding_key: {
    ['vocabulary.key']: string;
  };
}
