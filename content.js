//ROLETAO
if (window.location.hostname === 'wheelofnames.com') {
    chrome.runtime.sendMessage({ action: 'getNames' }, response => {
        const wheelCanvas = document.getElementById('parentDiv');

        makeCanvasReadOnly(wheelCanvas);

        function makeCanvasReadOnly(wheelCanvas) {
          if (wheelCanvas) {
            wheelCanvas.style.pointerEvents = 'none';
          }
        }

        function makeCanvasClickable(wheelCanvas) {
          if (wheelCanvas) {
            wheelCanvas.style.pointerEvents = 'auto';  // Make the canvas interactive again
          }
        }

        const urlParams = new URLSearchParams(window.location.search);
        const players = urlParams.getAll('player');

        const namesList = document.createElement('div');
        namesList.id = 'namesList';

        players.forEach(player => {
            
            const playerElement = document.createElement('div');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.marginRight = '5px';
            checkbox.value = player;
            playerElement.appendChild(checkbox);

            if (response.names.includes(player)) {
                const angelImage = document.createElement('img');
                angelImage.src = 'https://cdn-icons-png.flaticon.com/512/6190/6190680.png'; 
                angelImage.alt = 'Angel';
                angelImage.style.marginLeft = '5px';
                angelImage.style.marginRight = '5px';
                angelImage.style.height = '1em'; 
                angelImage.style.width = 'auto';

                playerElement.appendChild(angelImage);
            }

            playerElement.addEventListener('click', () => {
              checkbox.checked = !checkbox.checked;
            });

            const nameText = document.createTextNode(player);
            playerElement.appendChild(nameText);

            namesList.appendChild(playerElement);
        });

        // Container for combo box and submit button
        const formContainer = document.createElement('div');
        formContainer.id = 'formContainer';
        formContainer.style.marginTop = '10px'; // Adjust the margin as needed

        // Combo box to select a number from 1 to 4
        const numberLabel = document.createElement('label');
        numberLabel.textContent = 'Número de jogadores esperando';

        const numberSelect = document.createElement('select');
        numberSelect.id = 'numberSelect';
        numberSelect.style.marginRight = '10px';
        numberSelect.style.textColor = 'black'
        for (let i = 1; i <= 4; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            numberSelect.appendChild(option);
        }
        formContainer.appendChild(numberSelect);

        // Submit button
        const submitButton = document.createElement('button');
        submitButton.id = 'submitButton';
        submitButton.textContent = 'Liberar a roleta';
        submitButton.addEventListener('click', () => {
            const selectedNumber = document.getElementById('numberSelect').value;
            makeCanvasClickable(wheelCanvas);
            submitButton.disabled = true;
            submitButton.style.cursor = 'not-allowed';
            submitButton.textContent = 'Roleta liberada';
        });
        namesList.appendChild(numberLabel);
        
        namesList.appendChild(formContainer);

        namesList.appendChild(submitButton);

        document.body.appendChild(namesList);

    });
}

//FACEIT
async function fetchFaceitIds() {
    try {
      const response = await fetch('https://raw.githubusercontent.com/arthurfresca/opa-roletao-extension/master/resources/playermapping.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // Extract faceit_id values from the JSON array
      return data.map(item => item.faceit_id).filter(id => id); // Filter out empty strings
    } catch (error) {
      console.error('Error fetching faceit IDs:', error);
      return [];
    }
  }

  async function matchPlayers() {
    const players = [];
    try {
        const elements = Array.from(document.querySelectorAll('*'));

        // Fetch Faceit IDs
        const faceitIds = await fetchFaceitIds();

        elements.forEach(el => {
            const textContent = el.textContent.trim();

            if (faceitIds.includes(textContent)) {
                players.push(textContent)
            }
        });
    } catch (error) {
        console.error('Error fetching Faceit IDs:', error);
    }

    return Array.from(new Set(players));
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
        const players = await matchPlayers();
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
  