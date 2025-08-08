// NotebookLM Citation Mapper - unified version

(function () {
  let isMapping = false;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
      overlay.style.zIndex = '99999';
      overlay.style.background = '#fff';
      overlay.style.border = '1px solid #888';
      overlay.style.borderRadius = '8px';
      overlay.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      overlay.style.fontFamily = 'monospace';
      overlay.style.fontSize = '14px';
      overlay.style.maxWidth = '350px';

      const header = document.createElement('div');
      header.style.cursor = 'move';
      header.style.background = '#f0f0f0';
      header.style.padding = '4px 8px';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';

      const title = document.createElement('span');
      title.textContent = 'Citation Legend';
      header.appendChild(title);

      const controls = document.createElement('div');
      const minBtn = document.createElement('button');
      minBtn.textContent = '–';
      minBtn.style.marginRight = '4px';
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      controls.appendChild(minBtn);
      controls.appendChild(closeBtn);
      header.appendChild(controls);

      const content = document.createElement('div');
      content.id = 'notebooklm-citation-legend-content';
      content.style.padding = '8px';
      content.style.maxHeight = '300px';
      content.style.overflowY = 'auto';

      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copy';
      copyBtn.onclick = () => copyText(legendText);
      content.appendChild(copyBtn);

      const legendPre = document.createElement('pre');
      legendPre.id = 'notebooklm-citation-legend-text';
      legendPre.style.marginTop = '8px';
      legendPre.textContent = legendText;
      content.appendChild(legendPre);

      overlay.appendChild(header);
      overlay.appendChild(content);
      document.body.appendChild(overlay);

      // Dragging support
      let drag = false;
      let offsetX = 0;
      let offsetY = 0;
      header.addEventListener('mousedown', (e) => {
        drag = true;
        offsetX = e.clientX - overlay.offsetLeft;
        offsetY = e.clientY - overlay.offsetTop;
        overlay.style.left = overlay.offsetLeft + 'px';
        overlay.style.top = overlay.offsetTop + 'px';
        overlay.style.right = '';
        overlay.style.bottom = '';
      });
      document.addEventListener('mousemove', (e) => {
        if (!drag) return;
        overlay.style.left = e.clientX - offsetX + 'px';
        overlay.style.top = e.clientY - offsetY + 'px';
      });
      document.addEventListener('mouseup', () => { drag = false; });

      // Minimize and close
      minBtn.onclick = () => {
        if (content.style.display === 'none') {
          content.style.display = 'block';
        } else {
          content.style.display = 'none';
        }
      };
      closeBtn.onclick = () => overlay.remove();
    } else {
      const legendPre = overlay.querySelector('#notebooklm-citation-legend-text');
      if (legendPre) legendPre.textContent = legendText;
      const copyBtn = overlay.querySelector('#notebooklm-citation-legend-content button');
      if (copyBtn) copyBtn.onclick = () => copyText(legendText);
    }
  }

  async function expandEllipsis() {
    for (let i = 0; i < 5; i++) {
      const buttons = Array.from(document.querySelectorAll('note-editor span[aria-label]'))
        .filter(span => span.textContent.trim() === '...' && !span.dataset.expanded);
      if (!buttons.length) break;
      buttons.forEach(span => {
        span.dataset.expanded = 'true';
        span.click();
      });
      await sleep(200);
    }
  }

  async function mapCitations() {
    if (isMapping) return;
    isMapping = true;
    try {
      await expandEllipsis();
      const spans = Array.from(document.querySelectorAll('span[aria-label]'));
      const uniqueCitations = {};
      spans.forEach(span => {
        const label = span.getAttribute('aria-label');
        const match = label && label.match(/^(\d+):\s*(.+)$/);
        if (match) {
          uniqueCitations[match[1]] = match[2];
        }
      });
      const numbers = Object.keys(uniqueCitations).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
      const legendLines = numbers.map(n => `Citation ${n} → ${uniqueCitations[n]}`);
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

  setTimeout(() => { mapCitations(); }, 2000);
  observeCitations();
})();
