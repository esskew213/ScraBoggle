class BoggleGame {
	constructor() {
		this.menu = new Menu(this);
		this.timer = new Timer(this);
		this.boggleBoard = new BoggleBoard(this);
		this.scorer = new Scorer();

		this.boggleBoard.freeze();
	}

	start = () => {
		this.menu.disable();
		this.timer.reset();
		this.boggleBoard.reset();
		this.scorer.reset();
	};

	end = () => {
		this.menu.enable();
		this.boggleBoard.freeze();
	};

	evaluateWord = (word) => {
		this.scorer.evaluateWord(word);
	};
}

class Menu {
	constructor(boggleGame) {
		this.boggleGame = boggleGame;
		this.playButton = document.querySelector('#play-button');
		this.instructionButton = document.querySelector('#instruction-button');
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
		this.container = document.querySelector('#instruction-popup');
		this.closeButton = document.querySelector('#instruction-popup-close-button');

		this.closeButton.addEventListener('click', this.hide);
	}

	open = () => {
		this.container.style.display = `block`;
		this.closeButton.disabled = false;
	};

	hide = () => {
		this.container.style.display = `none`;
		this.closeButton.disabled = true;
	};
}

class Timer {
	constructor(boggleGame) {
		this.boggleGame = boggleGame;
		this.maxSeconds = 30;
		this.circle = document.querySelector('circle');
		this.secondsLeftHTML = document.querySelector('#duration');
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
			tile.setLetter(randomLetter);
			tile.enable();
		}
	};

	freeze = () => {
		for (const tile of this.tiles) {
			tile.disable();
		}
	};

	getNeighbours = (tile) => {
		let neighbourIndices = [
			tile.idx - this.DIAMETER - 1,
			tile.idx - this.DIAMETER,
			tile.idx - this.DIAMETER + 1,
			tile.idx - 1,
			tile.idx + 1,
			tile.idx + this.DIAMETER - 1,
			tile.idx + this.DIAMETER,
			tile.idx + this.DIAMETER + 1
		];

		const correctRowOffsets = [ -1, -1, -1, 0, 0, 1, 1, 1 ];
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
		return new Set(validIndices.map((idx) => this.tiles[idx]));
	};

	setBoardStateFromTile = (currentTile) => {
		let neighbours = this.getNeighbours(currentTile);
		let tilesBefore = new Set(this.currentTilesHolder.currentTiles.slice(0, -2));
		for (let tile of this.tiles) {
			if ((neighbours.has(tile) || tile === currentTile) && !tilesBefore.has(tile)) {
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

	reset = () => {
		this.currentTiles = [];
		this.currentLettersHolder.innerText = '';
	};

	numTiles = () => {
		return this.currentTiles.length;
	};

	hasWordStarted = () => {
		return this.numTiles() > 0;
	};

	addTile = (tile) => {
		this.currentTiles.push(tile);
		this.currentLettersHolder.innerText += tile.getLetter();
	};

	popTile = () => {
		this.currentLettersHolder.innerText = this.currentLettersHolder.innerText.slice(0, -1);
		return this.currentTiles.pop();
	};

	getTileBefore = () => {
		return this.currentTiles.at(-2);
	};

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

	getLetter = () => {
		return this.letter;
	};

	enable = () => {
		this.button.disabled = false;
	};

	disable = () => {
		this.button.disabled = true;
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
	constructor() {
		WordSetGetter.fetchAndParse().then((wordSet) => {
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
				}
			} else {
				console.log('Word already played before.');
			}
		} else {
			console.log('Word too short.');
		}
	};

	reset = () => {
		this.scoredWords = new Set();
		this.totalScore = 0;
		this.totalScoreHTML.innerText = '0';
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
