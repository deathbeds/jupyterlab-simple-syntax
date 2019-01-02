import * as OnigasmModuleType from 'onigasm';

import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';

export async function onigasm() {
  return await Private.ensureOnigasm();
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
