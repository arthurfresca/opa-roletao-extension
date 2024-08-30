async function fetchPlayers() {
  try {
    const response = await fetch('https://csabe-cb95c9877c4f.herokuapp.com/opa/admin/member', {
      method: 'GET',
      headers: {
          'adminkey': '123test123',
          'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    // Extract faceit_id values from the JSON array
    return data // Filter out empty strings
  } catch (error) {
    console.error('Error fetching faceit IDs:', error);
    return [];
  }
}
  
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPlayers') {
      fetchPlayers().then(players => sendResponse(players));
      return true;
    }

    if (request.action === 'openWheelofNames') {
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