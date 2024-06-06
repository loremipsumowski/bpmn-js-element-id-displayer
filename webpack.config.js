/* eslint-env node */

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: isProduction ? './src/index.js' : './example/app.js',
    output: {
      path: isProduction ? path.join(__dirname, 'dist') : path.join(__dirname, 'public'),
      filename: isProduction ? 'bpmn-js-element-id-displayer.bundle.js' : 'app.js',
      library: isProduction ? 'BpmnJsElementIdDisplayer' : undefined,
      libraryTarget: isProduction ? 'umd' : undefined,
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          type: 'asset/source'
        },
        {
          test: /\.bpmn$/,
          type: 'asset/source'
        }
      ]
    },
    plugins: isProduction ? [] : [
      new CopyPlugin({
        patterns: [
          { from: '*.{html,css}', context: 'example', to: '.' },
          { from: 'bpmn-js/dist/assets/**/*', context: 'node_modules', to: './vendor' },
        ],
      }),
    ],
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    devServer: isProduction ? undefined : {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 9000,
      open: true,
    }
  };
};
