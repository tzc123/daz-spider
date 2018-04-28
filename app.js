const Spider = require('./spider/spider')


const tasks = [
  {
    url: 'www.baidu.com',
    resolve: 'push'
  },
  {
    selector: '#s_lg_img_new',
    resolve: 'export',
    data: 'image'
  }
]
const spider = new Spider(tasks)