## sei-35-scraboggle

Here's my version of Zynga's Boggle With Friends, coded entirely with HTML, CSS and JavaScript.

---

### Gameplay Instructions

The game is very much like Boggle, except that words are scored as the sum of the scores of their component letters, rather than on their length. The objective is to find as many valid words (longer than three letters) as possible before the time runs out. Click on a tile and drag your cursor across the adjacent letters to spell a word. You can also unselect tiles you've already selected, simply by mousing back over them.

Toggle between **single-player** and **multiplayer** at the top-right corner of the game.

In **single-player** mode, players have the option to set the game duration by directly editing the input to the timer. Otherwise, the default duration is set to 30 seconds. The player's high score is tracked for as long as they are in single-player mode; it resets if one changes to multiplayer mode.

In **multiplayer** mode, players play the same board consecutively to see who can obtain the higher score.

---

### Approach Taken
I took an object-oriented approach to modelling gameplay, creating a class of `BoggleGame` in which I created instances of the game's main components, e.g. the `BoggleBoard`, `Timer`, `Scorer` etc.
`BoggleBoard`'s constructor in turn instantiates 16 `Tile`s to populate the `boggleGridContainer`. When `BoggleBoard`'s `reset()` method is called, the 16 `boggleDice` are shuffled and the resultant letters are assigned to the tiles using the `setLetter` method in the `Tile` class.

The three most interesting methods are arguably used in `BoggleBoard` to determine which tiles should be enabled and which should be disabled with each consecutive tile selection by the user:
* `getNeighbours` creates a set of the tile's valid neighbouring tiles
* `setBoardStateFromTile`, as its name implies, updates the board by disabling and enabling the correct tiles depending on whether the tile is a valid neighbour and if it has been previously selected
* `addLetterToWord` keeps track of the letters in the word being spelt by adding (or removing) tiles from `currentTilesHolder`; it also calls `setBoardStateFromTile` to update the board accordingly.

To check for the validity of words in the `Scorer`, I fetched [this list of over 400k English words](https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json). It's far from perfect for this game — a Scrabble dictionary would have been optimal — but I'm nonetheless very grateful that such a source even exists.

---

#### Possible Future Work

The code could definitely be refactored, starting with passing in proper callbacks to the relevant classes instead of passing in the entire instance of `BoggleGame`.

I would also have liked to try using a graph to model the connections between tiles on the board.

Last but not least, the game could be enhanced with "power ups" like a "time freeze" or hints that suggest a word if the user is stuck. For the latter, I would have to code a solver to find all possible words for each new game!
