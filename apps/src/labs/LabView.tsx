import React, { FunctionComponent } from 'react';

// ingest appOptions from backend into AppOptions type

interface Editor {
  run: () => String
}

class CodeMirror implements Editor {
  run() {
    return 'codemirror'
  }
}

class Droplet implements Editor {
  run() {
    return 'droplet'
  }
}

interface Lab {
  editor: Editor
}

class Applab implements Lab {
  editor: Editor

  constructor() {
    this.editor = new Droplet()
  }
}

class Javalab implements Lab {
  editor: Editor

  constructor() {
    this.editor = new CodeMirror()
  }
}

const LabView: FunctionComponent = () => {
  return <div>Hello from lab lab</div>
}

export default LabView