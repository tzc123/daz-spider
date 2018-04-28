import inject from '../../inject/inject.js'
import path from 'path'
import fs from 'fs'

export default class WebView extends React.Component {
  constructor() {
    super()
    this.reload = false
    this.handleDomReady = this.handleDomReady.bind(this)
  }

  componentDidMount() {
    const { webview } = this.refs
    webview.addEventListener('did-finish-load', this.handleDomReady)
    webview.addEventListener('console-message', e => {
      console.log('Guest page logged a message:', e.message);
    })
    // webview.addEventListener('did-get-response-details', (...arg) => {
    //   console.log(arg)
    // })
  }

  componentWillReceiveProps(props) {
    if (props.reload != this.reload) {
      webview.send('element-tree')
    }
    this.reload = props.reload
  }

  componentWillUnmount() {
    const { webview } = this.refs
    webview.removeEventListener('did-finish-load', this.handleDomReady)
  }

  handleDomReady() {
    const { refs: { webview }, props: { onChange } } = this   
    webview.insertCSS(inject)
    webview.executeJavaScript(
    `
      const ipcRenderer = nodeRequire('electron').ipcRenderer;
      const html = document.querySelector('html')
      const root = {
        tag: html.tagName.toLowerCase()
      }
      const tree = { root }
      function deep(currentElement, current) {
        if (currentElement.childNodes.length <= 0 || (currentElement.childNodes.length == 1 && currentElement.childNodes[0].nodeName == '#comment')) return
        current.children = [];
        [].forEach.call(currentElement.childNodes, child => {
          const _child = {}
          if (!child.tagName) {
            _child.text = child.textContent
            current.children.push(_child)
          } else {
            _child.tag = child.tagName.toLowerCase()
            if (child.src) _child.src = child.src
            if (child.href) _child.href = child.href
            if (child.classList.value) _child.class = child.classList.value
            if (child.id) _child.id = child.id
            if (child.name) _child.name = child.name
            current.children.push(_child)
            deep(child, _child)
          }
        })
      }
      ipcRenderer.on('element-tree', function() {
        deep(html, root)
        ipcRenderer.sendToHost({
          type: 'element-tree',
          data: tree
        });
      });
      // ipcRenderer.on('cookie', function() {
      //   ipcRenderer.sendToHost({
      //     type: 'cookie',
      //     data: document.cookie
      //   });
      // });
    `, res => {
      webview.send('element-tree');
      webview.send('cookie');
    })

    webview.addEventListener('ipc-message', e => {
      const { type, data } =  e.channel
      if (type == 'element-tree') {
        onChange(data)
      } else if (type == 'cookie') {
        console.log(data)
      }
    })
    webview.getWebContents().session.cookies.get({}, (err, cookies) => {
      console.log(cookies)
    })
  }

  render() {
    const { props: { src } } = this
    return (
      <webview ref="webview" id="webview"
        className="webview" 
        src={src} 
        disablewebsecurity="true" 
        nodeintegration="true"
        partition="persist:juejin"
        preload="file:///Users/tzc123/workspace/daz-spider/client/inject/preload.js">
      </webview>
    )
  }
}