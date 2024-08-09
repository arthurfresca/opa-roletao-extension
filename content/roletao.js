const allPlayersWhoWannaStay = [];
const playersWannaStayAndHasAngel = [];
const playersWannaStayAndHasNoAngel = [];
const newAngels = [];
let numOfPlayersWillNeedToLeave = 0;
let numberOfPlayersWantToStay = 0;

// Utility function to send a message to the Chrome runtime and handle the response
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

// Finds a name in the list that appears exactly three times in the given text
function findNameWithThreeOccurrences(text, names) {
  return names.filter(name => !newAngels.includes(name)).find(name => {
    const regex = new RegExp(name, 'g');
    const matches = text.match(regex);
    return matches && matches.length === 3;
  }) || null;
}

// Observes changes to a text box and triggers an alert if a name appears exactly three times
function handleTextBoxChange(textBox, faceItIdsList) {
  const observer = new MutationObserver(mutationsList => {
    mutationsList.forEach(mutation => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        const playerName = findNameWithThreeOccurrences(textBox.textContent.trim(), faceItIdsList);
        if (playerName) {
          playersGotAngel([playerName]);
        }
      }
    });
  });

  observer.observe(textBox, { childList: true, characterData: true, subtree: true });
}

function playersGotAngel(playerNames) {
  newAngels.push(...playerNames);
  
  if (newAngels.length === numberOfPlayersWaiting){
    openWinnerModal();
  }
}

// Initializes the mutation observer if the text box is found
function initObserver(faceItIdsList) {
  const textBox = document.querySelector('.results-textbox');
  if (textBox) {
    handleTextBoxChange(textBox, faceItIdsList);
  } else {
    console.error('TextBox not found');
  }
}

// Makes a canvas read-only by disabling pointer events
function makeCanvasReadOnly(canvas) {
  if (canvas) {
    canvas.style.pointerEvents = 'none';
    simulateTypingAndTriggerEvents([""]);
  }
}

// Makes a canvas clickable by enabling pointer events
function makeCanvasClickable(canvas) {
  if (canvas) {
    canvas.style.pointerEvents = 'auto';
  }
}

// Simulates typing names into an editor and triggers input and change events
function simulateTypingAndTriggerEvents(names) {
  const editor = document.querySelector('.basic-editor');
  if (!editor) return;

  editor.innerHTML = '';
  names.forEach(name => {
    editor.innerHTML += `<div>${name}</div>`;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function openWinnerModal(){
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';
  const modalTitle = document.createElement('h1');
  modalTitle.textContent = 'Resultado final';
  modal.appendChild(modalTitle);

  const willPlay = new Set([...playersWannaStayAndHasNoAngel.filter(player => !newAngels.includes(player)), ...playersWannaStayAndHasAngel, "+ "+numberOfPlayersWaiting+" de fora esperando"]);


  const columnDiv = document.createElement('div');
  columnDiv.id = 'column';
  modalSession(columnDiv, 'Novos(s) anjos', newAngels, "columns");
  modalSession(columnDiv, 'Usou anjo', playersWannaStayAndHasAngel, "columns");
  modal.appendChild(columnDiv);
  modalSession(modal, 'Vai jogar', willPlay, "full-width");

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.className = 'modal-close';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
    document.body.classList.remove('modal-open');
  });
  modal.appendChild(closeButton);

  modalOverlay.appendChild(modal);

  document.body.appendChild(modalOverlay);
  document.body.classList.add('modal-open');
}

function modalSession(container, title, playerList, classStyleName){
  const modalDiv = document.createElement('div');
  modalDiv.classList.add(classStyleName);

  // Create and append the session title
  const sessionTitle = document.createElement('h2');
  sessionTitle.textContent = title;
  modalDiv.appendChild(sessionTitle);

  // Create and append the unordered list
  const ulList = document.createElement('ul');
  playerList.forEach(player => {
    const listItem = document.createElement('li');
    listItem.textContent = player;
    ulList.appendChild(listItem);
  });
  modalDiv.appendChild(ulList);

  // Append the complete session div to the container
  container.appendChild(modalDiv);
}

// Adds player elements with checkboxes and optional angel images to the names list
function addPlayersToTheList(players, playersWithAngel, namesList) {
  players.forEach(player => {
    const playerElement = document.createElement('div');
    playerElement.style.cursor = 'pointer';

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

    playerElement.appendChild(document.createTextNode(player));
    playerElement.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
    });

    namesList.appendChild(playerElement);
  });
}

// Utility function to create a number select dropdown
function createNumberSelect() {
  const numberLabel = document.createElement('label');
  numberLabel.textContent = 'Número de jogadores esperando';

  const numberSelect = document.createElement('select');
  numberSelect.id = 'numberSelect';
  numberSelect.style.marginRight = '10px';

  for (let i = 1; i <= 5; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    numberSelect.appendChild(option);
  }

  return { numberLabel, numberSelect };
}

// Utility function to create a submit button
function createSubmitButton() {
  const submitButton = document.createElement('button');
  submitButton.id = 'submitButton';
  submitButton.textContent = 'Liberar a roleta';
  return submitButton;
}



function releaseWheelClicked(submitButton, wheelCanvas, playersWithAngel) {
  submitButton.addEventListener('click', () => {
    const selectedNames = Array.from(document.querySelectorAll('#namesList input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.value);

    numberOfPlayersWaiting = parseInt(document.getElementById('numberSelect').value, 10);

    allPlayersWhoWannaStay.push(...selectedNames);
    playersWannaStayAndHasAngel.push(...selectedNames.filter(selected => playersWithAngel.includes(selected)));
    playersWannaStayAndHasNoAngel.push(...selectedNames.filter(selected => !playersWithAngel.includes(selected)));

    //numOfPlayersWillNeedToLeave = Math.max(0, playersWannaStayAndHasNoAngel.length + numberOfPlayersWaiting - (5 - playersWannaStayAndHasAngel.length));

    if(numberOfPlayersWaiting == playersWannaStayAndHasNoAngel.length) {
      playersGotAngel(playersWannaStayAndHasNoAngel)
    }

    simulateTypingAndTriggerEvents(playersWannaStayAndHasNoAngel);
    

    submitButton.disabled = true;
    submitButton.style.cursor = 'not-allowed';
    submitButton.textContent = 'Roleta liberada';
    makeCanvasClickable(wheelCanvas);
    clickOnResults();
  });
}

function clickOnResults(){
  // Find the "Results" tab element by its label text content
  const resultsTab = [...document.querySelectorAll('.q-tab__label')].find(element => element.textContent.trim() === 'Results');

  if (resultsTab) {
    resultsTab.click();
  } else {
    console.log('Results tab not found.');
  }
}

// Main function to initialize the extension's functionality
function main() {
  if (window.location.hostname !== 'wheelofnames.com') return;

  const wheelCanvas = document.getElementById('parentDiv');
  makeCanvasReadOnly(wheelCanvas);

  getPlayers().then(allPlayers => {
    const faceItIdsList = allPlayers.map(player => player.faceitId);
    const playersWithAngel = allPlayers.filter(player => player.hasAngel).map(player => player.faceitId);

    // Mutation observer to initialize when the text box appears
    const observer = new MutationObserver(() => {
      const textBox = document.querySelector('.results-textbox');
      if (textBox) {
        initObserver(faceItIdsList);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const urlParams = new URLSearchParams(window.location.search);
    const playersSelected = urlParams.getAll('player');

    const namesList = document.createElement('div');
    namesList.id = 'namesList';

    const playersToAddInTheList = playersSelected.length == 0 ? faceItIdsList : playersSelected;

    addPlayersToTheList(playersToAddInTheList, playersWithAngel, namesList);

    const { numberLabel, numberSelect } = createNumberSelect();

    // Create and append form container
    const formContainer = document.createElement('div');
    formContainer.id = 'formContainer';
    formContainer.style.marginTop = '10px';

    // Create and append submit button
    const submitButton = createSubmitButton();
    releaseWheelClicked(submitButton, wheelCanvas, playersWithAngel)

    formContainer.appendChild(numberLabel);
    formContainer.appendChild(numberSelect);
    formContainer.appendChild(submitButton);

    namesList.appendChild(formContainer);
    document.body.appendChild(namesList);
  }).catch(error => console.error('Failed to get players:', error));
}

// Run the main function
main();
