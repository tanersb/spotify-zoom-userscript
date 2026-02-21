// ==UserScript==
// @name         Spotify HD Image Viewer & Downloader (Embed + Grid Fix)
// @namespace    bytanersb_fixed
// @version      1.1.3
// @description  View and download Spotify images in HD. Works on Embeds, Web Player and Library Grid.
// @author       bytanersb (fixed/enhanced)
// @match        *://open.spotify.com/*
// @match        *://*.spotify.com/*
// @match        *://xpui.app.spotify.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/tanersb/spotify-zoom-userscript/main/spotify-hd-downloader.user.js
// @downloadURL  https://raw.githubusercontent.com/tanersb/spotify-zoom-userscript/main/spotify-hd-downloader.user.js
// ==/UserScript==

(function() {
    'use strict';

    // iframe içinde miyiz kontrolü?
    const isIframe = window.self !== window.top;
    let isScriptActive = isIframe ? true : (localStorage.getItem('spotify_zoomer_active') !== 'false');

    // --- TOGGLE BUTONU (sadece ana pencerede veya büyük iframe'lerde göster) ---
    let toggleBtn;
    if (!isIframe || window.innerHeight > 400) {
        toggleBtn = document.createElement('div');
        toggleBtn.id = 'spotify-zoom-toggle';
        Object.assign(toggleBtn.style, {
            position: 'fixed',
            bottom: '90px',
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
            border: '1px solid #333',
            color: '#1db954'
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

        toggleBtn.addEventListener('click', () => {
            isScriptActive = !isScriptActive;
            localStorage.setItem('spotify_zoomer_active', isScriptActive);
            updateButtonVisuals();
            if (!isScriptActive) overlay.style.display = 'none';
        });
    }

    // --- OVERLAY ---
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: '2147483647',
        pointerEvents: 'none', display: 'none',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', backdropFilter: 'blur(5px)'
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

    // URL'yi yüksek çözünürlüğe çevirme
    function enhanceUrl(src) {
        if (src.includes('mosaic.scdn.co')) {
            return src.replace(/\/\d+\//, '/640/');
        }
        // image-cdn-ak/fa gibi yeni adresler genelde zaten yüksek çözünürlükte
        if (src.includes('image-cdn') || src.includes('ab67706c0000da84')) {
            return src; // boyut eklemeye gerek yok, genelde max kalitede geliyor
        }
        return src;
    }

    // --- MOUSE HOVER ---
    document.addEventListener('mouseover', function(e) {
        if (!isScriptActive) return;

        let imgElement = null;

        // 1. Direkt resim
        if (e.target.tagName === 'IMG') {
            imgElement = e.target;
        }
        // 2. Yakın container'lardan resim ara
        else {
            const possibleContainers = [
                '[data-testid="cover-art"]',
                '.CoverArt',
                '[data-encore-id="card"]',
                '.Card',
                '.YR9YVGItxfIgAZje',           // yeni grid kapak wrapper
                '[data-testid="grid-container"]', // üst grid
                '.P0DCrcBH45YVGZwP'            // resim direkt wrapper
            ];

            let container = null;
            for (const sel of possibleContainers) {
                container = e.target.closest(sel);
                if (container) break;
            }

            if (container) {
                imgElement = container.querySelector('img[data-testid="card-image"]') ||
                             container.querySelector('img');
            }
        }

        if (imgElement && imgElement.src) {
            const src = imgElement.src;
            if (src.includes('scdn.co') || src.includes('spotifycdn.com')) {
                currentHighResUrl = enhanceUrl(src);

                // srcset varsa en büyük olanı al
                if (imgElement.srcset && !src.includes('mosaic')) {
                    const sources = imgElement.srcset.split(',')
                        .map(s => {
                            const parts = s.trim().split(' ');
                            return { url: parts[0], width: parseInt(parts[1]) || 0 };
                        })
                        .filter(s => s.width > 0);

                    if (sources.length > 0) {
                        sources.sort((a, b) => b.width - a.width);
                        currentHighResUrl = sources[0].url;
                    }
                }

                hdImage.src = currentHighResUrl;
                overlay.style.display = 'flex';
            }
        }
    });

    // Mouse çıkınca overlay'i kapat
    document.addEventListener('mouseout', function(e) {
        if (!isScriptActive) return;
        if (e.relatedTarget !== hdImage && e.relatedTarget !== overlay && !overlay.contains(e.relatedTarget)) {
            overlay.style.display = 'none';
            currentHighResUrl = null;
            infoBox.innerText = "[S] İndir";
            infoBox.style.color = '#fff';
        }
    });

    // --- S TUŞU İLE İNDİRME ---
    document.addEventListener('keydown', async function(e) {
        if (!isScriptActive) return;
        if ((e.key === 's' || e.key === 'S') && overlay.style.display === 'flex' && currentHighResUrl) {
            e.preventDefault();
            infoBox.innerText = "İndiriliyor...";
            infoBox.style.color = '#1db954';

            try {
                const response = await fetch(currentHighResUrl);
                if (!response.ok) throw new Error('Network response was not ok');
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
                console.error('İndirme hatası:', err);
                infoBox.innerText = "Hata! Yeni sekmede açılıyor...";
                window.open(currentHighResUrl, '_blank');
            }
        }
    });

})();
