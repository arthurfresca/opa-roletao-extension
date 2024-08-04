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