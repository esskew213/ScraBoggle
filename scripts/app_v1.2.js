const url = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json';
function getWordDictionary(dictionaryUrl) {
	fetch(dictionaryUrl).then((response) => response.json()).then((responseJSON) => {
		const dictionary = responseJSON;

		// selecting elements in the DOM
		const startButton = document.querySelector('#shuffle-button');
		const boggleGridContainer = document.querySelector('#boggle-container');
		const submitButton = document.querySelector('#submit-button');
		const guessedWordsDiv = document.querySelector('#guessed-words');
		const nowSpellingDiv = document.querySelector('#now-spelling');
		const totalScoreNum = document.querySelector('#total-score-number');
		const restartButton = document.querySelector('#restart-button');

		const durationInput = document.querySelector('#duration');
		const circle = document.querySelector('circle');
		const perimeter = circle.getAttribute('r') * 2 * Math.PI;
		circle.setAttribute('stroke-dasharray', perimeter);

		new Game(
			boggleGridContainer,
			startButton,
			restartButton,
			submitButton,
			guessedWordsDiv,
			nowSpellingDiv,
			totalScoreNum,
			4,
			dictionary
		);
		let duration;
		new Timer(durationInput, startButton, restartButton, {
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
				restartButton.style.visibility = 'visible';
			}
		});
	});
}
getWordDictionary(url);
