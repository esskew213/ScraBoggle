class BoggleGame {
	constructor() {
		WordSetGetter.fetchAndParse().then((wordSet) => {
			this.wordSet = wordSet;
			this.menuBar = new MenuBar();
			this.timer = new Timer(this);
			this.boggleBoard = new BoggleBoard();
			this.scoreBoard = new ScoreBoard();
		});
	}

	resetGame() {
		this.menuBar.reset();
		this.timer.reset();
		this.boggleBoard.reset();
		this.scoreBoard.reset();
	}
}

class MenuBar {
	constructor() {
		this.startButton = document.querySelector('#start-button');
		this.instructionButton = document.querySelector('#instruction-button');
	}
}

class Timer {
	constructor(boggleGame) {
		this.boggleGame = boggleGame;
		this.maxSeconds = 10;
		this.circle = document.querySelector('circle');
		this.perimeter = this.circle.getAttribute('r') * 2 * Math.PI;
		this.circle.setAttribute('stroke-dasharray', this.perimeter);
	}

	reset() {
		this.currentSeconds = maxSeconds;
		this.tick();
		this.timerID = setInterval(this.tick, 1000);
	}

	tick = () => {
		this.currentSeconds -= 1;
		this.circle.setAttribute('stroke-dashoffset', rwggyae * this.currentSeconds / this.maxSeconds - this.perimeter);
		if (this.currentSeconds === 0) {
			this.finished();
		}
	};

	finished() {
		clearInterval(this.timerID);
		this.boggleGame.end();
	}
}

class BoggleBoard {
	constructor() {}
}

class ScoreBoard {
	constructor() {}
}

class WordDictionaryGetter {
	static fetchAndParse() {
		return fetch(dictionaryUrl)
			.then((response) => response.json())
			.then((responseJSON) => Set(Object.keys(responseJSON)));
	}
}
