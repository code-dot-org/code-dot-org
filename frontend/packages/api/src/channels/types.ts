import type {ProjectType} from '../projects/types';
import type {ProjectSources} from '../sources/types';

/** Identifies a project. Corresponds to the "value" JSON column for the entry in the projects table. */
export interface Channel {
  id: string;
  name: string;
  isOwner: boolean;
  projectType: ProjectType;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  hidden?: boolean;
  thumbnailUrl?: string;
  frozen?: boolean;
  // Optional lab-specific configuration for this project.  If provided, this will be saved
  // to the Project model in the database along with the other entries in this interface,
  // inside the value field JSON.
  labConfig?: {[key: string]: {[key: string]: string}};
}

/** A project and its corresponding sources if present, fetched together when loading a level. */
export interface ProjectAndSources {
  // When projects are loaded for the first time, sources may not be present
  sources?: ProjectSources;
  channel: Channel;
  abuseScore?: number;
  sharingDisabled?: boolean;
}
