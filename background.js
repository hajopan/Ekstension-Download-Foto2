chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'downloadImages') {
    message.downloads.forEach((item) => {
      
      let ext = item.url.split('.').pop().split(/#|\?/)[0].toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
        ext = 'jpg';
      }

      // Gabungkan nama tanpa tambahan angka indeks
      const filename = `${item.name}.${ext}`;

      chrome.downloads.download({
        url: item.url,
        filename: filename,
        conflictAction: 'uniquify' 
      });
    });
  }
});