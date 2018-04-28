import '../styles/home.css'
import WebView from '../components/WebView'
import Controls from '../components/Controls'

export default class Home extends React.Component {
  constructor() {
    super()
    this.state = {
      tree: {},
      reload: false
    }
  }

  handleChange(data) {
    this.setState({
      tree: data
    })
  }

  handleTreeReload() {
    const { reload } = this.state
    this.setState({
      reload: !reload
    })
  }

  render() {
    const { handleTreeReload, handleChange, state: { tree, reload } } = this
    return (
      <div className="home">
        <WebView src="https://juejin.im/timeline" onChange={handleChange.bind(this)} reload={reload}></WebView>
        <Controls onTreeReload={handleTreeReload.bind(this)} tree={tree}/>
      </div>
    )
  }
}