document.getElementById('extractBtn').addEventListener('click', async () => {
  const prompt = document.getElementById('prompt').value;
  if (!prompt) return;

  const status = document.getElementById('status');
  const btn = document.getElementById('extractBtn');
  
  status.textContent = "Analyzing page...";
  btn.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject content script if not already there or just execute directly
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.documentElement.outerHTML,
    });

    const html = results[0].result;
    const url = tab.url;

    const response = await fetch('https://ais-dev-q25ncsr4scmrpjds7plapc-111856768914.asia-east1.run.app/api/extractions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instruction: prompt, html, url })
    });

    const data = await response.json();
    
    if (data.success) {
      status.textContent = `Success! ${data.data.rows.length} rows found.`;
      // Open the dashboard to show results
      chrome.tabs.create({ url: 'https://ais-dev-q25ncsr4scmrpjds7plapc-111856768914.asia-east1.run.app' });
    } else {
      status.textContent = "Extraction failed. Check API.";
    }
  } catch (err) {
    console.error(err);
    status.textContent = "Error: " + err.message;
  } finally {
    btn.disabled = false;
  }
});
