if (window.location.hostname === 'wheelofnames.com') {
  chrome.runtime.sendMessage({ action: 'getPlayers' }, response => {
    const faceItIdsList = response.map(player => player.faceitId);
    const playersWithAngel = response.filter(player => player.hasAngel).map(player => player.faceitId);

    function findNameWithThreeOccurrences(str, names) {
      for (let name of names) {
        let regex = new RegExp(name, 'g');
        let matches = str.match(regex);

        if (matches && matches.length === 3) {
          return name;
        }
      }
      return null;
    }

    function handleTextBoxChange(textBox) {
      const observerCallback = (mutationsList) => {
        mutationsList.forEach(mutation => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const gotAngel = findNameWithThreeOccurrences(textBox.textContent.trim(), faceItIdsList);
            if (gotAngel != null) {
              alert(gotAngel);
            }
          }
        });
      };

      const observer = new MutationObserver(observerCallback);
      observer.observe(textBox, { childList: true, characterData: true, subtree: true });
    }

    function initObserver() {
      const textBox = document.querySelector('.results-textbox');
      if (textBox) {
        handleTextBoxChange(textBox);
      } else {
        console.error('TextBox not found');
      }
    }

    function observeDOM() {
      const observer = new MutationObserver(() => {
        const textBox = document.querySelector('.results-textbox');
        if (textBox) {
          initObserver();
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    function makeCanvasReadOnly(wheelCanvas) {
      if (wheelCanvas) {
        wheelCanvas.style.pointerEvents = 'none';
      }
    }

    function makeCanvasClickable(wheelCanvas) {
      if (wheelCanvas) {
        wheelCanvas.style.pointerEvents = 'auto';
      }
    }

    function simulateTypingAndTriggerEvents(selectedNames) {
      const editorDiv = document.querySelector('.basic-editor');
      editorDiv.innerHTML = '';

      selectedNames.forEach(name => {
        if (!editorDiv) return;

        const currentContent = editorDiv.innerHTML;
        editorDiv.innerHTML = `${currentContent}<div>${name}</div>`;

        const inputEvent = new Event('input', { bubbles: true });
        editorDiv.dispatchEvent(inputEvent);

        const changeEvent = new Event('change', { bubbles: true });
        editorDiv.dispatchEvent(changeEvent);
      });
    }

    function createNamesList(players, playersWithAngel) {
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
          angelImage.style.margin = '0 5px';
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

      return namesList;
    }

    function createFormContainer() {
      const formContainer = document.createElement('div');
      formContainer.id = 'formContainer';
      formContainer.style.marginTop = '10px';

      const numberLabel = document.createElement('label');
      numberLabel.textContent = 'Número de jogadores esperando';

      const numberSelect = document.createElement('select');
      numberSelect.id = 'numberSelect';
      numberSelect.style.marginRight = '10px';

      for (let i = 1; i <= 4; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        numberSelect.appendChild(option);
      }

      formContainer.appendChild(numberLabel);
      formContainer.appendChild(numberSelect);

      return formContainer;
    }

    function createSubmitButton(wheelCanvas) {
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

      return submitButton;
    }

    function initializeUI(players, playersWithAngel, wheelCanvas) {
      const namesList = createNamesList(players, playersWithAngel);
      const formContainer = createFormContainer();
      const submitButton = createSubmitButton(wheelCanvas);

      namesList.appendChild(formContainer);
      namesList.appendChild(submitButton);
      document.body.appendChild(namesList);
    }

    const wheelCanvas = document.getElementById('parentDiv');
    makeCanvasReadOnly(wheelCanvas);

    observeDOM();

    const urlParams = new URLSearchParams(window.location.search);
    const players = urlParams.getAll('player');

    initializeUI(players, playersWithAngel, wheelCanvas);
  });
}
