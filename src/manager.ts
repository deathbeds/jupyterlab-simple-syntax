import { PromiseDelegate } from '@phosphor/coreutils';

import * as CodeMirror from 'codemirror';

import * as CMTM from 'codemirror-textmate';
import { INITIAL } from 'monaco-textmate';
import { Highlighter } from 'codemirror-textmate/dist/Highlighter';

import { Mode } from '@jupyterlab/codemirror';
import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';
import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ISyntaxManager } from '.';
import { onigasm } from './onigasm';

const _ensure = Mode.ensure;

export class SyntaxManager implements ISyntaxManager {
  private _ready = new PromiseDelegate<void>();
  readonly serverSettings: ServerConnection.ISettings;
  private _modes: ISyntaxManager.IModes;
  private _docRegistry: DocumentRegistry;
  private _tmLoaded: string[] = [];

  constructor(docRegistry: DocumentRegistry) {
    this._docRegistry = docRegistry;
    // Monkey patch ensure for great justice
    Mode.ensure = (mode: string | Mode.ISpec) => this.ensure(mode);
    this.serverSettings = ServerConnection.makeSettings();
    this.fetchGrammars();
  }

  get ready() {
    return this._ready.promise;
  }

  async fetchJSON(...bits: string[]) {
    let response = await ServerConnection.makeRequest(
      this.url(...bits),
      {},
      this.serverSettings
    );
    return await response.json();
  }

  async ensure(mode: string | Mode.ISpec): Promise<Mode.ISpec> {
    console.log('ensuring', mode);
    let spec: Mode.ISpec;

    spec = await this.ensureFromServer(mode);

    if (spec) {
      return spec;
    }

    // use the fallback
    return await _ensure(mode);
  }

  async ensureFromServer(mode: string | Mode.ISpec): Promise<Mode.ISpec> {
    let found: ISyntaxManager.IMode;
    let info: ISyntaxManager.IMode;
    for (let modeName of Object.keys(this._modes)) {
      info = this._modes[modeName];
      if (typeof mode === 'string') {
        if (mode === modeName) {
          found = info;
          break;
        } else if (info.mimeTypes.indexOf(mode as string) >= 0) {
          found = info;
          break;
        }
      }
    }

    if (found) {
      if (found.type === 'tmlanguage') {
        await onigasm();
        return await this.ensureTMMode(found as ISyntaxManager.ITMLanguageMode);
      }
    }
    return null;
  }

  ensureTMModeByScope(scopeName: string) {
    for (let modeName of Object.keys(this._modes)) {
      if ((this._modes[modeName] as any).scopeName === scopeName) {
        return this.ensureTMMode(this._modes[
          modeName
        ] as ISyntaxManager.ITMLanguageMode);
      }
    }
  }

  async ensureTMMode(
    mode: ISyntaxManager.ITMLanguageMode
  ): Promise<Mode.ISpec> {
    let info = this.modeToInfo(mode);
    if (this._tmLoaded.indexOf(mode.name) > -1) {
      return info;
    }
    for (let depends of mode.requiredScopes || []) {
      await this.ensureTMModeByScope(depends);
    }

    let grammar = await this.fetchJSON(mode.path);

    CMTM.addGrammar(grammar.scopeName, async () => grammar);
    await CMTM.activateLanguage(grammar.scopeName, mode.name, 'now');
    const highlighter = new Highlighter();
    const tokenizer = await highlighter.getTokenizer(mode.name);
    CodeMirror.defineMode(mode.name, () => {
      return {
        copyState: (state: any) => ({ ruleStack: state.ruleStack.clone() }),
        startState: () => ({ ruleStack: INITIAL }),
        token: tokenizer
      };
    });
    this._tmLoaded.push(mode.name);
    return info;
  }

  url(...bits: string[]) {
    return URLExt.join(this.serverSettings.baseUrl, 'syntax/', ...bits);
  }

  async fetchGrammars() {
    this._modes = await this.fetchJSON();
    this._ready.resolve(void 0);
    this.registerDocTypes();
  }

  modeToInfo(mode: ISyntaxManager.IMode, mime?: string) {
    return {
      // cm doesn't like leading dots
      ext: mode.extensions.map(e => e.slice(1)),
      mime: mime || mode.mimeTypes[0],
      mode: mode.name,
      name: mode.displayName
    };
  }

  registerDocTypes() {
    let mode: ISyntaxManager.IMode;
    let mime: string;
    for (let name of Object.keys(this._modes)) {
      mode = this._modes[name];
      this._docRegistry.addFileType(mode);
      for (mime of mode.mimeTypes) {
        (CodeMirror as any).defineMIME(mime, mode.name);
        (CodeMirror as any).modeInfo.push(this.modeToInfo(mode));
      }
    }
  }
}
