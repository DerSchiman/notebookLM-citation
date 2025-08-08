// NotebookLM Citation Source Mapper Content Script (v3)

(function () {
  let isMapping = false;

  function copyText(text) {
    return navigator.clipboard.writeText(text).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    });
  }

  function showLegendOverlay(legendText) {
    let overlay = document.getElementById('notebooklm-citation-legend');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'notebooklm-citation-legend';
      overlay.setAttribute('data-no-observe', 'true');
      overlay.style.position = 'fixed';
      overlay.style.bottom = '20px';
      overlay.style.right = '20px';
      overlay.style.zIndex = 99999;
      overlay.style.background = 'rgba(255,255,255,0.97)';
      overlay.style.border = '1px solid #888';
      overlay.style.borderRadius = '8px';
      overlay.style.padding = '16px';
      overlay.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      overlay.style.fontFamily = 'monospace';
      overlay.style.fontSize = '14px';
      overlay.style.maxWidth = '350px';
      overlay.style.maxHeight = '300px';
      overlay.style.overflowY = 'auto';

      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Kopieren';
      copyBtn.style.marginTop = '10px';
      copyBtn.onclick = () => copyText(legendText);
      overlay.appendChild(copyBtn);

      const legendPre = document.createElement('pre');
      legendPre.id = 'notebooklm-citation-legend-text';
      legendPre.style.marginTop = '10px';
      legendPre.textContent = legendText;
      overlay.appendChild(legendPre);

      document.body.appendChild(overlay);
    } else {
      const legendPre = overlay.querySelector('#notebooklm-citation-legend-text');
      if (legendPre) legendPre.textContent = legendText;
      const copyBtn = overlay.querySelector('button');
      if (copyBtn) copyBtn.onclick = () => copyText(legendText);
    }
  }

  async function mapCitations() {
    if (isMapping) return;
    isMapping = true;
    try {
      const spans = Array.from(document.querySelectorAll('span[aria-label]'));
      const uniqueCitations = {};
      spans.forEach(span => {
        const label = span.getAttribute('aria-label');
        const match = label && label.match(/^(\d+):\s*(.+)$/);
        if (match) {
          uniqueCitations[match[1]] = match[2];
        }
      });
      const sortedCitationNumbers = Object.keys(uniqueCitations)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
      const legendLines = sortedCitationNumbers.map(
        n => `Citation ${n} → ${uniqueCitations[n]}`
      );
      const legendText = legendLines.length
        ? 'Citation Mapping Legend\n=====================\n' + legendLines.join('\n')
        : 'Citation Mapping Legend\n=====================\nNo citations found';
      showLegendOverlay(legendText);
    } finally {
      isMapping = false;
    }
  }

  function observeCitations() {
    const observer = new MutationObserver((mutations) => {
      const shouldRun = mutations.some(m => {
        if (m.target.closest('#notebooklm-citation-legend')) return false;
        return Array.from(m.addedNodes).some(n => n.nodeType === 1 && !n.closest('#notebooklm-citation-legend'));
      });
      if (!shouldRun) return;
      if (window.__notebooklmCitationLegendTimeout) {
        clearTimeout(window.__notebooklmCitationLegendTimeout);
      }
      window.__notebooklmCitationLegendTimeout = setTimeout(() => {
        if (!isMapping) {
          mapCitations();
        }
      }, 500);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  setTimeout(() => {
    mapCitations();
  }, 2000);
  observeCitations();
})();
