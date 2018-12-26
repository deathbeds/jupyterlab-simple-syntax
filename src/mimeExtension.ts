import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import {
  NAME,
  MIME_TYPE,
  LABEL,
  FILE_TYPE,
  TMLANG_MIME_TYPE,
  TMLANG_FILE_TYPE
} from '.';
import { SimpleSyntaxRenderer } from './renderer';
import { TextMateLanguageRenderer } from './tmlanguageRenderer';

/**
 * A mime renderer factory for JSON-based syntax highlighting.
 */
const extension: IRenderMime.IExtension | IRenderMime.IExtension[] = [
  {
    id: `${NAME}:simplefactory`,
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
  },
  {
    id: `${NAME}:tmlanguagefactory`,
    rendererFactory: {
      safe: false,
      mimeTypes: [TMLANG_MIME_TYPE],
      createRenderer: () => new TextMateLanguageRenderer()
    },
    rank: 99,
    dataType: 'json',
    fileTypes: [
      {
        name: TMLANG_FILE_TYPE,
        extensions: ['.tmlanguage', '.tmlanguage.json'],
        mimeTypes: [TMLANG_MIME_TYPE],
        iconClass: 'jp-MaterialIcon'
      }
    ],
    documentWidgetFactoryOptions: {
      name: 'TextMate Language',
      primaryFileType: TMLANG_FILE_TYPE,
      fileTypes: [TMLANG_FILE_TYPE, 'json'],
      defaultFor: [TMLANG_FILE_TYPE]
    }
  }
];

export default extension;
