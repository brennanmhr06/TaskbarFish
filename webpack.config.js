const path = require('path');

module.exports = {
  entry: './src/renderer/index.tsx',
  target: 'electron-renderer',
  mode: 'none',
  devtool: 'cheap-module-source-map',
  output: {
    filename: 'renderer.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: 'tsconfig.renderer.json',
        },
      },
    ],
  },
};
