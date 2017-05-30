const THEAD_KEYS = ['币种', '最新价', '涨跌幅', '卖出', '买入', '高', '低', '低警报值', '高警报值']
const ELE_TABLE = $('#popupTable')
const ELE_LOADING = $('.spinner')
const ELE_SELECTER = $('#period')
const ELE_WATCH = $('#watch')
const ELE_ALERT = $('#alert')

const loadData = () => {
  getTickers((data) => {
    if (+localStorage.getItem('watch-start') === 1) {
      ELE_WATCH.addClass('btn-success').text('取消监控')
    } else {
      ELE_WATCH.addClass('btn-info').text('启动监控')
    }

    const thead = generateTheadTpl(THEAD_KEYS)
    const tbody = generateTbodyTpl(data)

    ELE_LOADING.hide()
    ELE_TABLE.html(`${thead}${tbody}`).show()

    ELE_SELECTER.show()
    ELE_WATCH.show()

    getUpDowns(Object.keys(data))
  })
}

inputListener(ELE_TABLE, (event) => {
  const target = $(event.target)
  const type = target.attr('data-type')
  const icon = target.attr('data-icon')
  const storage = localStorage.getItem('warnings')

  let data = storage ? JSON.parse(storage) : { low: {}, high: {} }
  data[type][icon] = +target.val() || 0
  localStorage.setItem('warnings', JSON.stringify(data))

  if (+localStorage.getItem('watch-start') === 1) {
      localStorage.setItem('watch-start', 0)
    ELE_WATCH.removeClass('btn-success').addClass('btn-info').text('启动监控')
    chrome.runtime.sendMessage({ setWatch: false })
    ELE_ALERT.show()

    setTimeout(() => {
      ELE_ALERT.hide()
    }, 3000)
  }
})

watchListener(ELE_WATCH, (event) => {
  const storage = localStorage.getItem('warnings')
  if (!storage) {
    return
  }

  if (+localStorage.getItem('watch-start') === 1) { // 关闭监控
    localStorage.setItem('watch-start', 0)
    ELE_WATCH.removeClass('btn-success').addClass('btn-info').text('启动监控')
    chrome.runtime.sendMessage({ setWatch: false })
  } else { // 开启监控
    localStorage.setItem('watch-start', 1)
    ELE_WATCH.removeClass('btn-info').addClass('btn-success').text('取消监控')
    chrome.runtime.sendMessage({ setWatch: true, data: JSON.parse(storage) })
  }
})

selectListener(ELE_SELECTER, () => {
  ELE_TABLE.html('')
  ELE_SELECTER.hide()
  ELE_WATCH.hide()
  ELE_LOADING.show()
  loadData()
})

loadData()
