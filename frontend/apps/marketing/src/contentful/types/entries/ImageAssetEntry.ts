import {ContentfulEntry} from '@/contentful/types/entries/ContentfulEntry';

type ImageAssetEntryFields = {
  description?: string;
  title?: string;
  file: {
    url: string;
    contentType?: string;
    details: {
      image: {
        width?: number;
        height?: number;
      };
      size?: number;
    };
  };
};

export type ImageAssetEntry = ContentfulEntry<ImageAssetEntryFields>;
