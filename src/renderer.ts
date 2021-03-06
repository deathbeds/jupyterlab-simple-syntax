// tslint:disable-next-line

// apparently order is important
import 'codemirror/addon/mode/simple';
import * as CodeMirror from 'codemirror';

import { Widget } from '@phosphor/widgets';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { MIME_TYPE } from '.';

export class SimpleSyntaxRenderer extends Widget
  implements IRenderMime.IRenderer {
  async renderModel(model: any) {
    let spec = model.data[MIME_TYPE];

    let { mode, mime, name, ext, states } = spec;

    // don't bother with broken modes
    if (!(mode && mime && name && ext && states)) {
      console.warn('aborting', mode, mime, name, ext);
      return;
    }

    // first, define the mode, with the canonical `mode` spec
    (CodeMirror as any).defineSimpleMode(mode, states);

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
