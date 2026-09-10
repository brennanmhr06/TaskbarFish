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
          
          // Copy sounds folder
          const soundsSource = path.join(__dirname, 'src/sounds');
          const soundsDest = path.join(__dirname, 'dist/sounds');
          if (!fs.existsSync(soundsDest)) {
            fs.mkdirSync(soundsDest, { recursive: true });
          }
          fs.readdirSync(soundsSource).forEach(file => {
            fs.copyFileSync(path.join(soundsSource, file), path.join(soundsDest, file));
          });
        });
      },
    },
  ],
};
