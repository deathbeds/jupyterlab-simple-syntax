import { Token } from '@phosphor/coreutils';

export const PLUGIN_ID = '@deathbeds/jupyterlab-simple-syntax:plugin';
export const MIME_TYPE = 'application/vnd.jupyter.simplemode.v1+json';

export interface ISimpleModeManager {}

// tslint:disable-next-line
export const ISimpleModeManager = new Token<ISimpleModeManager>(
  '@deathbeds/jupyterlab-fonts:IFontManager'
);
