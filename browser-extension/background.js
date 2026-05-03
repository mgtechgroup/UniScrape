chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'uniscrape-search',
    title: 'Search with UniScrape',
    contexts: ['selection']
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'uniscrape-search' && info.selectionText) {
    chrome.tabs.create({
      url: `http://localhost:8085/?q=${encodeURIComponent(info.selectionText)}`
    })
  }
})
