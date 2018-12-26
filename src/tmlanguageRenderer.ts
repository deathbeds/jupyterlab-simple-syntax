// tslint:disable-next-line
/// <reference path="./@types/codemirror/codemirror.d.ts"/>

// apparently order is important
import 'codemirror/addon/mode/simple';
import { registerGrammar } from 'codemirror-atom-modes';
import * as CodeMirror from 'codemirror';

import { Widget } from '@phosphor/widgets';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { TMLANG_MIME_TYPE } from '.';

export class TextMateLanguageRenderer extends Widget
  implements IRenderMime.IRenderer {
  async renderModel(model: any) {
    let grammar = model.data[TMLANG_MIME_TYPE];

    // we need to augment a few things with metadata
    let { mode, mime, name, ext, options } = model.metadata;

    // options can consist of scopeTranslations mapping some.thing.lang to
    // CodeMirror tokens
    registerGrammar(grammar, options, CodeMirror);

    // next, make it accessible to mime-type lookups
    CodeMirror.defineMIME(mime, mode);

    // remove a spec if necessary
    let toRemove: number = null;
    let info;
    for (let i in CodeMirror.modeInfo) {
      info = CodeMirror.modeInfo[i];
      if (info.mode === mode) {
        toRemove = +i;
        break;
      }
    }

    if (toRemove != null) {
      CodeMirror.modeInfo.splice(toRemove, 1);
    }

    // finally, add it where meta.js can find it (findByFileType, etc.)
    CodeMirror.modeInfo.push({ ext, mime, mode, name });
  }
}
