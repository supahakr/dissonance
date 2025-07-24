// Shareable link feature for tune.html
// Usage: include this script after your main script

// Reads the current partials values directly from the input fields in the DOM
function getLatestPartialsFromDOM(tableId, mode) {
    const partials = [];
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach(row => {
        const ratioOrHzInput = row.querySelector('input[class*="-ratio"], input[class*="-hz"]');
        const ampInput = row.querySelector('input[class*="-amp"]');
        
        const partial = {};
        if (mode === 'ratio') {
            partial.ratioInput = ratioOrHzInput.value;
        } else {
            partial.hzInput = ratioOrHzInput.value;
        }
        partial.ampInput = ampInput.value;
        partials.push(partial);
    });
    return partials;
}

function getCurrentSettings() {
    // Get the most up-to-date settings directly from the DOM
    const latestPartials = getLatestPartialsFromDOM('partialsTable', window.partialsMode);
    const latestPartials2 = window.differentTimbres ? getLatestPartialsFromDOM('partialsTable2', window.partialsMode2) : [];

    return {
        partials: latestPartials,
        partials2: latestPartials2,
        mode: window.partialsMode,
        mode2: window.partialsMode2,
        edo: window.selectedEDO,
        differentTimbres: window.differentTimbres
    };
}

function encodeSettings(settings) {
    return encodeURIComponent(btoa(JSON.stringify(settings)));
}

function decodeSettings(str) {
    try {
        return JSON.parse(atob(decodeURIComponent(str)));
    } catch {
        return null;
    }
}

function getShareableLink() {
    // Always use the canonical GitHub Pages URL for sharing
    const base = "https://supahakr.github.io/dissonance/";
    const settings = getCurrentSettings();
    return `${base}?settings=${encodeSettings(settings)}`;
}

function copyShareableLink() {
    const url = getShareableLink();

    // Create a temporary textarea element to hold the link
    const textArea = document.createElement('textarea');
    textArea.value = url;

    // Style it to be invisible
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert('Link copied to clipboard!');
        } else {
            throw new Error('Copy command failed.');
        }
    } catch (err) {
        console.error('Fallback copy failed: ', err);
        // If execCommand fails, show the prompt
        window.prompt('Could not copy automatically. Please copy this link manually:', url);
    }

    document.body.removeChild(textArea);
}

// On page load, restore settings from URL if present
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('settings')) {
        const loaded = decodeSettings(params.get('settings'));
        if (loaded) {
            if (Array.isArray(loaded.partials)) window.partials = loaded.partials;
            if (Array.isArray(loaded.partials2)) window.partials2 = loaded.partials2;
            if (loaded.mode) window.partialsMode = loaded.mode;
            if (loaded.mode2) window.partialsMode2 = loaded.mode2;
            if (loaded.edo) {
                 window.selectedEDO = loaded.edo;
                 const edoInput = document.getElementById('edoInput');
                 if(edoInput) edoInput.value = loaded.edo;
            }
            if (loaded.differentTimbres) {
                window.differentTimbres = loaded.differentTimbres;
                const toggleBtn = document.getElementById('toggleTimbre');
                if (toggleBtn) {
                    const container2 = document.getElementById('partials2Container');
                    container2.style.display = 'block';
                    toggleBtn.textContent = 'Same Timbre';
                    toggleBtn.style.background = '#90e24a';
                }
            }
            if (typeof renderPartialsTable === 'function') renderPartialsTable();
            if (typeof renderPartials2Table === 'function') renderPartials2Table();
            if (typeof updateDissonanceGraph === 'function') updateDissonanceGraph();
        }
    }
});
