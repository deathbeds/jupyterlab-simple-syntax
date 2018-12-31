// apparently order is important
import * as CodeMirror from 'codemirror';
import * as OnigasmModuleType from 'onigasm';
import * as CMTM from 'codemirror-textmate';
import { INITIAL } from 'monaco-textmate';
import { Highlighter } from 'codemirror-textmate/dist/Highlighter';

import { Widget } from '@phosphor/widgets';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';

import { TMLANG_MIME_TYPE } from '.';

export class TextMateLanguageRenderer extends Widget
  implements IRenderMime.IRenderer {
  async renderModel(model: any) {
    let grammar = model.data[TMLANG_MIME_TYPE];
    console.log(grammar);

    let onigasm = await Private.ensureOnigasm();
    console.log(onigasm);

    // we need to augment a few things with metadata
    let { mode, mime, name, ext } = model.metadata;
    CMTM.addGrammar(grammar.scopeName, async () => grammar);
    await CMTM.activateLanguage(grammar.scopeName, name, 'now');
    const highlighter = new Highlighter();
    const tokenizer = await highlighter.getTokenizer(mode);
    CodeMirror.defineMode(mode, () => {
      return {
        copyState: (state: any) => ({ ruleStack: state.ruleStack.clone() }),
        startState: () => ({ ruleStack: INITIAL }),
        token: tokenizer
      };
    });

    // options can consist of scopeTranslations mapping some.thing.lang to
    // CodeMirror tokens
    // registerGrammar(grammar, options, CodeMirror);

    // next, make it accessible to mime-type lookups
    (CodeMirror as any).defineMIME(mime, mode);

    // remove a spec if necessary
    let toRemove: number = null;
    let info;
    for (let i in (CodeMirror as any).modeInfo) {
      info = (CodeMirror as any).modeInfo[i];
      if (info.mode === mode) {
        toRemove = +i;
        break;
      }
    }

    if (toRemove != null) {
      (CodeMirror as any).modeInfo.splice(toRemove, 1);
    }

    // finally, add it where meta.js can find it (findByFileType, etc.)
    (CodeMirror as any).modeInfo.push({ ext, mime, mode, name });
  }
}

/**
 * A namespace for private module data.
 */
namespace Private {
  /**
   * A cached reference to the vega library.
   */
  export let onigasm: typeof OnigasmModuleType;

  /**
   * A Promise for the initial load of vega.
   */
  export let onigasmReady: Promise<typeof OnigasmModuleType>;

  export function baseURL() {
    return (
      URLExt.join(ServerConnection.makeSettings().baseUrl, 'syntax', 'vendor') +
      '/'
    );
  }

  /**
   * Lazy-load and cache the vega-embed library
   */
  export function ensureOnigasm(): Promise<typeof OnigasmModuleType> {
    if (onigasmReady) {
      return onigasmReady;
    }

    onigasmReady = new Promise((resolve, reject) => {
      require.ensure(
        ['onigasm'],
        // see https://webpack.js.org/api/module-methods/#require-ensure
        // this argument MUST be named `require` for the WebPack parser
        require => {
          console.log('outer');
          onigasm = require('onigasm') as typeof OnigasmModuleType;
          const { loadWASM } = onigasm;
          loadWASM(URLExt.join(baseURL(), 'onigasm/onigasm.wasm')).then(() => {
            resolve(onigasm);
          });
        },
        (error: any) => {
          console.error(error);
          reject();
        },
        'onigasm'
      );
    });

    return onigasmReady;
  }
}
