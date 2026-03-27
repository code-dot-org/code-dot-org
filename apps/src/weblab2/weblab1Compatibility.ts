import {DEFAULT_FOLDER_ID} from '@cdo/apps/codebridge/constants';
import {
  MultiFileSource,
  ProjectFile,
  ProjectFolder,
  ProjectSources,
} from '@cdo/apps/lab2/types';
import HttpClient, {GetResponse, NetworkError} from '@cdo/apps/util/HttpClient';

type Weblab1ManifestEntry = {
  filename: string;
  category?: string;
};

type Weblab1ManifestResponse = {
  files: Weblab1ManifestEntry[];
  filesVersionId?: string;
};

type CompatFile = {
  filename: string;
  contents?: string;
  url?: string;
};

const WEBLAB1_COMPAT_QUERY_PARAM = 'weblab1_compat';
const TEXT_FILE_EXTENSIONS = new Set([
  'html',
  'htm',
  'css',
  'js',
  'md',
  'txt',
  'csv',
  'json',
]);
const IMAGE_FILE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'avif',
  'bmp',
  'ico',
]);

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return '';
  }
  return filename.substring(lastDot + 1).toLowerCase();
}

function encodeFileName(filename: string) {
  return encodeURIComponent(filename);
}

function toCompatFileUrl(
  channelId: string,
  filename: string,
  versionId?: string
) {
  const encodedFileName = encodeFileName(filename);
  const versionSuffix = versionId ? `?version=${versionId}` : '';
  return `/v3/files/${channelId}/${encodedFileName}${versionSuffix}`;
}

async function toDataUrl(response: Response): Promise<string> {
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Unable to convert file to data URL'));
      }
    };
    reader.onerror = () => reject(new Error('Unable to read file as data URL'));
    reader.readAsDataURL(blob);
  });
}

function shouldLoadFileContents(entry: Weblab1ManifestEntry): boolean {
  return TEXT_FILE_EXTENSIONS.has(getFileExtension(entry.filename));
}

function isImageFile(entry: Weblab1ManifestEntry): boolean {
  if (entry.category === 'image') {
    return true;
  }
  return IMAGE_FILE_EXTENSIONS.has(getFileExtension(entry.filename));
}

function parseCompatibilityQueryParam(value: string | null): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

export function isWeblab1CompatibilityModeEnabled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  return parseCompatibilityQueryParam(params.get(WEBLAB1_COMPAT_QUERY_PARAM));
}

export function shouldFallbackToWeblab1Files(error: unknown): boolean {
  return error instanceof NetworkError && error.response.status === 404;
}

export function buildMultiFileSourceFromWeblab1Files(
  files: CompatFile[]
): MultiFileSource {
  const folders: Record<string, ProjectFolder> = {};
  const projectFiles: Record<string, ProjectFile> = {};
  const filePathById: Record<string, string> = {};
  const folderPathToId = new Map<string, string>([['', DEFAULT_FOLDER_ID]]);
  let nextFolderId = 1;
  let nextFileId = 1;

  const sortedFiles = [...files].sort((a, b) =>
    a.filename.localeCompare(b.filename)
  );

  sortedFiles.forEach(file => {
    const normalizedPath = file.filename
      .split('/')
      .map(segment => segment.trim())
      .filter(Boolean)
      .join('/');
    if (!normalizedPath) {
      return;
    }

    const segments = normalizedPath.split('/');
    const fileName = segments.pop();
    if (!fileName) {
      return;
    }

    let currentPath = '';
    let parentId = DEFAULT_FOLDER_ID;
    segments.forEach(segment => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      let folderId = folderPathToId.get(currentPath);
      if (!folderId) {
        folderId = String(nextFolderId++);
        folders[folderId] = {
          id: folderId,
          name: segment,
          parentId,
          open: true,
        };
        folderPathToId.set(currentPath, folderId);
      }
      parentId = folderId;
    });

    const fileId = String(nextFileId++);
    projectFiles[fileId] = {
      id: fileId,
      name: fileName,
      contents: file.contents || '',
      folderId: parentId,
      url: file.url,
    };
    filePathById[fileId] = normalizedPath;
  });

  const fileIds = Object.keys(projectFiles);
  const preferredPathPredicates = [
    (path: string) => path.toLowerCase() === 'index.html',
    (path: string) => path.toLowerCase().endsWith('/index.html'),
    (path: string) => path.toLowerCase().endsWith('.html'),
  ];
  const activeFileId =
    preferredPathPredicates
      .map(predicate => fileIds.find(fileId => predicate(filePathById[fileId])))
      .find(Boolean) || fileIds[0];

  if (activeFileId) {
    projectFiles[activeFileId].active = true;
  }

  return {
    folders,
    files: projectFiles,
    openFiles: activeFileId ? [activeFileId] : [],
  };
}

export async function loadWeblab1ProjectAsLab2Sources(
  channelId: string,
  versionId?: string
): Promise<GetResponse<ProjectSources>> {
  let manifestUrl = `/v3/files/${channelId}`;
  if (versionId) {
    manifestUrl += `?version=${versionId}`;
  }
  const manifestResponse = await HttpClient.fetchJson<Weblab1ManifestResponse>(
    manifestUrl
  );
  const manifestFiles = manifestResponse.value?.files || [];

  const compatFiles = await Promise.all(
    manifestFiles.map(async manifestEntry => {
      const fileUrl = toCompatFileUrl(
        channelId,
        manifestEntry.filename,
        versionId
      );

      if (isImageFile(manifestEntry)) {
        try {
          const response = await HttpClient.get(fileUrl);
          return {
            filename: manifestEntry.filename,
            contents: await toDataUrl(response),
          };
        } catch {
          return {
            filename: manifestEntry.filename,
            contents: '',
            url: fileUrl,
          };
        }
      }

      if (!shouldLoadFileContents(manifestEntry)) {
        try {
          const response = await HttpClient.get(fileUrl);
          return {
            filename: manifestEntry.filename,
            contents: await toDataUrl(response),
          };
        } catch {
          return {
            filename: manifestEntry.filename,
            contents: '',
            url: fileUrl,
          };
        }
      }

      try {
        const response = await HttpClient.get(fileUrl);
        const contents = await response.text();
        return {filename: manifestEntry.filename, contents};
      } catch {
        // Fall back to URL-based serving if file text retrieval fails.
        return {
          filename: manifestEntry.filename,
          contents: '',
          url: fileUrl,
        };
      }
    })
  );

  return {
    value: {
      source: buildMultiFileSourceFromWeblab1Files(compatFiles),
    },
    response: manifestResponse.response,
  };
}
