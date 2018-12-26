import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { NAME, MIME_TYPE, LABEL, FILE_TYPE } from '.';
import { SimpleSyntaxRenderer } from './renderer';

/**
 * A mime renderer factory for JSON-based syntax highlighting.
 */
const extension: IRenderMime.IExtension | IRenderMime.IExtension[] = [
  {
    id: `${NAME}:factory`,
    rendererFactory: {
      safe: false,
      mimeTypes: [MIME_TYPE],
      createRenderer: () => new SimpleSyntaxRenderer()
    },
    rank: 99,
    dataType: 'json',
    fileTypes: [
      {
        name: FILE_TYPE,
        extensions: ['.simplemode', '.simplemode.json'],
        mimeTypes: [MIME_TYPE],
        iconClass: 'jp-MaterialIcon'
      }
    ],
    documentWidgetFactoryOptions: {
      name: LABEL,
      primaryFileType: FILE_TYPE,
      fileTypes: [FILE_TYPE, 'json'],
      defaultFor: [FILE_TYPE]
    }
  }
];

export default extension;
