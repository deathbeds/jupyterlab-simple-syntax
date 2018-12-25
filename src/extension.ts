import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/coreutils';

import { ISimpleModeManager, PLUGIN_ID } from '.';
import { SimpleModeManager } from './manager';

const plugin: JupyterLabPlugin<ISimpleModeManager> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [IMainMenu, ISettingRegistry, ICommandPalette, INotebookTracker],
  provides: ISimpleModeManager,
  activate: function(
    app: JupyterLab,
    menu: IMainMenu,
    settingRegistry: ISettingRegistry,
    palette: ICommandPalette,
    notebooks: INotebookTracker
  ): ISimpleModeManager {
    console.log('YGNI', app, menu, settingRegistry, palette, notebooks);
    const manager = new SimpleModeManager();
    return manager;
  }
};

export default plugin;
