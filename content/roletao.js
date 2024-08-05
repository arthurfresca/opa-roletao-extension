if (window.location.hostname === 'wheelofnames.com') {
  
  chrome.runtime.sendMessage({ action: 'getPlayers' }, response => {
    const faceItIdsList = response.map(player => player.faceitId);
    const playersWithAngel = response.filter(player => player.hasAngel).map(player => player.faceitId);

    console.error(faceItIdsList);
    console.error(playersWithAngel);

    function showPopup(name) {
      alert(`The name "${name}" appears 3 times!`);
    }

  function findNameWithThreeOccurrences(str, names) {
    for (let name of names) {
        // Create a regular expression to match the name globally in the string
        let regex = new RegExp(name, 'g');
        let matches = str.match(regex);

        // Check if the name occurs 3 times
        if (matches && matches.length === 3) {
            return name; // Return the first name found with exactly 3 occurrences
        }
    }

    return null; // Return null if no name is found with exactly 3 occurrences
  }

  // Function to handle name counting and popup triggering
  function handleTextBoxChange(textBox) {
      const nameCounts = {};

      const observerCallback = (mutationsList) => {
          mutationsList.forEach(mutation => {
              if (mutation.type === 'childList' || mutation.type === 'characterData') {
                  const result = findNameWithThreeOccurrences(textBox.textContent.trim(), faceItIdsList);
              }
          });
      };

      const observer = new MutationObserver(observerCallback);
      observer.observe(textBox, { childList: true, characterData: true, subtree: true });
  }

  // Function to initialize the observer
  function initObserver() {
      const textBox = document.querySelector('.results-textbox');
      if (textBox) {
          handleTextBoxChange(textBox);
      } else {
          console.error('TextBox not found');
      }
  }

  // Use MutationObserver to detect when the target element is added to the DOM
  const observer = new MutationObserver(() => {
      const textBox = document.querySelector('.results-textbox');
      
      if (textBox) {
          initObserver();
          observer.disconnect(); // Stop observing once the element is found
      }
  });

  observer.observe(document.body, { childList: true, subtree: true });

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

    function simulateTypingAndTriggerEvents(selectedNames) {
      const editorDiv = document.querySelector('.basic-editor');
      editorDiv.innerHTML = ''; 

      selectedNames.forEach(name => {
        if (!editorDiv) return;
        
        const currentContent = editorDiv.innerHTML;

        editorDiv.innerHTML = `${currentContent}<div>${name}</div>`;
    
        // Create and dispatch input event
        const inputEvent = new Event('input', { bubbles: true });
        editorDiv.dispatchEvent(inputEvent);
    
        // Create and dispatch change event if needed
        const changeEvent = new Event('change', { bubbles: true });
        editorDiv.dispatchEvent(changeEvent);
      });
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

      if (playersWithAngel.includes(player)) {
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
      const selectedNames = Array.from(document.querySelectorAll('#namesList input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.value);


      simulateTypingAndTriggerEvents(selectedNames);

      const selectedNumber = document.getElementById('numberSelect').value;
      submitButton.disabled = true;
      submitButton.style.cursor = 'not-allowed';
      submitButton.textContent = 'Roleta liberada';
      makeCanvasClickable(wheelCanvas);
    });

    namesList.appendChild(numberLabel);
    namesList.appendChild(formContainer);
    namesList.appendChild(submitButton);

    document.body.appendChild(namesList);

  });
}