import {ResponseValidator} from '../../../util/HttpClient';

// Bootstrap data embedded by LessonsController#tutor_gallery.
export type GalleryUnit = {
  id: number;
  name: string;
  position: number;
};

export type GallerySection = {
  id: number;
  name: string;
};

export type TutorGalleryData = {
  currentUnitId: number;
  units: GalleryUnit[];
  sections: GallerySection[];
};

export type GallerySort = 'recent' | 'oldest';

// An emoji reaction on a project and how many classmates left it.
export type Reaction = {
  emoji: string;
  count: number;
};

// GET /challenge_responses/unit_counts returns {unit_id => count} with the
// ids serialized as JSON object keys, i.e. strings.
export const unitCountsValidator: ResponseValidator<
  Record<string, number>
> = bodyJson => {
  if (
    typeof bodyJson !== 'object' ||
    bodyJson === null ||
    Array.isArray(bodyJson)
  ) {
    throw new Error('Expected an object of unit counts');
  }
  return bodyJson as Record<string, number>;
};
