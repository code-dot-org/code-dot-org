import {BaseEntry, EntrySkeletonType, FieldsType} from 'contentful';

export type Entry<EntrySkeleton extends FieldsType> = BaseEntry &
  EntrySkeletonType<EntrySkeleton>;
