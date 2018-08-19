const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const UglifyJSplugin = require('uglifyjs-webpack-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  watch: true,
  watchOptions: {
    ignored: /node_modules/, //忽略不用监听变更的目录
    poll: 1000, //每秒询问的文件变更的次数
    aggregateTimeout: 500 //防止重复保存频繁重新编译,500毫秒内重复保存不打包
  },
  // devtool:'source-map' //把映射文件生成到单独的文件，最完整最慢
  // devtool:'cheap-module-source-map' // 在一个单独的文件中产生一个不带列映射的Map
  devtool: 'eval-source-map', //使用eval打包源文件模块,在同一个文件中生成完整sourcemap
  // devtool:'cheap-module-eval-source-map' //ourcemap和打包后的JS同行显示，没有映射列
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    host: 'localhost',
    compress: true,
    port: 8080
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env', 'stage-0', 'react'],
            plugins: ['transform-decorators-legacy']
          }
        },
        include: path.join(__dirname, 'src'),
        exclude: /node_modules/
      },
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
    }),
    new webpack.BannerPlugin('webpackTest'),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src/assets'), //静态资源目录源地址
        to: path.resolve(__dirname, 'dist/assets') //目标地址，相对于output的path目录
      }
    ])
  ]
}
