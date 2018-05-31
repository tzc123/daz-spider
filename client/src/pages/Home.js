import '../styles/home.css'
import WebView from '../components/WebView'
import Controls from '../components/Controls'

const disabled = ['head', 'meta', 'link', 'script']

export default class Home extends React.Component {
  constructor() {
    super()
    this.state = {
      tree: {},
      reload: false,
      focus: '',
      url: 'https://www.zhihu.com/'
    }
  }

  deep(tree, cb) {
    function handle(node, parent) {
      const res = cb(node, parent)
      if (res === false) return false
      if (!node.children) return true
      return node.children.every(child => {
        return handle(child, node)
      })
    }
    handle(tree.root)
  }

  resolveTree(tree) {
    // let i = 0
    this.deep(tree, (node, parent) => {
      const { children } = node
      const shouldFolded = children && (children.length >= 1 || (children.length == 1 && !children[0].tag && children[0].text.length > 100))
      node.folded = shouldFolded
      // node.nid = i++
      let selector = ''
      if (parent) {
        selector += parent.selector
        selector += '>'
        if (node.tag) {
          selector += node.tag
        }
        if (node.id) {
          selector += '#'
          selector += node.id
        }
        if (node.class) {
          node.class.split(' ').forEach(item => {
            selector += '.'
            selector += item
          })
        }
      } else {
        selector = 'html'
      }
      node.selector = selector
    })
    return tree
  }

  handleChange(data) {
    this.setState({
      tree: this.resolveTree(data)
    })
  }

  handleTreeReload() {
    // const { reload } = this.state
    // this.setState({
    //   reload: !reload
    // })
    window.location.reload()
  }

  handleElementFocus(nid) {
    console.log(nid)
    if (nid != 0)
    this.setState({
      focus: nid
    })
  }

  handleGoToUrl(url) {
    this.setState({ url })
  }

  render() {
    const { handleElementFocus, handleGoToUrl, handleTreeReload, handleChange, state: { tree, reload, focus, url } } = this
    return (
      <div className="home">
        <div className="webview-wrapper">
          <WebView url={url} onChange={handleChange.bind(this)} reload={reload} focus={focus}></WebView>
        </div>
        <Controls onElementFocus={handleElementFocus.bind(this)} 
          handleGoToUrl={handleGoToUrl.bind(this)}
          onTreeReload={handleTreeReload.bind(this)} 
          tree={tree}/>
      </div>
    )
  }
}