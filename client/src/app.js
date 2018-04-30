import './styles/base.css'
import ReactDOM from 'react-dom'
import Home from './pages/Home'
if (module.hot) {
  // 实现热更新
  module.hot.accept();
}
ReactDOM.render(<Home/>, document.getElementById('app'))