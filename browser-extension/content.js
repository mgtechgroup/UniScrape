// Content script - right-click on media links to add to UniScrape
document.addEventListener('contextmenu', (e) => {
  const target = e.target
  if (target.tagName === 'A' || target.tagName === 'VIDEO' || target.tagName === 'IMG') {
    // Context menu integration
  }
})
