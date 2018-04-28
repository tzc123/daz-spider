// 生产环境的webpack配置
const path = require('path')
const webpack = require('webpack')
const CleanPlugin = require('clean-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const appPath = path.join(__dirname, 'src/app.js')
const outputPath = __dirname

module.exports = {
  // 生产模式
  mode: 'production',
  // 入口
  entry: {
    app: appPath
  },
  // 出口
  output: {
    path: outputPath,
    // hash的作用是版本更新时,使用户浏览器中的缓存失效
    filename: 'dist/js/[name].js'
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
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: {
            loader: 'css-loader',
            options:{
                minimize: true
            }
          }
        })
      },
    ]
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new CleanPlugin(outputPath + '/dist'),
    // 将打包好的js挂载到html上
    new HtmlPlugin({
      filename: path.join(__dirname, 'pages', 'index','index.html'),
      title: 'index',
      template: path.join(__dirname, 'src', 'index.html'),
    }),
    // 相当于提供一个全局变量,避免每个文件都要 import React from 'react'
    new webpack.ProvidePlugin({
      React: 'react'
    }),
    // 将css从js中分离出来
    new ExtractTextPlugin("dist/css/style.css")
  ],
  // 公用模块提取, 取代CommonsChunkPlugin
  optimization: {
    runtimeChunk: {
      name: "manifest"
    },
    splitChunks: {
      cacheGroups: {
        app: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all"
        }
      }
    }
  }
}