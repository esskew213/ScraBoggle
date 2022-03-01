class BoggleGame {
	constructor() {
		// initialises menu bar, timer, scorer, and boggle board of letters
		this.menu = new Menu(this);
		this.timer = new Timer(this);
		this.loader = new LoadingPage(this);
		this.boggleBoard = new BoggleBoard(this);
		this.scorer = new Scorer(this);

		this.boggleBoard.freeze();
	}

	// when game begins or restarts, disable the menu buttons, reset the timer and scores, reset the board
	start = () => {
		this.menu.disable();
		this.timer.reset();
		this.boggleBoard.reset();
		this.scorer.reset();
	};

	// when game has ended (time is up), re-enable menu so that player can play again. disable board buttons
	end = () => {
		this.menu.enable();
		this.boggleBoard.freeze();
	};

	//
	evaluateWord = (word) => {
		this.scorer.evaluateWord(word);
	};
}

class LoadingPage {
	constructor(boggleGame) {
		this.boggleGame = boggleGame;
		this.boggleGame.loadingPage = document.querySelector('.loading-page');
		this.disappear();
	}
	disappear = () => {
		this.boggleGame.loadingPage.classList.add('remove-loading-page');
		setTimeout(() => this.boggleGame.loadingPage.remove(), 5000);
	};
}
class Menu {
	constructor(boggleGame) {
		this.boggleGame = boggleGame;
		this.playButton = document.querySelector('#play-button');
		this.instructionButton = document.querySelector('.instruction-button');
		this.instructionPopup = new InstructionPopup();

		this.playButton.addEventListener('click', this.boggleGame.start);
		this.instructionButton.addEventListener('click', this.instructionPopup.open);
	}

	enable = () => {
		this.playButton.disabled = false;
		this.instructionButton.disabled = false;
	};

	disable = () => {
		this.playButton.disabled = true;
		this.instructionButton.disabled = true;
		this.instructionPopup.hide();
	};
}

class InstructionPopup {
	constructor() {
		this.container = document.querySelector('.instruction-popup');
		this.closeButton = document.querySelector('.instruction-popup-close-button');

		this.closeButton.addEventListener('click', this.hide);
	}

	open = () => {
		this.container.classList.add('show-popup');
		this.closeButton.disabled = false;
	};

	hide = () => {
		this.container.classList.remove('show-popup');
		this.closeButton.disabled = true;
	};
}

class Timer {
	constructor(boggleGame) {
		this.boggleGame = boggleGame;
		this.maxSeconds = 30;
		this.circle = document.querySelector('circle');
		this.secondsLeftHTML = document.querySelector('#seconds-left');
		this.perimeter = this.circle.getAttribute('r') * 2 * Math.PI;
		this.circle.setAttribute('stroke-dasharray', this.perimeter);
	}

	reset = () => {
		this.currentSeconds = this.maxSeconds;
		this.tick();
		this.timerID = setInterval(this.tick, 1000);
	};

	tick = () => {
		this.secondsLeftHTML.value = this.currentSeconds;
		if (this.currentSeconds === 0) {
			this.finished();
		}

		this.currentSeconds -= 1;
		this.circle.setAttribute(
			'stroke-dashoffset',
			this.perimeter * this.currentSeconds / this.maxSeconds - this.perimeter
		);
	};

	finished = () => {
		clearInterval(this.timerID);
		this.boggleGame.end();
	};
}

class BoggleBoard {
	constructor(boggleGame) {
		// Create internal representation of tiles
		this.tiles = [];
		this.DIAMETER = 4;
		this.boggleDice = [
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

		for (let idx = 0; idx < this.DIAMETER ** 2; idx++) {
			this.tiles.push(new Tile(idx, this));
		}

		// Create display representation of tiles
		this.boggleGridContainer = document.querySelector('#boggle-container');
		for (let row_idx = 0; row_idx < this.DIAMETER; row_idx++) {
			let row = document.createElement('div');
			row.classList.add('row');
			for (let col_idx = 0; col_idx < this.DIAMETER; col_idx++) {
				let tile = this.tiles[row_idx * this.DIAMETER + col_idx];
				row.append(tile.getHTMLButton());
			}
			this.boggleGridContainer.append(row);
		}

		this.boggleGame = boggleGame;
		this.currentTilesHolder = new CurrentTilesHolder();

		document.addEventListener('mouseup', this.endWord);
	}

	reset = () => {
		this.currentTilesHolder.reset();
		Utils.shuffle(this.boggleDice);

		for (let i = 0; i < this.tiles.length; i++) {
			let tile = this.tiles[i];
			let randomLetter = this.boggleDice[i][Math.floor(Math.random() * 6)];
			tile.disable();
			tile.setLetter(randomLetter);
			tile.animate();
			setTimeout(() => tile.enable(), 1000);
		}
	};

	freeze = () => {
		this.endWord();
		for (const tile of this.tiles) {
			tile.disable();
		}
	};

	getNeighbours = (tile) => {
		// get the indices of the 8 surrounding tiles
		let neighbourIndices = [
			// gets the row above
			tile.idx - this.DIAMETER - 1,
			tile.idx - this.DIAMETER,
			tile.idx - this.DIAMETER + 1,
			// gets tiles on the left and right
			tile.idx - 1,
			tile.idx + 1,
			// gets the row below
			tile.idx + this.DIAMETER - 1,
			tile.idx + this.DIAMETER,
			tile.idx + this.DIAMETER + 1
		];
		// rows on which you expect the neightbouring tiles to be, relative to yourself
		// three on the row before, two on the same row, three on the row after
		const correctRowOffsets = [ -1, -1, -1, 0, 0, 1, 1, 1 ];
		// get the row you are on, get the rows of everyone else. then check if the offsets are correct
		const currentRow = Math.floor(tile.idx / this.DIAMETER);
		const rowOffsets = neighbourIndices.map((idx) => Math.floor(idx / this.DIAMETER) - currentRow);

		let validIndices = [];
		for (let i = 0; i < rowOffsets.length; i++) {
			if (rowOffsets[i] === correctRowOffsets[i]) {
				let idx = neighbourIndices[i];
				if (idx >= 0 && idx < this.tiles.length) {
					validIndices.push(idx);
				}
			}
		}
		// creates a set of the valid neighbouring tiles
		return new Set(validIndices.map((idx) => this.tiles[idx]));
	};

	setBoardStateFromTile = (currentTile) => {
		let neighbours = this.getNeighbours(currentTile);
		// get everything except the current tile and the tile just before it
		let tilesBefore = new Set(this.currentTilesHolder.currentTiles.slice(0, -2));
		for (let tile of this.tiles) {
			let isTileOutOfUndoRange = tilesBefore.has(tile);
			let isTileAroundCursor = neighbours.has(tile) || tile === currentTile;
			if (isTileAroundCursor && !isTileOutOfUndoRange) {
				tile.enable();
			} else {
				tile.disable();
			}
		}
		currentTile.highlight();
	};

	startWord = (tile) => {
		this.currentTilesHolder.addTile(tile);
		this.setBoardStateFromTile(tile);
	};

	addLetterToWord = (tile) => {
		if (this.currentTilesHolder.hasWordStarted()) {
			let is_undo = this.currentTilesHolder.numTiles() > 1 && this.currentTilesHolder.getTileBefore() === tile;
			if (is_undo) {
				let prevTile = this.currentTilesHolder.popTile();
				this.setBoardStateFromTile(tile);
				prevTile.reset();
			} else if (tile != this.currentTilesHolder.peek()) {
				this.currentTilesHolder.addTile(tile);
				this.setBoardStateFromTile(tile);
			}
		}
	};

	endWord = () => {
		if (this.currentTilesHolder.hasWordStarted()) {
			this.boggleGame.evaluateWord(this.currentTilesHolder.getWord());
			this.currentTilesHolder.reset();
			for (let tile of this.tiles) {
				tile.reset();
			}
		}
	};
}

class CurrentTilesHolder {
	constructor() {
		this.currentTiles = [];
		this.currentLettersHolder = document.querySelector('#current-letters-holder');
	}
	printMsg = (msg) => {
		this.currentLettersHolder.innerText = msg;

		setTimeout(() => (this.currentLettersHolder.innerText = ''), 300);
	};

	reset = () => {
		this.currentTiles = [];
		setTimeout(() => (this.currentLettersHolder.innerText = ''), 300);
	};

	numTiles = () => {
		return this.currentTiles.length;
	};

	// returns a boolean — true if the first letter has been clicked
	hasWordStarted = () => {
		return this.numTiles() > 0;
	};

	// adds the tile to the currentTiles array and changes the text being displayed in the DOM
	addTile = (tile) => {
		this.currentTiles.push(tile);
		this.currentLettersHolder.innerText += tile.getLetter();
	};

	// removes the letter from the DOM and the tile from the currentTile array
	popTile = () => {
		this.currentLettersHolder.innerText = this.currentLettersHolder.innerText.slice(0, -1);
		return this.currentTiles.pop();
	};

	//get the tile before the tile that you just inserted
	getTileBefore = () => {
		return this.currentTiles.at(-2);
	};

	// gets the tile that you've just inserted
	peek = () => {
		return this.currentTiles.at(-1);
	};

	getWord = () => {
		return this.currentTiles.map((tile) => tile.getLetter()).join('');
	};
}

class Tile {
	constructor(idx, boggleBoard) {
		this.boggleBoard = boggleBoard;
		this.idx = idx;
		this.button = document.createElement('button');
		this.button.setAttribute('id', `tile-button-${idx}`);
		this.button.classList.add(`tile-button`);

		this.button.addEventListener('mousedown', () => this.boggleBoard.startWord(this));
		this.button.addEventListener('mouseover', () => this.boggleBoard.addLetterToWord(this));
	}

	setLetter = (letter) => {
		if (letter === 'Q') {
			letter = 'Qu';
		}
		this.letter = letter;

		this.button.innerText = letter;
	};

	animate = () => {
		this.button.classList.add('tile-flip');
		setTimeout(() => {
			this.button.classList.remove('tile-flip');
		}, 1000);
	};

	getLetter = () => {
		return this.letter;
	};

	enable = () => {
		this.button.disabled = false;
		this.button.style.pointerEvents = `auto`;
	};

	disable = () => {
		this.button.disabled = true;
		this.button.style.pointerEvents = `none`;
	};

	getHTMLButton = () => {
		return this.button;
	};

	highlight = () => {
		this.button.classList.add('selected');
	};

	reset = () => {
		this.enable();
		this.button.classList.remove('selected');
	};
}

class Utils {
	static shuffle = (array) => {
		for (let idx = array.length - 1; idx > 0; idx--) {
			let random_idx_before = Math.floor(Math.random() * (idx + 1));
			[ array[idx], array[random_idx_before] ] = [ array[idx], array[random_idx_before] ];
		}
	};
}

class Scorer {
	constructor(boggleGame) {
		WordSetGetter.fetchAndParse().then((wordSet) => {
			this.boggleGame = boggleGame;
			this.boggleContainer = this.boggleGame.boggleBoard.boggleGridContainer;
			this.currentTilesHolder = this.boggleGame.boggleBoard.currentTilesHolder;
			this.wordSet = wordSet;
			this.SCORING = { 3: 1, 4: 1, 5: 2, 6: 3, 7: 5, 8: 11 };
			this.guessedWordsHTML = document.querySelector('#guessed-words');
			this.totalScoreHTML = document.querySelector('#total-score-number');
		});
	}

	evaluateWord = (word) => {
		word = word.toLowerCase();
		console.log(word);
		if (word.length > 2) {
			if (!this.scoredWords.has(word)) {
				if (this.wordSet.has(word)) {
					// Internal logic
					let score = this.SCORING[`${Math.min(word.length, 8)}`];
					this.totalScore += score;
					this.scoredWords.add(word);

					// Display logic
					this.totalScoreHTML.innerText = this.totalScore;
					const newWord = document.createElement('p');
					newWord.classList.add('guessed-words');
					newWord.innerText = `${word}: ${score}`;
					this.guessedWordsHTML.append(newWord);
				} else {
					console.log('Word not in dictionary.');
					this.currentTilesHolder.printMsg('NOT A WORD');
					this.vibrate();
				}
			} else {
				console.log('Word already played before.');
				this.currentTilesHolder.printMsg('ALREADY FOUND');
				this.vibrate();
			}
		} else {
			this.currentTilesHolder.printMsg('TOO SHORT');
			this.vibrate();
			console.log('Word too short.');
		}
	};
	vibrate = () => {
		this.boggleContainer.classList.add('vibrate');

		setTimeout(() => {
			this.boggleContainer.classList.remove('vibrate');
		}, 500);
	};
	reset = () => {
		this.scoredWords = new Set();
		this.totalScore = 0;
		this.totalScoreHTML.innerText = '';
		this.guessedWordsHTML.innerText = '';
	};
}

class WordSetGetter {
	static fetchAndParse = () => {
		const DICTIONARY_URL = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json';
		return fetch(DICTIONARY_URL)
			.then((response) => response.json())
			.then((responseJSON) => new Set(Object.keys(responseJSON)));
	};
}

let game = new BoggleGame();
