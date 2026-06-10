// Hard-coded example for the collaborative challenge space: a group review
// "sort the scenarios into a risk level" activity. In the real feature the deck
// would be assembled from cards different students draft; here the seed cards
// stand in for those contributions (each tagged with a classmate's initials),
// and the current student can draft more. Prototype content — not yet keyed by
// lesson.

export interface CollaborativeCategory {
  id: string;
  label: string;
  description: string;
  // Drives the accent color of the zone's label pill.
  tone: 'low' | 'medium' | 'high' | 'critical';
}

export interface CollaborativeCard {
  id: string;
  text: string;
  // Initials of the student who contributed the card, shown bottom-right.
  initials: string;
  // The id of the category this card belongs in. Seed cards have a known
  // answer; student-drafted cards do not (undefined) and are not graded.
  correctCategoryId?: string;
}

export interface CollaborativeSortActivity {
  prompt: string;
  categories: CollaborativeCategory[];
  cards: CollaborativeCard[];
}

export const COLLABORATIVE_SORT_EXAMPLE: CollaborativeSortActivity = {
  prompt: 'Drag each scenario into a risk level below',
  categories: [
    {
      id: 'low',
      label: 'Low risk',
      description: 'Mistakes are minor or easily caught',
      tone: 'low',
    },
    {
      id: 'medium',
      label: 'Medium risk',
      description: 'Errors could mislead or waste time',
      tone: 'medium',
    },
    {
      id: 'high',
      label: 'High risk',
      description: 'Wrong info could cause real harm',
      tone: 'high',
    },
    {
      id: 'critical',
      label: 'Critical risk',
      description: 'A hallucination here could be dangerous',
      tone: 'critical',
    },
  ],
  cards: [
    {
      id: 'playlist',
      text: 'Asking AI to suggest a fun playlist for a road trip',
      initials: 'JD',
      correctCategoryId: 'low',
    },
    {
      id: 'book-report',
      text: "Using AI to get a summary of a novel's plot for a book report",
      initials: 'MR',
      correctCategoryId: 'medium',
    },
    {
      id: 'dosage',
      text: "Asking AI what dosage of medication to take when you're sick",
      initials: 'AL',
      correctCategoryId: 'critical',
    },
    {
      id: 'law',
      text: 'Asking AI to explain what a law means and whether your rights were violated',
      initials: 'SP',
      correctCategoryId: 'high',
    },
    {
      id: 'restaurant',
      text: "Asking AI for restaurant recommendations in a city you're visiting",
      initials: 'KT',
      correctCategoryId: 'low',
    },
    {
      id: 'symptoms',
      text: "Asking AI to help diagnose mysterious symptoms you've been having",
      initials: 'RW',
      correctCategoryId: 'critical',
    },
    {
      id: 'history',
      text: 'Using AI to check historical facts for a homework essay',
      initials: 'JD',
      correctCategoryId: 'medium',
    },
    {
      id: 'visa',
      text: 'Asking AI whether you need a visa to travel to a specific country',
      initials: 'MR',
      correctCategoryId: 'high',
    },
    {
      id: 'poem',
      text: 'Asking AI to write a funny poem about your pet',
      initials: 'AL',
      correctCategoryId: 'low',
    },
    {
      id: 'circuit',
      text: 'Asking AI to explain how a complex electrical circuit works before you wire it yourself',
      initials: 'SP',
      correctCategoryId: 'critical',
    },
  ],
};
