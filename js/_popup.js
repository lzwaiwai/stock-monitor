const URL_TICKERS = 'https://yunbi.com/api/v2/tickers.json'
const URL_PERIOD = 'https://plugin.sosobtc.com/widgetembed/data/period'

function getTickers (callback) {
  $.getJSON(URL_TICKERS, (data) => {
    callback && callback(data)
  })
}

function selectListener (selecter, callback) {
  selecter.on('change', callback)
}

function getUpDowns (keys) {
  keys.forEach((item) => {
    const symbol = `yunbi${item}`
    const step = $('#period').select().val()
    const since = new Date().getTime() - step * 1000 * 5

    $.ajax({
      url: `${URL_PERIOD}?symbol=${symbol}&step=${step}&since=${since}`,
      method: 'get',
      dataType: 'json',
      timeout: '10000'
    }).done((data) => {
      const len = data.length
      const pre = data[len - 2]
      const last = data[len - 1]
      const upDowns = ((last[4] - pre[4]) / pre[4] * 100).toFixed(2)
      const style = upDowns >= 0 ? (upDowns === 0 ? '' : 'up') : 'down'

      $(`.${item}`).text(`${upDowns}%`).parent().addClass(style)
    }).fail((err) => {
      console.log(err)
    })
  })
}

function generateTheadTpl (keys) {
  let tpls = ''
  keys.forEach((item, index) => {
    tpls += `<th>${item}</th>`
  })
  return `<thead><tr>${tpls}</tr></thead>`
}

function generateTbodyTpl (data) {
  let tpls = ''
  const setVals = JSON.parse(localStorage.getItem('warnings') || '{"low":{}, "high":{}}')

  for (let coin in data) {
    const ticker = data[coin].ticker

    tpls += `<tr>
      <td><a href="https://yunbi.com/markets/${coin}" target="_blank">${coin.replace('cny', '').toUpperCase()}</a></td>
      <td>${ticker.last}</td>
      <td class="${coin}"></td>
      <td>${ticker.sell}</td>
      <td>${ticker.buy}</td>
      <td>${ticker.high}</td>
      <td>${ticker.low}</td>
      <td class="input"><input placeholder="${!setVals.high[coin] || '未设置'}" data-type="low" data-icon="${coin}" type="text" value="${setVals.low[coin] || ''}" /></td>
      <td class="input"><input placeholder="${!setVals.high[coin] || '未设置'}" data-type="high" data-icon="${coin}" type="text" value="${setVals.high[coin] || ''}" /></td>
    </tr>`
  }
  return tpls
}

function inputListener (eleTable, callback) {
  eleTable.delegate('input', 'blur', (event) => {
    console.log('blur')
    callback && callback(event)
  })
}

function watchListener (eleWatch, callback) {
  eleWatch.on('click', (event) => {
    callback && callback(event)
  })
}


function tabsChangeListener (callback) {
  $('.nav-tabs').click((event) => {
    const target = $(event.target)
    const parent = target.parent()
    $('.nav-tabs').find('li').removeClass('active')
    parent.addClass('active')
    callback && callback(parent.attr('data-index'))
  })
}