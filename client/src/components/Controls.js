let windowWidth = window.innerWidth
let entry = ''

export default class Controls extends React.Component {
  constructor() {
    super()
    this.resizeable = false
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.state = {
      tree: {},
      floatMenu: {
        show: false,
        x: 0,
        y: 0
      },
      focus: -1,
      tableData: []
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
    this.setState({ tree })
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
    const { show } = this.state.floatMenu
    if (e.button != 2 && show) {
      return this.setState({
        floatMenu: {
          show: false
        }
      })
    } else if (e.button == 2) {
      const element = this.findElement(e, 'element', 'element-tree')
      if (!element) return
      const { nid } = element.dataset
      let focusNid = this.state.focus
      const tree = this.dealNodeById(nid, node => {
        node.folded = false
        focusNid = node.nid
      })
      const { pageX, pageY } = e
      this.setState({
        floatMenu: {
          x: pageX,
          y: pageY,
          show: true
        },
        focus: focusNid,
        tree
      })
    }
  }

  handleElementClick(e) {
    const element = this.findElement(e, 'element', 'element-tree')
    if (!element) return
    let focusNode
    const nid = element.dataset.nid
    const tree = this.dealNodeById(nid, (node => {
      if (node) {
        node.folded = !node.folded
        focusNode = node
      }
    }))
    if (!focusNode) return
    const { onElementFocus } = this.props
    typeof onElementFocus == 'function' && onElementFocus(focusNode.nid)
    this.setState({ 
      tree, 
      focus: focusNode.nid
    })
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
    const { focus } = this.state
    return (
      node.tag
      ? <div className={'element' + (focus == node.nid ? ' focus' : '')} data-nid={node.nid} key={node.nid}>
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

  handleMark({type, attribute}) {
    const nid = this.state.focus
    this.dealNodeById(nid, node => {
      const hasAttribute = attribute == 'text' ? !!node[attribute] : !!node.children[0].text
      if (hasAttribute) {
        return alert('当前选择元素无' + attribute + '属性')
      } else {
        const { tableData } = this.state
        tableData.push({
          index: tableData.length + 1, 
          selector: node.selector,
          attribute,
          type,
          value: node.attribute
        })
        this.setState({ tableData })
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
    const { controls } = this.refs
    if (pageX > 0) {
      controls.style.width = windowWidth - pageX + 'px'
    }
  }

  handleMouseUp() {
    this.resizeable = true
  }

  handleInputEntry(e) {
    const { value } = e.target
    entry = value
  }

  goTo() {
    this.props.handleGoToUrl(entry)
  }

  render() {
    console.log('render')
    const { props: { onTreeReload }, goTo, handleMouseDown, handleElementClick, handleMark, handleElementMouseUp,handleInputEntry, handleClick, state: { width, tableData, tree, floatMenu: { list, show, x, y } }, renderTree } = this
    return (
      <div className="controls-wrapper">
        <div className="resizeable" onMouseDown={handleMouseDown.bind(this)}></div>
        <div className="tool">
          <div className="reload" onClick={onTreeReload}>刷新</div>
        </div>
        <div className="controls" ref="controls" onClick={handleClick.bind(this)}>
          <div className={'float-menu' + (show ? ' show' : '')} style={{left: x + 'px', top: y + 'px'}}>
            <div className="menu-item">
              标记数据
              <div className="submenu">
                <div className="submenu-item" 
                  onClick={handleMark.bind(this, {type: 'data', attribute: 'src'})}>src</div>
                <div className="submenu-item"
                  onClick={handleMark.bind(this, {type: 'data', attribute: 'text'})}>text</div>
                <div className="submenu-item"
                  onClick={handleMark.bind(this, {type: 'data', attribute: 'href'})}>href</div>
              </div>
            </div>
            <div className="menu-item">
              标记跳转
              <div className="submenu">
                <div className="submenu-item"
                  onClick={handleMark.bind(this, {type: 'skip', attribute: 'src'})}>src</div>
                <div className="submenu-item"
                  onClick={handleMark.bind(this, {type: 'skip', attribute: 'text'})}>text</div>
                <div className="submenu-item"
                  onClick={handleMark.bind(this, {type: 'skip', attribute: 'href'})}>href</div>
              </div>
            </div>
          </div>
          <div className='content'>
            <div className="section">
              <div className='header'>
                <div className="label">入口</div>
              </div>
              <div className='entry'>
                <input onChange={handleInputEntry.bind(this)}></input>
                <div className='submit' onClick={goTo.bind(this)}>前往</div>
              </div>
            </div>
            <div className="section">
              <div className="header">
                <div className="label">页面结构</div>
              </div>
              <div className="element-tree" onClick={handleElementClick.bind(this)}
                onMouseUp={handleElementMouseUp.bind(this)}>
                {this.renderTree(tree)}
              </div>
            </div>
            <div className='section'>
              <div className='header'>
                <div className='label'>任务步骤</div>
              </div>
              <table>
                  <thead>
                  <tr>
                    <th>序号</th>
                    <th>句柄</th>
                    <th>类型</th>
                    <th>属性</th>
                  </tr>
                  </thead>
                  <tbody>
                    {
                      tableData.map((data, index) => (
                        <tr key={index}>
                          <td>{data.index}</td>
                          <td>{ '...' + data.selector.substr(-10, 10)}</td>
                          <td>{data.type == 'data' ? '数据' : '跳转'}</td>
                          <td>{data.attribute}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
            </div>
            <div className='section'>
              <div className='header'>
                <div className='label'>完成</div>  
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}