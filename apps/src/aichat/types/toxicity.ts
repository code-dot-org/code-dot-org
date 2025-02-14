import {FIELDS_CHECKED_FOR_TOXICITY} from '../views/modelCustomization/constants';

/** Response structure for the detect toxicity API */
export interface DetectToxicityResponse {
  flaggedFields: FlaggedField[];
}

export type ToxicityCheckedField = (typeof FIELDS_CHECKED_FOR_TOXICITY)[number];

export interface FlaggedField {
  field: ToxicityCheckedField;
  toxicity: {
    text: string;
    blockedBy: SafetyService;
    details: BlocklistDetails | WebPurifyDetails | ComprehendDetails;
  };
}

type SafetyService = 'blocklist' | 'webpurify' | 'comprehend';

interface BlocklistDetails {
  blockedWord: string;
}

interface WebPurifyDetails {
  type: 'email' | 'address' | 'phone' | 'profanity';
  content: string;
}

interface ComprehendDetails {
  flaggedSegment: string;
  toxicity: number;
  maxCategory: {
    name: string;
    score: number;
  };
}
