// rollup.config.js
import ts from '@wessberg/rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const browserPlugins = [];

export default {
  input: 'src/index.ts',
  output: [{
    file: 'lib/browser.js',
    format: 'esm',
    sourcemap: true,
    plugins: browserPlugins,
  }, {
    file: 'lib/browser.min.js',
    format: 'esm',
    sourcemap: true,
    plugins: [...browserPlugins, terser()],
  }],
  plugins: [ts(), commonjs(), resolve({
    browser: true,
  })],
};
