// apparently order is important
import * as CodeMirror from 'codemirror';
import * as CMTM from 'codemirror-textmate';
import { INITIAL } from 'monaco-textmate';
import { Highlighter } from 'codemirror-textmate/dist/Highlighter';

import { Widget } from '@phosphor/widgets';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { onigasm } from './onigasm';

import { TMLANG_MIME_TYPE } from '.';

const DEBUG = false;

export class TextMateLanguageRenderer extends Widget
  implements IRenderMime.IRenderer {
  async renderModel(model: any) {
    let grammar = model.data[TMLANG_MIME_TYPE];
    let _onigasm = await onigasm();

    if (DEBUG) {
      console.log(_onigasm);
    }

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
