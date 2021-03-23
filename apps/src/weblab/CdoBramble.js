import {removeDisallowedHtmlContent} from './brambleUtils';

export default class CdoBramble {
  constructor(Bramble, store, url, projectPath, disallowedHtmlTags) {
    this.Bramble = Bramble;
    this.store = store;
    this.url = url;
    this.projectPath = projectPath;
    this.disallowedHtmlTags = disallowedHtmlTags;
    this.brambleProxy = null;
    this.onMountableCallbacks = [];
    this.onReadyCallbacks = [];
    this.onProjectChangedCallbacks = [];
    this.recentChanges = [];
  }

  init() {
    this.Bramble.load('#bramble', this.config());

    this.Bramble.on('readyStateChange', (_, newState) => {
      this.Bramble.MOUNTABLE === newState &&
        this.invokeAll(this.onMountableCallbacks);
    });

    this.Bramble.once('ready', brambleProxy => {
      this.brambleProxy = brambleProxy;
      this.configureProxy();
      this.invokeAll(this.onReadyCallbacks);
    });
  }

  on(event, callback) {
    switch (event) {
      case 'mountable':
        this.onMountableCallbacks.push(callback);
        break;
      case 'ready':
        this.onReadyCallbacks.push(callback);
        break;
      case 'projectChange':
        this.onProjectChangedCallbacks.push(callback);
        break;
      default:
        console.error(`CdoBramble unknown event type '${event}'`);
    }

    return this;
  }

  config() {
    const {
      maxProjectCapacity,
      pageConstants
    } = this.store.getStore().getState();

    return {
      url: this.url,
      useLocationSearch: true,
      disableUIState: true,
      capacity: maxProjectCapacity,
      initialUIState: {
        theme: 'light-theme',
        readOnly: pageConstants.isReadOnlyWorkspace
      },
      extensions: {
        disable: ['bramble-move-file']
      }
    };
  }

  configureProxy() {
    const proxy = this.brambleProxy;

    proxy.disableJavaScript(); // Prevents JS from executing.
    proxy.on('inspectorChange', this.onInspectorChanged.bind(this));
    proxy.on('fileChange', this.onFileChanged.bind(this));
    proxy.on('fileDelete', this.onFileDeleted.bind(this));
    proxy.on('fileRename', this.onFileRenamed.bind(this));
    proxy.on('projectSizeChange', this.onProjectSizeChanged.bind(this));
  }

  onInspectorChanged({enabled}) {
    const {getStore, actions} = this.store;
    getStore().dispatch(actions.changeInspectorOn(enabled));
  }

  handleFileChange(path) {
    var cleanedPath = this.cleanPath(path);
    const hasExistingChangeForPath = this.recentChanges.some(
      change => change.operation === 'change' && change.file === cleanedPath
    );

    // Only add 'change' operation if one isn't already queued for that file.
    if (!hasExistingChangeForPath) {
      this.recentChanges.push({
        operation: 'change',
        file: cleanedPath,
        fileDataPath: cleanedPath
      });
    }

    this.invokeAll(this.onProjectChangedCallbacks);
  }

  onFileChanged(path) {
    removeDisallowedHtmlContent(
      this.Bramble.getFileSystem(),
      this.brambleProxy,
      path,
      this.disallowedHtmlTags,
      this.handleFileChange.bind(this)
    );
  }

  onFileDeleted(path) {
    this.recentChanges.push({
      operation: 'delete',
      file: this.cleanPath(path)
    });

    this.invokeAll(this.onProjectChangedCallbacks);
  }

  onFileRenamed(oldPath, newPath) {
    const cleanedOldPath = this.cleanPath(oldPath);
    const cleanedNewPath = this.cleanPath(newPath);

    // Update the fileDataPath for any pending 'change' operations (new or modified files).
    this.recentChanges = this.recentChanges.map(change => {
      if (
        change.operation === 'change' &&
        change.fileDataPath === cleanedOldPath
      ) {
        change = {...change, fileDataPath: cleanedNewPath};
      }

      return change;
    });
    this.recentChanges.push({
      operation: 'rename',
      file: cleanedOldPath,
      newFile: cleanedNewPath
    });

    this.invokeAll(this.onProjectChangedCallbacks);
  }

  onProjectSizeChanged(bytes, _) {
    const {getStore, actions} = this.store;
    getStore().dispatch(actions.changeProjectSize(bytes));
  }

  cleanPath(path) {
    return path.replace(this.projectPath, '');
  }

  invokeAll(callbacks) {
    callbacks.forEach(callback => callback());
  }
}
