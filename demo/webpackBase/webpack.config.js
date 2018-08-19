const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const UglifyJSplugin = require('uglifyjs-webpack-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
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
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'postcss-loader'
        ],
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src')
      },
      {
        test: /\.less/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.scss/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(jpg|png|bmp|gif|svg|ttf|woff|woff2|eot)/,
        use: [
          {
            loader: 'url-loader',
            options: {
              //小于这个大小的图片会变成base64 格式
              limit: 4096,
              outputPath: 'images',
              publicPath: '/images'
            }
          }
        ]
      },
      {
        test: /\.(html|htm)$/,
        use: 'html-withimg-loader'
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJSplugin({
        cache: true, //启用缓存
        parallel: true, // 使用多进程运行改进编译速度
        sourceMap: true //生成sourceMap映射文件
      }),
      new OptimizeCssAssetsWebpackPlugin()
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      hunkFilename: 'css/[id].css'
    })
  ]
}
