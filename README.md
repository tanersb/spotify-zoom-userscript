# Spotify HD Image Viewer & Downloader

![Version](https://img.shields.io/badge/version-7.2-green.svg)
![Author](https://img.shields.io/badge/author-bytanersb-blue.svg)
![Platform](https://img.shields.io/badge/platform-Tampermonkey-red.svg)

A powerful Tampermonkey userscript that allows you to view **Spotify** profile pictures, playlist covers, and artist images in **Full HD** resolution by hovering over them. Includes a one-key download feature and a toggle switch.

## 🌟 Features

* **HD Resolution:** Automatically finds the highest resolution available (parses `srcset` and converts mosaic thumbnails to 640px).
* **Smart Detection:** Works through Spotify's invisible click layers (`CardButton`), ensuring it works on Playlists, Albums, Artists, and Profiles.
* **Download Hotkey:** Press **`S`** while hovering to instantly save the image.
* **Toggle Switch:** A stylish button (bottom-right) to Enable/Disable the script.
* **Memory:** Remembers your On/Off preference (using LocalStorage).
* **Signature:** Simple signature `bytanersb` on the overlay.

## 📸 How it Works

1.  **Hover:** Move your mouse over any image on the Spotify Web Player.
2.  **View:** An overlay will appear displaying the HD version of the image.
3.  **Download:** Press the **`S`** key on your keyboard to download the image as a `.jpg`.
4.  **Control:** Use the "Zoom: ON/OFF" button above the player bar to toggle the feature.

## 🚀 Installation

1.  Install the **Tampermonkey** extension for your browser:
    * [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
    * [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
    * [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
2.  Create a **New Script** in Tampermonkey.
3.  Copy and paste the code from `script.js` (or from this repo) into the editor.
4.  Save the script (`Ctrl+S`).
5.  Refresh the Spotify Web Player page.

## 🎮 Usage Controls

| Action | Result |
| :--- | :--- |
| **Mouse Over** | Opens the HD Image Overlay |
| **Key `S`** | Downloads the current image |
| **Click Toggle** | Enables or Disables the script |

## 🛠 Compatibility

* **Site:** `open.spotify.com` (and googleusercontent mirrors)
* **Browsers:** Chrome, Edge, Firefox, Opera, Brave
* **Manager:** Tampermonkey, Violentmonkey


## 👤 Author

**bytanersb**

* Github: [@bytanersb](https://github.com/bytanersb)

---

*Disclaimer: This script is for educational purposes only. Please respect copyright laws when downloading images.*
