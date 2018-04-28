let windowWidth = window.innerWidth

export default class Controls extends React.Component {
  constructor() {
    super()
    this.resizeable = false
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.state = {
      width: 400,
      tree: {},
      floatMenu: {
        show: false,
        x: 0,
        y: 0
      }
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmout() {
    window.removeEventListener('resize', this.handleResize)
  }

  componentWillReceiveProps(props) {
    const { tree } = props
    this.setState({
      tree: this.resolveTree(tree)
    })
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

  findElement(e, target, _break) {
    e.stopPropagation()
    let element = e.target
    while(true) {
      if (element.classList.contains(target)) break
      if (element.classList.contains(_break)) return
      element = element.parentElement
    }
    return element
  }

  handleElementMouseUp(e) {
    if (e.button != 2) {
      return this.setState({
        floatMenu: {
          show: false
        }
      })
    }
    const element = this.findElement(e, 'element', 'element-tree')
    if (!element) return
    const { pageX, pageY } = e
    this.setState({
      floatMenu: {
        x: pageX,
        y: pageY,
        show: true
      }
    })
  }

  handleElementClick(e) {
    const element = this.findElement(e, 'element', 'element-tree')
    if (!element) return
    const nid = element.dataset.nid
    const tree = this.dealNodeById(nid, (node => {
      if (node) node.folded = !node.folded
    }))
    this.setState({ tree })
  }

  dealNodeById(nid, cb) {
    const { tree } = this.state
    this.deep(tree, node => {
      if (node.nid == nid) {
        cb(node)
        return false
      }
    })
    return tree
  }

  resolveTree(tree) {
    let i = 0
    this.deep(tree, (node, parent) => {
      const { children } = node
      const shouldFolded = children && (children.length >= 1 || children[0].tag || hildren[0].text.length > 20)
      node.folded = shouldFolded
      node.nid = i++
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
          selector += '.'
          selector += node.class
        }
      } else {
        selector = 'html'
      }
      node.selector = selector
    })
    console.log(tree)
    return tree
  }

  completeTag(node) {
    const includes = ['id', 'class', 'name', 'href', 'src']
    return (
      <div className="tag-start">
        {'<'}<span className="tag-name">{node.tag}</span>
        {includes.map((include, index) => {
          if (node[include]) {
            return (
              <span className="tag-attribute" key={index}>
                {' '}
                { 
                  include == 'id' 
                  ? <span className="tag-key color-blue">{'id'}</span> 
                  : <span className="tag-key">{include}</span>
                }
                {'="'}
                <span className="tag-value">{node[include]}</span>
                {'"'}
              </span>
            )
          } else {
            return ''
          }
        })}
        {'>'}
      </div>
    )
  }

  handleRender(node) {
    return (
      node.tag
      ? <div className="element" data-nid={node.nid} key={node.nid}>
          {/* <div className="tag-start"> */}
            {this.completeTag(node)}
          {/* </div> */}
          {
            node.children
            ? node.folded
              ? '...'
              : node.children.map(child => this.handleRender(child))
            : ''
          }
          <div className="tag-end">
            {'</'}<span className="tag-name">{node.tag}</span>{'>'}
          </div>
        </div>
      : <div className="text" key={node.nid}>{node.text}</div>
    )
  }

  renderTree(tree) {
    return tree.root 
    ? this.handleRender(tree.root)
    : '加载中...'
  }

  handleClick() {
    this.setState({
      floatMenu: {
        show: false
      }
    })
  }

  handleResize() {
    windowWidth = window.innerWidth
  }

  handleMouseDown() {
    const removeEventListener = () => {
      window.removeEventListener('mousemove', this.handleMouseMove)
      window.removeEventListener('mouseup', removeEventListener)
    }
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', removeEventListener)
  }

  handleMouseMove(e) {
    const { pageX, pageY } = e
    if (pageX > 0) {
      this.setState({
        width: windowWidth - pageX
      })
    }
  }

  handleMouseUp() {
    this.resizeable = true
  }

  render() {
    const { props: { onTreeReload }, handleMouseDown, handleElementClick, handleElementMouseUp, handleClick, state: { width, tree, floatMenu: { show, x, y } }, renderTree } = this
    return (
      <div className="controls-wrapper">
        <div className="resizeable" onMouseDown={handleMouseDown.bind(this)}></div>
        <div className="tool">
          <div className="reload" onClick={onTreeReload}>刷新</div>
        </div>
        <div className="controls" style={{width: width + 'px'}} onClick={handleClick.bind(this)}>
          <div className={'float-menu' + (show ? ' show' : '')} style={{left: x + 'px', top: y + 'px'}}></div>
          <div className='content'>
            <div className="section">
              <div className="header">
                <div className="label">页面结构</div>
              </div>
              <div className="element-tree" onClick={handleElementClick.bind(this)}
                onMouseUp={handleElementMouseUp.bind(this)}>
                {this.renderTree(tree)}
              </div>
            </div>
            <div className="label"></div>
          </div>
        </div>
      </div>
    )
  }
}