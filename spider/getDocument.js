const rq = require('request-promise')
const cheerio = require('cheerio')

module.exports = async function getHtml (url) {
  if (!/$https?:\/\//.test(url)) {
    url = 'http://' + url
  }
  try {
    const res = await rq(url)
    return cheerio(res)
  } catch (err) {
    console.log(`getHtml-${url}:`, err)
    return ''
  }
}
