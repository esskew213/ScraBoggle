/*
OUTSTANDING LOGIC:
How to keep track of letters already used for each word? -- could initialise array to track?
How to keep track of words submitted already? -- can initialise object to track scores and words?
How to validate user's word is valid word -- Dictionary API
How to require word to be of min length -- check on submission
How to score word -- check boggle scoring rules

DISPLAY:
score
words and their scores

GOOD TO HAVE:
Timer

Get hint for words / get all possible words from that board
Get keyboard input from users instead
Loading animation (Matter JS?)
Add Boggle for other languages?
Let users change grid size?
Have letters select on click and drag mouse, rather than clicking each one separate
*/

/* ======================================
======================================
SHUFFLING THE LETTERS AND GENERATING THE BOGGLE GRID
======================================
====================================== */
BOGGLEDICE = [
	'RIFOBX',
	'IFEHEY',
	'DENOWS',
	'UTOKND',
	'HMSRAO',
	'LUPETS',
	'ACITOA',
	'YLGKUE',
	'QBMJOA',
	'EHISPN',
	'VETIGN',
	'BALIYT',
	'EZAVND',
	'RALESC',
	'UWILRG',
	'PACEMD'
];

function createBoggleSquares(gridLength = 4) {
	boggleGridContainer = document.querySelector('#boggle-container');

	for (let i = 0; i < gridLength; i++) {
		const row = document.createElement('div');
		for (let j = 0; j < gridLength; j++) {
			row.classList.add('row');
			const square = document.createElement('button');
			square.classList.add(`row-${i}`, `col-${j}`, `boggle-button`);
			row.append(square);
		}
		boggleGridContainer.append(row);
	}
}

function getLetterFromCoords(row, col) {
	return document.querySelector(`.row-${row}.col-${col}`);
}
function shuffleBoggleDice() {
	copiedArr = [ ...BOGGLEDICE ];

	for (let i = BOGGLEDICE.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[ copiedArr[i], copiedArr[j] ] = [ copiedArr[j], copiedArr[i] ];
	}
	return copiedArr;
}
function shuffleBoggleLetters(arr, gridLength = 4) {
	totalLettersRequired = gridLength ** 2;
	letterArr = [];

	for (let i = 0; i < totalLettersRequired; i++) {
		let j = i;
		// if the grid is bigger than 16 then start reusing boggle dice (but the dice themselves are not shuffled again)
		if (i >= arr.length) {
			j %= arr.length;
		}
		let randomLetter = Math.floor(Math.random() * arr[0].length);
		let letter = arr[j][randomLetter];
		if (letter === 'Q') {
			letter += 'U';
		}
		letterArr.push(letter);
	}
	return letterArr;
}
function addLettersToSquares(arr, gridLength = 4) {
	for (let i = 0; i < gridLength; i++) {
		for (let j = 0; j < gridLength; j++) {
			let rowOfLetters = arr.slice(j * gridLength, (j + 1) * gridLength);
			getLetterFromCoords(i, j).innerText = rowOfLetters[i];
		}
	}
}
/* ======================================
======================================
KEEPING TRACK OF WHAT LETTERS HAVE BEEN CLICKED
======================================
====================================== */
function updateButtonDisabled(booleanArr) {
	for (let i = 0; i < booleanArr.length; i++) {
		for (let j = 0; j < booleanArr.length; j++) {
			getLetterFromCoords(i, j).disabled = Boolean(booleanArr[i][j]);
		}
	}
}
// [ [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ], [ 0, 0, 0, 0 ] ]
// const buttonBoolean = [ [ 1, 1, 1, 1 ], [ 1, 1, 1, 1 ], [ 1, 1, 1, 1 ], [ 1, 1, 1, 1 ] ];
function updateButtonBoolean(row, col, gridLength = 4) {
	let buttonBoolean = [ [ 1, 1, 1, 1 ], [ 1, 1, 1, 1 ], [ 1, 1, 1, 1 ], [ 1, 1, 1, 1 ] ];
	for (let i = row - 1; i <= row + 1; i++) {
		if (i < 0 || i >= gridLength) {
			continue;
		}
		for (let j = col - 1; j <= col + 1; j++) {
			if (j < 0 || j >= gridLength) {
				continue;
			}
			buttonBoolean[i][j] = 0;
		}
	}
	buttonBoolean[row][col] = 1;
	console.log(buttonBoolean);
	return buttonBoolean;
}

// updateButtonBoolean(0, 1, 4);
// updateButtonBoolean(1, 1);
// updateButtonBoolean(2, 3);

/* ======================================
======================================
INITIALISING THE GAME, INCLUDING ADDING EVENT LISTENERS ONTO SQUARES
======================================
====================================== */
// make the grid
function addListenersOnSquares(gridLength = 4) {
	for (let i = 0; i < gridLength; i++) {
		for (let j = 0; j < gridLength; j++) {
			getLetterFromCoords(i, j).addEventListener('click', () => {
				const updatedButtonBoolean = updateButtonBoolean(i, j);
				updateButtonDisabled(updatedButtonBoolean);
			});
		}
	}
}

createBoggleSquares(4);
// shuffle the letters when the start button is pressed
document.querySelector('#shuffle-button').addEventListener('click', () => {
	addLettersToSquares(shuffleBoggleLetters(shuffleBoggleDice()));
	addListenersOnSquares();
});

class Game {
	constructor(shuffleButton) {
		this.shuffleButton = shuffleButton;
		this.score = 0;
		this.wordsGuessed = {};
		this.lettersCurrentlyBeingSelected = {};
	}
}
const startButton = document.querySelector('#shuffle-button');
