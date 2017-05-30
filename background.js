let timer = null

chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
  if (msg.setWatch) {
    chrome.browserAction.setIcon({
      path: {
        '19': 'icon_19.png',
        '38': 'icon_38.png'
      }
    })
    timer = window.setInterval(() => {
      $.ajax({
        url: 'https://yunbi.com/api/v2/tickers.json',
        method: 'get',
        dataType: 'json',
        timeout: '10000'
      }).done((data) => {
        comparePrice(data, msg.data)
      }).fail((err) => {
        console.log(err)
      })
    }, 30000)
  } else {
    chrome.browserAction.setIcon({
      path: 'icon.png'
    })
    clearInterval(timer)
  }
});

chrome.notifications.onButtonClicked.addListener((notificationId, btnId) => {
  if (btnId === 0) {
    chrome.notifications.clear(notificationId)
    chrome.tabs.create({url: `https://yunbi.com/markets/${notificationId}`})
  }
})

function comparePrice (curData, upDowns) {
  for (let key in curData) {
    const item =  curData[key]
    const last = item.ticker.last

    if (last <= upDowns.low[key] ) {
      showNotification('low', key, last)
    } else if (last >= upDowns.high[key]) {
      showNotification('high', key, last)
    }
  }
}

function showNotification(type, name, price) {
  const icon = name.replace('cny', '')
  chrome.notifications.create(name, {
    type: 'basic',
    iconUrl: `icons/${icon}.png`,
    title: `${type === 'low' ? '触发低报警值' : '触发高报警值'}！`,
    message: `${icon.toUpperCase()} 当前价：￥${price}`,
    buttons: [{
      title: `前往云币网-${icon.toUpperCase()}`,
      iconUrl: 'icon.png'
    }]
  })
}
