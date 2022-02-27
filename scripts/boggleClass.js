/*
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
class Game {
	constructor(
		boggleGridContainer,
		shuffleButton,
		restartButton,
		submitButton,
		guessedWordsDiv,
		nowSpellingDiv,
		totalScoreNum,
		gridLength = 4,
		dictionary
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

		// selectors from the DOM
		this.shuffleButton = shuffleButton;
		this.restartButton = restartButton;
		this.nowSpellingDiv = nowSpellingDiv;
		this.submitButton = submitButton;
		this.guessedWordsDiv = guessedWordsDiv;
		this.totalScoreNum = totalScoreNum;
		this.dictionary = dictionary;

		// to track high score if more than one game is played
		this.highScore = 0;
		//
		this.totalScore = 0;
		this.wordsGuessed = {};
		this.coordsInWordCurrentlySelected = [];
		this.lettersInWordCurrentlySelected = [];
		this.generateBoolean();
		// adding event listener to the start button
		this.shuffleButton.addEventListener('click', () => {
			this.submitButton.disabled = false;
			this.shuffleButton.disabled = true;
			let shuffledDiceArr = this.shuffleBoggleDice();
			let letterArr = this.shuffleBoggleLetters(shuffledDiceArr);
			this.addLettersToSquares(letterArr);
			this.addListenersOnSquares();
		});
		// adding event listener to restart button
		this.restartButton.addEventListener('click', () => {
			this.submitButton.disabled = false;
			this.restartButton.style.visibility = 'hidden';
			this.resetGrid();
			this.guessedWordsDiv.innerText = '';
			this.totalScoreNum.innerText = '';
			this.highScoreCalculator();
			this.totalScore = 0;
			let shuffledDiceArr = this.shuffleBoggleDice();
			let letterArr = this.shuffleBoggleLetters(shuffledDiceArr);
			this.addLettersToSquares(letterArr);
		});
		// adding event listener to the submit button
		this.submitButton.addEventListener('click', () => {
			let submittedWord = this.submitWord();
			this.checkWord(submittedWord);
			// this.resetGrid();
		});
		// creating the empty boggle grid
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
	shuffleBoggleLetters(shuffledDiceArr) {
		const totalLettersRequired = this.gridLength ** 2;
		const letterArr = [];

		for (let i = 0; i < totalLettersRequired; i++) {
			let j = i;
			// if the grid is bigger than 16 then start reusing boggle dice (but the dice themselves are not shuffled again)
			if (i >= shuffledDiceArr.length) {
				j %= shuffledDiceArr.length;
			}
			let randomLetter = Math.floor(Math.random() * shuffledDiceArr[0].length);
			let letter = shuffledDiceArr[j][randomLetter];
			if (letter === 'Q') {
				letter += 'U';
			}
			letterArr.push(letter);
		}
		return letterArr;
	}
	// appends letters into the divs generated
	addLettersToSquares(letterArr) {
		for (let i = 0; i < this.gridLength; i++) {
			for (let j = 0; j < this.gridLength; j++) {
				let rowOfLetters = letterArr.slice(j * this.gridLength, (j + 1) * this.gridLength);
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
					this.lettersInWordCurrentlySelected.push(evt.target.innerText);
					this.coordsInWordCurrentlySelected.push([ i, j ]);
					this.updateButtonBoolean(i, j);
					this.styleButtons(evt);
					this.printNowSpelling(evt);
					this.updateButtonDisabled();
				});
			}
		}
		// for (let i = 0; i < this.gridLength; i++) {
		// 	for (let j = 0; j < this.gridLength; j++) {
		// 		this.getLetterFromCoords(i, j).addEventListener('mouseover', (evt) => {
		// 			// if started word selection process

		// 			if (this.coordsInWordCurrentlySelected.length > 0) {
		// 				if (
		// 					this.coordsInWordCurrentlySelected.length > 1 &&
		// 					this.coordsInWordCurrentlySelected.at(-2) === [ i, j ]
		// 				) {
		// 					this.coordsInWordCurrentlySelected.pop();
		// 					this.disabled = false;
		// 				} else {
		// 					this.lettersInWordCurrentlySelected.push(evt.target.innerText);
		// 					this.coordsInWordCurrentlySelected.push([ i, j ]);
		// 					this.updateButtonBoolean(i, j);
		// 				}

		// 				this.styleButtons(evt);
		// 				this.printNowSpelling(evt);
		// 				this.updateButtonDisabled();
		// 			}
		// 		});
		// 	}
		// }
	}

	generateBoolean(numToFill) {
		const boolRow = new Array(this.gridLength).fill(numToFill);
		const boolGrid = new Array(this.gridLength).fill(boolRow);
		return boolGrid;
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

	printNowSpelling(evt) {
		this.nowSpellingDiv.innerText += evt.target.innerText;
	}

	// style selected buttons (called when button is pressed)
	styleButtons(evt) {
		evt.target.classList.add('selected');
	}
	// submit, check, score word and display in the DOM
	submitWord() {
		return this.lettersInWordCurrentlySelected.join('');
	}
	printInvalidWordMsg(msg) {
		this.nowSpellingDiv.classList.add('invalid-word');
		this.nowSpellingDiv.innerText = msg;
		setTimeout(() => {
			this.nowSpellingDiv.innerText = '';
			this.nowSpellingDiv.classList.remove('invalid-word');
			this.resetGrid();
		}, 300);
	}
	checkWord(submittedWord) {
		// check the word is valid
		// if valid, return valid word
		if (submittedWord.length <= 2) {
			this.printInvalidWordMsg('TOO SHORT');
		} else if (!(`${submittedWord.toLowerCase()}` in this.dictionary)) {
			this.printInvalidWordMsg('NOT A WORD');
		} else if (`${submittedWord}` in this.wordsGuessed) {
			this.printInvalidWordMsg('ALREADY GUESSED');
		} else {
			this.scoreWord(submittedWord);
			this.totalScoreCalculator(submittedWord);
			this.printWordToDOM(submittedWord);
			this.printTotalScoreToDOM(submittedWord);
			this.resetGrid();
		}
		// if not print error message and reset
		/////////
	}
	scoreWord(validWord) {
		const wordLength = validWord.length;
		let score = this.SCORING[`${wordLength}`];
		const highestPossibleScoreIndex = parseInt(Object.keys(this.SCORING)[Object.keys(this.SCORING).length - 1]);
		if (wordLength >= highestPossibleScoreIndex) {
			score = this.SCORING[`${highestPossibleScoreIndex}`];
		}
		this.currentWordScore = score;
	}
	printWordToDOM(validWord) {
		this.wordsGuessed[validWord] = this.currentWordScore;
		const newWord = document.createElement('p');
		newWord.classList.add('guessed-words');
		newWord.innerText = `${validWord}: ${this.currentWordScore}`;
		this.guessedWordsDiv.append(newWord);
	}
	// IMPORTANT! reset of grid after every guessed word
	resetGrid() {
		this.lettersInWordCurrentlySelected = [];
		this.coordsInWordCurrentlySelected = [];
		this.currentWordScore = 0;
		this.buttonBoolean = JSON.parse(JSON.stringify(this.generateBoolean(0)));
		this.clearStyleButtons();
		this.clearNowSpelling();
		this.updateButtonDisabled();
	}
	// remove style from buttons (called in resetGrid)
	clearStyleButtons() {
		for (let i = 0; i < this.gridLength; i++) {
			for (let j = 0; j < this.gridLength; j++) {
				this.getLetterFromCoords(i, j).classList.remove('selected');
			}
		}
	}
	clearNowSpelling() {
		this.nowSpellingDiv.innerText = '';
	}
	// updating total score and printing to DOM
	totalScoreCalculator() {
		this.totalScore += this.currentWordScore;
	}
	printTotalScoreToDOM() {
		this.totalScoreNum.innerText = this.totalScore;
	}
	highScoreCalculator() {
		if (this.totalScore > this.overallHighScore) {
			this.overallHighScore = this.totalScore;
		}
	}
}
