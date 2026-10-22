document.getElementById('downloadBtn').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const viewLinks = document.querySelectorAll('a[rel^="lightbox"]');
      const results = [];

      viewLinks.forEach(link => {
        const url = link.href;
        if (!url) return;

        let customName = 'gambar_tanpa_nama';
        const tr = link.closest('tr');
        
        if (tr) {
          const tds = tr.querySelectorAll('td');
          if (tds.length >= 5) {
            
            // 1. Ambil Blok PP/TPH (Kolom 2)
            let blokText = tds[2].innerText || tds[2].textContent || "";
            // Pisahkan teks berdasarkan Enter (baris baru), lalu ambil teks yang paling bawah saja
            let blokLines = blokText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            let blok = blokLines[blokLines.length - 1] || "";
            // Ubah tanda '»' menjadi '_' dan bersihkan dari karakter ilegal nama file
            blok = blok.replace(/»/g, '_').replace(/[<>:"/\\|?*]/g, '-').trim();

            // 2. Ambil Nama Kerani (Kolom 3)
            let kerani = (tds[3].innerText || tds[3].textContent || "").trim();
            kerani = kerani.replace(/[<>:"/\\|?*]/g, '-');

            // 3. Ambil Nama Pemanen (Kolom 4)
            let pemanen = (tds[4].innerText || tds[4].textContent || "").trim();
            // Ubah kurung buka '(' jadi '_' dan hilangkan kurung tutup ')'
            pemanen = pemanen.replace(/\(/g, '_').replace(/\)/g, '').replace(/[<>:"/\\|?*]/g, '-').trim();

            // 4. Gabungkan nama sesuai format yang direquest
            customName = `${blok}_${kerani}_${pemanen}`;
            
            // Rapikan jika ada spasi ganda yang tidak sengaja terbentuk
            customName = customName.replace(/\s+/g, ' ');
          }
        }
        
        results.push({ url: url, name: customName });
      });

      return results;
    }
  }, (injectionResults) => {
    if (injectionResults && injectionResults[0] && injectionResults[0].result.length > 0) {
      const downloads = injectionResults[0].result;
      alert(`Ditemukan ${downloads.length} gambar.\n\nContoh nama file pertama:\n"${downloads[0].name}"\n\nKlik OK untuk mulai mendownload.`);
      chrome.runtime.sendMessage({ action: 'downloadImages', downloads: downloads });
    } else {
      alert('Tidak ada gambar yang ditemukan.');
    }
  });
});