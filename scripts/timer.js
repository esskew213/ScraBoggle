class Timer {
	constructor(durationInput, startButton, restartButton, callbacks) {
		this.durationInput = durationInput;
		this.durationInput.value = 10;
		this.startButton = startButton;
		this.restartButton = restartButton;
		if (callbacks) {
			this.onStart = callbacks.onStart;
			this.onTick = callbacks.onTick;
			this.onComplete = callbacks.onComplete;
		}
		// binding an event listener in the constructor so that when the instance is created, it will already by listening for the click on "start"
		this.startButton.addEventListener('click', this.start);
		this.restartButton.addEventListener('click', this.restart);
	}

	start = () => {
		if (this.onStart) {
			this.onStart(this.timeRemaining);
		}
		this.tick();
		this.timerID = setInterval(this.tick, 100);
	};
	restart = () => {
		this.durationInput.value = 10;
		this.start();
	};
	tick = () => {
		if (this.timeRemaining <= 0) {
			if (this.onComplete) {
				this.onComplete();
			}
			this.pause();
		} else {
			if (this.onTick) {
				this.onTick(this.timeRemaining);
			}
			this.timeRemaining = this.timeRemaining - 0.1;
		}
	};
	get timeRemaining() {
		return parseFloat(this.durationInput.value);
	}
	set timeRemaining(time) {
		this.durationInput.value = time.toFixed(1);
	}
	pause = () => {
		clearInterval(this.timerID);
	};
}
