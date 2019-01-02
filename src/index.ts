import { Token } from '@phosphor/coreutils';
import { DocumentRegistry } from '@jupyterlab/docregistry';

export const LABEL = 'Simple Syntax';
export const NAME = '@deathbeds/jupyterlab-simple-syntax';

export const PLUGIN_ID = `${NAME}:plugin`;
export const MIME_TYPE = 'application/vnd.jupyter.simplemode.v1+json';
export const FILE_TYPE = 'simplemode';

export const TMLANG_MIME_TYPE = 'application/vnd.jupyter.tmlanguage.v1+json';
export const TMLANG_FILE_TYPE = 'tmlanguage';

/* tslint:disable */
/**
 * The syntax manager token.
 */
export const ISyntaxManager = new Token<ISyntaxManager>(
  '@deathbeds/jupyterlab-simple-syntax:manager'
);
/* tslint:enable */

export interface ISyntaxManager {
  ready: Promise<void>;
}

export namespace ISyntaxManager {
  export interface IModes {
    [key: string]: ITMLanguageMode | ISimpleMode;
  }

  export interface IMode extends DocumentRegistry.IFileType {
    type: string;
    path: string;
  }

  export interface ITMLanguageMode extends IMode {
    scopeName: string;
    type: 'tmlanguage';
    requiredScopes?: string[];
  }

  export interface ISimpleMode extends IMode {
    type: 'simplemode';
  }
}
