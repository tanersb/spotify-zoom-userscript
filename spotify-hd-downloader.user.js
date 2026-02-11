// ==UserScript==
// @name         Spotify HD Image Viewer & Downloader (Embed Fix)
// @namespace    bytanersb_fixed
// @version      1.1.2
// @description  View and download Spotify images in HD. Works on Embeds and Web Player.
// @author       bytanersb
// @match        http://googleusercontent.com/spotify.com/*
// @match        https://open.spotify.com/*
// @match        https://xpui.app.spotify.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/tanersb/spotify-zoom-userscript/main/spotify-hd-downloader.user.js
// @downloadURL  https://raw.githubusercontent.com/tanersb/spotify-zoom-userscript/main/spotify-hd-downloader.user.js
// ==/UserScript==

(function() {
    'use strict';

    // iframe içinde miyiz kontrolü?
    const isIframe = window.self !== window.top;

    // iframe içindeysek her zaman aktif olsun, değilse localStorage'a baksın
    let isScriptActive = isIframe ? true : (localStorage.getItem('spotify_zoomer_active') !== 'false');

    // --- BUTON OLUŞTURMA (Sadece ana penceredeyse veya iframe çok büyükse göster) ---
    const toggleBtn = document.createElement('div');
    if (!isIframe || window.innerHeight > 400) {
        toggleBtn.id = 'spotify-zoom-toggle';
        Object.assign(toggleBtn.style, {
            position: 'fixed',
            bottom: '90px',   // <-- GÜNCELLENDİ: Buton yukarı alındı (20px -> 90px)
            right: '20px',
            zIndex: '999999',
            padding: '8px 12px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontFamily: 'CircularSp, sans-serif',
            fontWeight: 'bold',
            fontSize: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#121212',
            border: '1px solid #333'
        });

        const statusText = document.createElement('span');
        toggleBtn.appendChild(statusText);
        document.body.appendChild(toggleBtn);

        function updateButtonVisuals() {
            if (isScriptActive) {
                toggleBtn.style.border = '1px solid #1db954';
                toggleBtn.style.color = '#1db954';
                statusText.innerText = "Zoom: ON";
                toggleBtn.style.opacity = '1';
            } else {
                toggleBtn.style.border = '1px solid #555';
                toggleBtn.style.color = '#aaa';
                statusText.innerText = "Zoom: OFF";
                toggleBtn.style.opacity = '0.7';
            }
        }
        updateButtonVisuals();

        toggleBtn.addEventListener('click', function() {
            isScriptActive = !isScriptActive;
            localStorage.setItem('spotify_zoomer_active', isScriptActive);
            updateButtonVisuals();
            if (!isScriptActive) overlay.style.display = 'none';
        });
    }

    // --- OVERLAY (Görüntüleme Alanı) ---
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: '2147483647',
        pointerEvents: 'none', display: 'none', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', backdropFilter: 'blur(5px)'
    });

    const hdImage = document.createElement('img');
    Object.assign(hdImage.style, {
        maxWidth: '90%', maxHeight: '80%', boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
        borderRadius: '12px', border: '2px solid #1db954', objectFit: 'contain'
    });

    const infoBox = document.createElement('div');
    infoBox.innerText = "[S] İndir";
    Object.assign(infoBox.style, {
        color: '#fff', marginTop: '15px', fontSize: '16px', fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,1)', fontFamily: 'sans-serif',
        background: 'rgba(0,0,0,0.6)', padding: '5px 15px', borderRadius: '10px'
    });

    overlay.appendChild(hdImage);
    overlay.appendChild(infoBox);
    document.body.appendChild(overlay);

    let currentHighResUrl = null;

    // Resmi HD yapma fonksiyonu
    function enhanceUrl(src) {
        // Embed resimleri bazen farklı boyutta gelir, onları 640px veya en büyük boyuta zorla
        if (src.includes('mosaic.scdn.co')) return src.replace(/\/\d+\//, '/640/');
        if (src.includes('i.scdn.co/image/')) return src; // Genellikle zaten doğrudur ama boyutu url'den anlaşılmaz
        return src;
    }

    // --- MOUSE HOVER OLAYI ---
    document.addEventListener('mouseover', function(e) {
        if (!isScriptActive) return;

        // Hedef bir resim mi?
        let imgElement = e.target.tagName === 'IMG' ? e.target : e.target.querySelector('img');

        // Eğer doğrudan resim değilse, Embed player içindeki kapak yapısını kontrol et
        if (!imgElement) {
            // Spotify Embed özel yapısı (Link veya Artwork divi içinde olabilir)
            const artContainer = e.target.closest('[data-testid="cover-art"]') || e.target.closest('.CoverArt');
            if (artContainer) imgElement = artContainer.querySelector('img');
        }

        if (imgElement && imgElement.src) {
            let src = imgElement.src;

            // Sadece Spotify CDN resimlerine tepki ver
            if (src.includes('scdn.co') || src.includes('spotifycdn.com')) {
                currentHighResUrl = enhanceUrl(src);

                // Srcset varsa en kalitelisini al
                if (imgElement.srcset && !src.includes('mosaic')) {
                    const sources = imgElement.srcset.split(',').map(s => {
                        const parts = s.trim().split(' ');
                        return { url: parts[0], width: parseInt(parts[1]) || 0 };
                    });
                    sources.sort((a, b) => b.width - a.width);
                    if (sources.length > 0) currentHighResUrl = sources[0].url;
                }

                hdImage.src = currentHighResUrl;
                overlay.style.display = 'flex';
            }
        }
    });

    document.addEventListener('mouseout', function(e) {
        if (!isScriptActive) return;
        // Mouse overlay'e geçmediyse kapat
        if (e.relatedTarget !== hdImage && e.relatedTarget !== overlay) {
            overlay.style.display = 'none';
            currentHighResUrl = null;
            infoBox.innerText = "[S] İndir";
            infoBox.style.color = '#fff';
        }
    });

    // --- İNDİRME İŞLEMİ (S TUŞU) ---
    document.addEventListener('keydown', async function(e) {
        if (!isScriptActive) return;

        if ((e.key === 's' || e.key === 'S') && overlay.style.display === 'flex' && currentHighResUrl) {
            e.preventDefault();
            infoBox.innerText = "İndiriliyor...";
            infoBox.style.color = '#1db954';

            try {
                const response = await fetch(currentHighResUrl);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const time = new Date().getTime();
                a.download = `Spotify-Cover-${time}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                infoBox.innerText = "✔ Kaydedildi";
            } catch (err) {
                console.error(err);
                infoBox.innerText = "Hata! Yeni sekmede açılıyor...";
                window.open(currentHighResUrl, '_blank');
            }
        }
    });

})();
