import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

/**
 * A mime renderer factory for data.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: false,
  mimeTypes: Object.keys(C.TYPES),
  createRenderer: options => new RenderedGraphviz(options)
};

const extensions = Object.keys(C.TYPES).map(k => {
  const name = C.TYPES[k].name;
  return {
    id: `@deathbeds/jupyterlab_graphviz:${name}`,
    name,
    rendererFactory,
    rank: 0,
    dataType: 'string',
    fileTypes: [
      {
        name,
        extensions: C.TYPES[k].extensions,
        mimeTypes: [k],
        iconClass: 'jp-MaterialIcon jp-GraphvizIcon'
      }
    ],
    documentWidgetFactoryOptions: {
      name,
      primaryFileType: name,
      fileTypes: [name],
      defaultFor: [name]
    }
  } as IRenderMime.IExtension;
});

export default extensions;
