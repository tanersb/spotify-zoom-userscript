// ==UserScript==
// @name         Spotify HD Image Viewer & Downloader
// @namespace    bytanersb
// @version      1.1.1.1
// @description  View and download Spotify images in HD. Includes a toggle button and "S" key download support.
// @author       bytanersb
// @match        http://googleusercontent.com/spotify.com/*
// @match        https://open.spotify.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/tanersb/spotify-zoom-userscript/main/spotify-hd-downloader.user.js
// @downloadURL  https://raw.githubusercontent.com/tanersb/spotify-zoom-userscript/main/spotify-hd-downloader.user.js
// ==/UserScript==

(function() {
    'use strict';

    let isScriptActive = localStorage.getItem('spotify_zoomer_active') !== 'false';

    const toggleBtn = document.createElement('div');
    toggleBtn.id = 'spotify-zoom-toggle';

    Object.assign(toggleBtn.style, {
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        zIndex: '2147483647',
        padding: '10px 15px',
        borderRadius: '30px',
        cursor: 'pointer',
        fontFamily: 'CircularSp, sans-serif',
        fontWeight: 'bold',
        fontSize: '14px',
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

        if (!isScriptActive) {
            overlay.style.display = 'none';
        }
    });

    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0', left: '0', width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: '2147483646',
        pointerEvents: 'none',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backdropFilter: 'blur(5px)'
    });

    const hdImage = document.createElement('img');
    Object.assign(hdImage.style, {
        maxWidth: '80vh',
        maxHeight: '80vh',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
        borderRadius: '12px',
        border: '2px solid #1db954',
        objectFit: 'contain'
    });

    const infoBox = document.createElement('div');
    infoBox.innerText = "[S] Download (HD)";
    Object.assign(infoBox.style, {
        color: '#fff',
        marginTop: '15px',
        fontSize: '18px',
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,1)',
        fontFamily: 'sans-serif',
        background: 'rgba(0,0,0,0.6)',
        padding: '5px 15px',
        borderRadius: '10px'
    });

    const signature = document.createElement('div');
    signature.innerText = "bytanersb";
    Object.assign(signature.style, {
        color: '#aaa',
        marginTop: '8px',
        fontSize: '12px',
        fontFamily: 'sans-serif',
        opacity: '0.7',
        letterSpacing: '1px'
    });

    overlay.appendChild(hdImage);
    overlay.appendChild(infoBox);
    overlay.appendChild(signature);
    document.body.appendChild(overlay);

    let currentHighResUrl = null;

    function enhanceUrl(src) {
        if (src.includes('mosaic.scdn.co')) {
            return src.replace(/\/\d+\//, '/640/');
        }
        return src;
    }

    function findImageFromEvent(target) {
        if (target.tagName === 'IMG') return target;
        const cardContainer = target.closest('[data-encore-id="card"]') || target.closest('[data-testid="card"]');
        if (cardContainer) {
            return cardContainer.querySelector('img');
        }
        return null;
    }

    document.addEventListener('mouseover', function(e) {
        if (!isScriptActive) return;

        const imgElement = findImageFromEvent(e.target);

        if (imgElement && imgElement.src) {
            let src = imgElement.src;

            if (src.includes('scdn.co') || src.includes('spotifycdn.com')) {
                currentHighResUrl = enhanceUrl(src);

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

        const cardContainer = e.target.closest('[data-encore-id="card"]') || e.target.closest('[data-testid="card"]');
        const nextTarget = e.relatedTarget;

        if (cardContainer && nextTarget && cardContainer.contains(nextTarget)) {
            return;
        }

        overlay.style.display = 'none';
        currentHighResUrl = null;
        infoBox.innerText = "[S] Download (HD)";
        infoBox.style.color = '#fff';
    });

    document.addEventListener('keydown', async function(e) {
        if (!isScriptActive) return;

        if ((e.key === 's' || e.key === 'S') && overlay.style.display === 'flex' && currentHighResUrl) {
            e.preventDefault();

            infoBox.innerText = "Downloading...";
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

                infoBox.innerText = "✔ Saved";
            } catch (err) {
                console.error(err);
                infoBox.innerText = "Error! Opening in new tab...";
                window.open(currentHighResUrl, '_blank');
            }
        }
    });

})();
