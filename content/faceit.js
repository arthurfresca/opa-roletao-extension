function getPlayers() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'getPlayers' }, response => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

async function getPlayersInTheMatch() {
  const players = await getPlayers();
  const playersInTheMatch = [];
  try {
    const elements = Array.from(document.querySelectorAll('*'));
    const faceitIds = players.map(player => player.faceit_id).filter(id => id);

    elements.forEach(el => {
      const textContent = el.textContent.trim();

      if (faceitIds.includes(textContent)) {
        playersInTheMatch.push(textContent)
      }
    });

  } catch (error) {
    console.error('Error fetching Faceit IDs:', error);
  }

  return Array.from(new Set(playersInTheMatch));
}

function createButton() {
  const button = document.createElement('button');
  button.innerText = 'Abrir roletao';
  button.style.padding = '10px';
  button.style.backgroundColor = '#007bff';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  button.style.margin = '10px';
  button.style.display = 'inline-block'; // To ensure proper alignment

  // Add a click event to the button
  button.addEventListener('click', async () => {
    const players = await getPlayersInTheMatch();
    chrome.runtime.sendMessage({ action: 'openWheelofNames', players });
  });

  return button;
}
  
  // Function to insert the button after the target element
function insertButtonAfterElement() {
  const elements = Array.from(document.querySelectorAll('*'));
  const targetElement = elements.find(el => el.textContent.trim().startsWith('lobby'));

  if (targetElement) {
    // Create the button
    const button = createButton();

    // Insert the button immediately after the target element
    targetElement.parentNode.insertBefore(button, targetElement.nextSibling);
  } else {
    // Retry after a short delay if the element is not yet available
    setTimeout(insertButtonAfterElement, 1000);
  }
}
  
// Run the function to insert the button
insertButtonAfterElement();
  