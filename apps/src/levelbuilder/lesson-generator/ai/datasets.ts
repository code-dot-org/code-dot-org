// Snapshot of the AI Lab dataset roster, sourced from ml-playground's
// public/datasets-manifest.json. Refresh by hand from
//   https://github.com/code-dot-org/ml-playground/blob/main/public/datasets-manifest.json
// when the upstream list changes; we keep the snapshot here so the
// generator can hand the model a closed enum of dataset ids without a
// runtime fetch.

export interface AilabDataset {
  id: string;
  name: string;
  isToy?: boolean;
}

export const AILAB_DATASETS = [
  {id: 'songs', name: 'Top Songs'},
  {id: 'basketball_shots', name: 'NCAA 3-Point Attempts'},
  {id: 'exoplanets', name: 'Exoplanets'},
  {id: 'thanksgiving', name: 'Regional Thanksgiving Food Survey'},
  {id: 'jeans', name: 'Jeans Measurements'},
  {id: 'bike_sharing', name: 'Bike Sharing'},
  {id: 'billionaires', name: 'Billionaires'},
  {id: 'census', name: 'Partial Census Data'},
  {id: 'happiness_raw', name: 'Global Happiness'},
  {id: 'housing', name: 'Housing Prices'},
  {id: 'insurance', name: 'Insurance Data'},
  {id: 'heart', name: 'Heart Health'},
  {id: 'zoo', name: 'Zoo'},
  {id: 'tacos_toy', name: 'Tacos', isToy: true},
  {id: 'icecream_toy', name: 'Ice Cream', isToy: true},
  {id: 'pizza_toy', name: 'Pizza', isToy: true},
  {id: 'boba_toy', name: 'Bubble Tea', isToy: true},
  {id: 'cookies_toy', name: 'Cookies', isToy: true},
  {id: 'naan_toy', name: 'Naan', isToy: true},
  {id: 'poke_toy', name: 'Poke', isToy: true},
  {id: 'poutine_toy', name: 'Poutine', isToy: true},
  {id: 'raspado_toy', name: 'Raspado', isToy: true},
  {id: 'salad_toy', name: 'Salad', isToy: true},
  {id: 'salsa_toy', name: 'Salsa', isToy: true},
  {id: 'safari_toy', name: 'Safari', isToy: true},
  {id: 'medical_priority', name: 'Medical Priority'},
  {id: 'nutrition', name: 'Nutrition'},
  {id: 'student_survey', name: 'Student Lifestyle Survey'},
  {id: 'abalone', name: 'Abalone'},
  {id: 'movies', name: 'Movie Stats'},
  {id: 'car_evaluation', name: 'Car Evaluation'},
  {id: 'loneliness_interests', name: 'Student Survey - Personal Interests'},
  {id: 'loneliness_movies', name: 'Student Survey - Movies'},
  {id: 'loneliness_music', name: 'Student Survey - Music'},
  {id: 'loneliness_personality', name: 'Student Survey - Personality'},
  {id: 'loneliness_phobias', name: 'Student Survey - Phobias'},
  {id: 'club_biased_toy', name: "Nico's Club Survey", isToy: true},
  {id: 'club_sparse_toy', name: "Zoey's Club Survey", isToy: true},
  {id: 'club_random_toy', name: "Isaac's Club Survey", isToy: true},
  {id: 'club_specific_toy', name: "Kim's Club Survey", isToy: true},
  {id: 'shapes_v1_toy', name: 'Shapes V1', isToy: true},
  {id: 'shapes_v2_toy', name: 'Shapes V2', isToy: true},
  {id: 'shoe_survey_toy', name: 'Shoes Survey', isToy: true},
] as const satisfies readonly AilabDataset[];

export type AilabDatasetId = (typeof AILAB_DATASETS)[number]['id'];
