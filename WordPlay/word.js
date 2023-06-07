const randomNumber = Math.floor(Math.random() * 101);
const answerLength = 5;
const totalGuess = 6;
const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
async function init() {
    //initialisation
    let currentRow = 0;
    let guessWord = "";
    let done = false;
    let isLoading = true;

    //fetching word of the day using API
    const res = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
    const { word: wordRes } = await res.json();
    const word = wordRes.toUpperCase();
    const wordParts = word.split("");
    isLoading = false;
    setLoading(isLoading);

    //user adds a new letter to current guess
    function addLetter(letter) {
        if (guessWord.length == answerLength) {
            guessWord = guessWord.substring(0, guessWord.length - 1) + letter;
        } else {
            guessWord += letter;
        }
        letters[currentRow * answerLength + guessWord.length - 1].innerText = letter;
    }

    async function commit() {
        if (guessWord.length !== answerLength) {
            return;
        }
        //Checking the entered word (using API) is valid or not
        isLoading = true;
        setLoading(isLoading);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: guessWord })
        });

        const { validWord } = await res.json();
        isLoading = false;
        setLoading(isLoading);

        //if the guessed word is not valid then mark whole word as invalid
        if (!validWord) {
            markInvalidWord();
            return;
        }

        const guessParts = guessWord.split("");
        const map = makeMap(wordParts);
        let allRight = true;

        //first loop will find correct letters

        for (let i = 0; i < answerLength; i++) {
            if (guessParts[i] == wordParts[i]) {
                //mark as correct
                letters[currentRow * answerLength + i].classList.add("correct");
                map[guessParts[i]]--;
            }
        }

        //second loop will find close and wrong letters

        for (let i = 0; i < answerLength; i++) {
            if (guessParts[i] == wordParts[i]) {
                //do nothing
            } else if (map[guessParts[i]] > 0) {
                //mark as close
                letters[currentRow * answerLength + i].classList.add("close");
                map[guessParts[i]]--;
            } else {
                //input letter is wrong
                allRight = false;
                letters[currentRow * answerLength + i].classList.add("wrong");
            }
        }
        currentRow++;
        guessWord = "";
        if (allRight) {
            //win
            alert(`you have guessed correctly, the word is ${word}`);
            document.querySelector(".brand").classList.add("winner");
            done = true;
            setTimeout(() => {
                history.go()
            }, 3000);
        } else if (currentRow == totalGuess) {
            //lose
            alert(`you lose, the word was ${word}`);
            done = true;
            setTimeout(() => {
                history.go()
            }, 3000);
        }

    }


    function backspace() {
        guessWord = guessWord.substring(0, guessWord.length - 1);
        letters[currentRow * answerLength + guessWord.length].innerText = "";
    }

    function markInvalidWord() {
        for (let i = 0; i < answerLength; i++) {
            letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");
            setTimeout(
                () => letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid"),
                10
            );
        }
    }



    document.addEventListener("keydown", function hadleKeyPress(event) {
        const action = event.key;

        if (action == "Enter") {
            commit();
        } else if (action == "Backspace") {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase());
        } else {}
    });
}
//checking whether character is alphabet or not
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
    loadingDiv.classList.toggle("hidden", !isLoading)
}

function makeMap(array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        if (obj[array[i]]) {
            obj[array[i]]++;
        } else {
            obj[array[i]] = 1;
        }
    }
    return obj;
}
init();