const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    host: 'localhost',
    compress: true,
    port: 8080
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src')
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html'
    })
  ]
}
