// https://segmentfault.com/a/1190000007914129 

const path = require('path')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const appPath = path.join(__dirname, 'src/app.js')
const outputPath = __dirname
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  // source-map 将打包后的代码和打包前的做一个映射，方便调试
  devtool: 'cheap-module-eval-source-map',
  mode: 'development',
  target: 'electron-renderer',
  entry: {
    app: appPath
  },
  output: {
    path: outputPath,
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        type: 'javascript/auto',
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['env', 'react', 'stage-0']
          }
        }
      },
      {
        test: /\.css$/,
        exclude: /inject/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: {
            loader: 'css-loader',
          }
        })
      },
      {
        test: /\.(jpeg|png|jpg|gif)$/,
        loader: 'url-loader',
        // query: {
        //   limit: 8192,
        //   name: 'images/[name].[ext]'
        // }
      },
    ]
  },
  plugins: [
    // 热加载, 服务于webpack-dev-server的hot配置
    new webpack.HotModuleReplacementPlugin(),
    new HtmlPlugin({
      filename: 'index.html',
      title: 'test',
      template: path.join(__dirname, 'src/index.html')
    }),
    new webpack.ProvidePlugin({
      React: 'react'
    }),
    new ExtractTextPlugin("style.css")    
  ],
  // webpack-dev-server 的配置
  devServer: {
		historyApiFallback: true,
		inline: true,
		port: 8080
  },
  // 注释了试试，webpack会建议每个js文件大小不要超过250kb,但开发环境因为包含了sourcemap并且代码未压缩所以一般都会超过这个大小, 可以在开发环境把这个warning关闭
  performance: {
    hints: false
  }
}
