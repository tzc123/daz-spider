const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
 
class Index {
  constructor({ autoOpenDevTools, url = 'http://122.152.205.25', width = 1000, height = 800, closed, domReady }) {
    this.window = null
    this.width = width
    this.height = height
    this.autoOpenDevTools = autoOpenDevTools
    this.url = 'file://' + __dirname + '/index.html'
    this.style = 'file://' + __dirname + '/index.css'
    this.closed = closed
    this.domReady = domReady
  }

  load(url) {
    this.window.loadURL(url)
  }

  open() {
    const { width, height, url, autoOpenDevTools, closed, domReady, style } = this
    this.window = new BrowserWindow({width: width, height: height})
    const { window, window: { webContents } } = this
    window.loadURL(url)
    autoOpenDevTools && window.openDevTools()
    window.on('closed', e => {
      closed && closed(e)
    })
    return new Promise((resolve, reject) => {
      webContents.on('dom-ready', e => {
        resolve(e)
      })
      webContents.on('did-fail-load', reject)
    })
  }
}

module.exports = Index