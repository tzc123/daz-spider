const getDocument = require('./getDocument')
const pageOperation = ['push', 'pop', 'replace']

class Spider {
  constructor({ concurrent, tasks}) {
    this.pages = []
    this.current = null
  }

  async run() {
    const taskQueue = []
    for (let { resovle, url } of tasks.entries()) {
      if (pageOperation.indexOf(resovle) != -1) {
        taskQueue.push(async () => {
          const page = await getDocument(url)
          this[resovle](page)
        })
      } else {
        taskQueue.push(async () => {
          await this[resovle](selector)
        })
      }
      if (taskQueue.length >= this.concurrent) {
        await Promise.all(taskQueue)
        taskQueue = []
      }
    }
  }

  export() {
    return this.data
  }

  saveToRedis() {

  }

  push(page) {
    this.pages.push(page)
    this.current = page
  }

  pop(time = 1) {
    const { pages, pages: { length } } = this
    if (length < time) {
      throw new Error('no page could be popped')
    }
    for(let i = 0; i < time; i++) {
      pages.pop()
    }
    this.current = pages[length - time - 1] || null
  }

  replace(page) {
    const { pages, pages: { length } } = this
    pages[length - 1] = page
    this.current = page
  }


}

module.exports = Spider