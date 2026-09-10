const path = require('path');
const fs = require('fs');

module.exports = {
  entry: {
    renderer: './src/renderer/index.tsx',
    auth: './src/auth/index.tsx',
  },
  target: 'electron-renderer',
  mode: 'none',
  devtool: 'cheap-module-source-map',
  output: {
    filename: '[name].js',
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
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('CopyHtml', () => {
          fs.copyFileSync('src/renderer.html', 'dist/renderer.html');
          fs.copyFileSync('src/auth.html', 'dist/auth.html');
        });
      },
    },
  ],
};
