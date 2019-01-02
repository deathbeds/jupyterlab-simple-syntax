import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';

import { ISyntaxManager } from '.';
import { SyntaxManager } from './manager';

const extension: JupyterLabPlugin<ISyntaxManager> = {
  id: '@deathbeds/jupyterlab-simple-syntax',
  autoStart: true,
  provides: ISyntaxManager,
  activate: (app: JupyterLab) => {
    const manager = new SyntaxManager(app.docRegistry);
    console.log('activated', manager);
    return manager;
  }
};

export default extension;
