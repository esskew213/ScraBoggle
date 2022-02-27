/*
OUTSTANDING LOGIC:
How to validate user's word is valid word -- CAN'T READ THE JSON FILE HOW?!?!
Sum scores at end of game
Code in restart button
	On click. remove old grid, regenerate new letters, restart and start timer,
	clear total score and clear words, undisable buttons

GOOD TO HAVE:
Let users change grid size? - Just need to add input field / dropdown list.
Link to instructions page / popout?
Make pretty!!!!

EXTRA BONUS
Get hint for words / get all possible words from that board - first need to figure out how to parse in the json file
Have letters select on click and drag mouse, rather than clicking each one separate
Loading page animation (Matter JS?)
Add Boggle for other languages?
Get keyboard input from users instead

*/

/* ======================================
======================================
SHUFFLING THE LETTERS AND GENERATING THE BOGGLE GRID
======================================
====================================== */

// function getWordDictionary() {
// 	keys = fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json')
// 		.then((response) => response.json())
// 		.then((responseJSON) => Object.keys(responseJSON));
// 	return keys;
// }

// const dictionary = getWordDictionary().then((x) => x);
// console.log(dictionary);

class Game {
	constructor(
		boggleGridContainer,
		shuffleButton,
		submitButton,
		guessedWordsDiv,
		nowSpellingDiv,
		totalScoreNum,
		gridLength = 4
	) {
		this.BOGGLEDICE = [
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

		this.SCORING = { 1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 3, 7: 5, 8: 11 };
		this.boggleGridContainer = boggleGridContainer;
		this.gridLength = gridLength;
		this.shuffleButton = shuffleButton;
		this.nowSpellingDiv = nowSpellingDiv;
		this.submitButton = submitButton;
		this.guessedWordsDiv = guessedWordsDiv;
		this.totalScoreNum = totalScoreNum;
		this.totalScore = 0;
		this.wordsGuessed = {};
		this.coordsInWordCurrentlySelected = [];
		this.lettersInWordCurrentlySelected = [];
		this.generateBoolean();
		this.submitButton.addEventListener('click', () => {
			this.submitWord();
			this.checkWord();

			this.resetGrid();
		});
		this.shuffleButton.addEventListener('click', () => {
			this.shuffleBoggleDice();
			this.shuffleBoggleLetters();
			this.addLettersToSquares();
			this.addListenersOnSquares();
		});
		this.createBoggleSquares();
	}
	createBoggleSquares() {
		for (let i = 0; i < this.gridLength; i++) {
			const row = document.createElement('div');
			for (let j = 0; j < this.gridLength; j++) {
				row.classList.add('row');
				const square = document.createElement('button');
				square.classList.add(`row-${i}`, `col-${j}`, `boggle-button`);
				row.append(square);
			}
			this.boggleGridContainer.append(row);
		}
	}
	// gets the button, given the coordinates
	getLetterFromCoords(row, col) {
		return document.querySelector(`.row-${row}.col-${col}`);
	}
	// shuffles all 16 dice into a random order using Fisher-Yates
	shuffleBoggleDice() {
		this.shuffledDiceArr = [ ...this.BOGGLEDICE ];

		for (let i = this.BOGGLEDICE.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[ this.shuffledDiceArr[i], this.shuffledDiceArr[j] ] = [ this.shuffledDiceArr[j], this.shuffledDiceArr[i] ];
		}
		return this.shuffledDiceArr;
	}
	// for each dice, gets a random letter (from 6 letters)
	shuffleBoggleLetters() {
		const totalLettersRequired = this.gridLength ** 2;
		this.letterArr = [];

		for (let i = 0; i < totalLettersRequired; i++) {
			let j = i;
			// if the grid is bigger than 16 then start reusing boggle dice (but the dice themselves are not shuffled again)
			if (i >= this.shuffledDiceArr.length) {
				j %= this.shuffledDiceArr.length;
			}
			let randomLetter = Math.floor(Math.random() * this.shuffledDiceArr[0].length);
			let letter = this.shuffledDiceArr[j][randomLetter];
			if (letter === 'Q') {
				letter += 'U';
			}
			this.letterArr.push(letter);
		}
		return this.letterArr;
	}
	// appends letters into the divs generated
	addLettersToSquares() {
		for (let i = 0; i < this.gridLength; i++) {
			for (let j = 0; j < this.gridLength; j++) {
				let rowOfLetters = this.letterArr.slice(j * this.gridLength, (j + 1) * this.gridLength);
				this.getLetterFromCoords(i, j).innerText = rowOfLetters[i];
			}
		}
	}
	/* ======================================
    ======================================
    KEEPING TRACK OF WHAT LETTERS HAVE BEEN CLICKED
    ======================================
    ====================================== */
	// adds an event listener onto every square that will help to keep track of what is currently being spelt
	addListenersOnSquares() {
		for (let i = 0; i < this.gridLength; i++) {
			for (let j = 0; j < this.gridLength; j++) {
				this.getLetterFromCoords(i, j).addEventListener('click', (evt) => {
					this.getCurrentCoords(evt, i, j);
					this.updateButtonBoolean(i, j);
					this.styleButtons(evt);
					this.printNowSpelling(evt);
					this.updateButtonDisabled();
				});
			}
		}
	}
	generateBoolean(numToFill) {
		const boolRow = new Array(this.gridLength).fill(numToFill);
		this.boolGrid = new Array(this.gridLength).fill(boolRow);
		return this.boolGrid;
	}
	updateButtonBoolean(row, col) {
		this.buttonBoolean = JSON.parse(JSON.stringify(this.generateBoolean(1)));

		for (let i = row - 1; i <= row + 1; i++) {
			if (i < 0 || i >= this.gridLength) {
				continue;
			}
			for (let j = col - 1; j <= col + 1; j++) {
				if (j < 0 || j >= this.gridLength) {
					continue;
				}
				this.buttonBoolean[i][j] = 0;
			}
		}
		this.buttonBoolean[row][col] = 1;
		for (let coord of this.coordsInWordCurrentlySelected) {
			this.buttonBoolean[coord[0]][coord[1]] = 1;
		}
		// console.log(this.buttonBoolean);
		return this.buttonBoolean;
	}
	updateButtonDisabled() {
		for (let i = 0; i < this.buttonBoolean.length; i++) {
			for (let j = 0; j < this.buttonBoolean.length; j++) {
				this.getLetterFromCoords(i, j).disabled = Boolean(this.buttonBoolean[i][j]);
			}
		}
	}

	// on click, we want to get the row and col of the letter, so that we can track what has been pressed.
	// generates array of coordinates of letters currently selected
	getCurrentCoords(evt, row, col) {
		this.lettersInWordCurrentlySelected.push(evt.target.innerText);
		this.coordsInWordCurrentlySelected.push([ row, col ]);
		return this.coordsInWordCurrentlySelected;
	}
	printNowSpelling(evt) {
		this.nowSpellingDiv.innerText += evt.target.innerText;
	}
	clearNowSpelling() {
		this.nowSpellingDiv.innerText = '';
	}
	// style selected buttons (called when button is pressed)
	styleButtons(evt) {
		evt.target.classList.add('selected');
	}
	// remove style from buttons (called in resetGrid)
	clearStyleButtons() {
		for (let i = 0; i < this.gridLength; i++) {
			for (let j = 0; j < this.gridLength; j++) {
				this.getLetterFromCoords(i, j).classList.remove('selected');
			}
		}
	}
	// submit, check, score word and display in the DOM
	submitWord() {
		this.wordToCheck = this.lettersInWordCurrentlySelected.join('');
		console.log(this.wordToCheck);
	}
	checkWord() {
		// check the word is valid
		// if valid, return valid word
		if (this.wordToCheck.length > 2 && !(`${this.wordToCheck}` in this.wordsGuessed)) {
			this.validWord = this.wordToCheck;
			this.scoreWord();
			this.totalScoreCalculator();
			this.printWordToDOM();
			this.printTotalScoreToDOM();
		} else {
			console.log('not a valid word');
			this.resetGrid();
		}
		// if not print error message and reset
		/////////
	}
	scoreWord() {
		const wordLength = this.validWord.length;
		let score = this.SCORING[`${wordLength}`];
		const highestPossibleScoreIndex = parseInt(Object.keys(this.SCORING)[Object.keys(this.SCORING).length - 1]);
		if (wordLength >= highestPossibleScoreIndex) {
			score = this.SCORING[`${highestPossibleScoreIndex}`];
		}
		this.currentWordScore = score;
	}
	printWordToDOM() {
		this.wordsGuessed[this.validWord] = this.currentWordScore;
		const newWord = document.createElement('p');
		newWord.classList.add('guessed-words');
		newWord.innerText = `${this.validWord}: ${this.currentWordScore}`;
		this.guessedWordsDiv.append(newWord);
	}
	resetGrid() {
		this.lettersInWordCurrentlySelected = [];
		this.coordsInWordCurrentlySelected = [];
		this.validWord = '';
		this.wordToCheck = '';
		this.buttonBoolean = JSON.parse(JSON.stringify(this.generateBoolean(0)));
		this.clearStyleButtons();
		this.clearNowSpelling();
		this.updateButtonDisabled();
	}
	totalScoreCalculator() {
		this.totalScore += this.currentWordScore;
	}
	printTotalScoreToDOM() {
		this.totalScoreNum.innerText = this.totalScore;
	}
}
const startButton = document.querySelector('#shuffle-button');
const boggleGridContainer = document.querySelector('#boggle-container');
const submitButton = document.querySelector('#submit-button');
const guessedWordsDiv = document.querySelector('#guessed-words-div');
const nowSpellingDiv = document.querySelector('#now-spelling');
const totalScoreNum = document.querySelector('#total-score-number');

const durationInput = document.querySelector('#duration');
const pauseButton = document.querySelector('#timer-pause');
const circle = document.querySelector('circle');
const perimeter = circle.getAttribute('r') * 2 * Math.PI;
circle.setAttribute('stroke-dasharray', perimeter);

const game = new Game(
	boggleGridContainer,
	startButton,
	submitButton,
	guessedWordsDiv,
	nowSpellingDiv,
	totalScoreNum,
	4
);
let duration;
const timer = new Timer(durationInput, startButton, {
	onStart(totalDuration) {
		duration = totalDuration;
		console.log(`timer started!`);
	},
	onTick(timeRemaining) {
		circle.setAttribute('stroke-dashoffset', perimeter * timeRemaining / duration - perimeter);
		console.log(`timer ticking!`);
	},
	onComplete() {
		for (button of document.querySelectorAll('.boggle-button')) {
			button.disabled = true;
		}
		submitButton.disabled = true;
	}
});
