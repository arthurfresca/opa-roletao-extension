async function fetchNames() {
    const response = await fetch('https://raw.githubusercontent.com/arthurfresca/opaweb/main/anjos.txt');
    const text = await response.text();
    const names = text.split('\n').filter(name => name.trim() !== '');
    return names;
}
  
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getNames') {
      fetchNames().then(names => sendResponse({ names }));
      return true;
    }
  
    if (request.action === 'openWheelofNames') {
        console.error(request.players);
      chrome.tabs.create({ url: 'https://wheelofnames.com?'+arrayToQueryString(request.players) }, (tab) => {
        if (chrome.runtime.lastError) {
          console.error('Error opening new tab:', chrome.runtime.lastError);
        } else {
          console.log('Tab created successfully:', tab);
        }
      });
    }
  });


  function arrayToQueryString(players) {
    const params = new URLSearchParams();

    players.forEach(player => {
        params.append('player', player);
    });
    return params.toString();
}