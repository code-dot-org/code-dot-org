import {Entry} from 'contentful-management';

export type Environment = 'development' | 'test' | 'production';

export type CreateOrUpdateEntryInputProps = {
  contentType: string;
  entryId?: string;
  entryContent: Entry;
  publish: boolean;
  environment: Environment;
  reuseId?: boolean;
};

export type CreateOrUpdateEntryType = ({
  contentType,
  entryContent,
  environment,
  publish,
  reuseId,
}: CreateOrUpdateEntryInputProps) => Promise<Entry>;

export type SerializedComponent = {
  entryContent: Entry;
  contentType: string;
};
