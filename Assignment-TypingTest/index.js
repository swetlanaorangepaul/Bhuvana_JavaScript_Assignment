
import {
    TOTALTIME,
    DEFAULT_ACCURACY,
    DEFAULT_ERROR_COUNT,
    DEFAULT_ACTUAL_CONTENT,
    DEFAULT_TYPED_CONTENT,
    RANDOM_PHRASE
} from './constants.js';

let game = null;
let typeTimeout = TOTALTIME;

let errorItem = document.getElementById('status-block-error');
let timeRemaingItem = document.getElementById('status-block-time');
let accuracyItem = document.getElementById('status-block-accuracy');
let actualData = document.getElementById("content-space");
let typedData = document.getElementById('typing-space');
let wpm = document.getElementById("status-block-wpm");
let cpm = document.getElementById('status-block-cpm');
let status = document.getElementById('status');
let restartDiv = document.getElementById('restart-div');
let restartbutton = document.getElementById('restart-button');


class Typer {
    gameStarted = false;
    errors = 0;
    error_current_sentence=0;
    timeRemaining = TOTALTIME;
    accuracy = 100;
    totalCharaters = 0;
    actualContent = new Content(DEFAULT_ACTUAL_CONTENT);
    typedContent = new Content(DEFAULT_TYPED_CONTENT);
    idTimerInterval = undefined;
    fullTypedContent = "";
    wordsPerMinute = 0;
    charsPerMinute = 0;

    constructor() {
        this.resetValues();
    }

    resetValues = () => {
        errorItem.innerText = DEFAULT_ERROR_COUNT;
        timeRemaingItem.innerText = (TOTALTIME / 1000) + "s";
        accuracyItem.innerText = DEFAULT_ACCURACY;
        actualData.innerText = DEFAULT_ACTUAL_CONTENT;
        typedData.innerText = DEFAULT_TYPED_CONTENT;

        this.gameStarted = false;
        this.errors = 0;
        this.error_current_sentence=0;
        this.timeRemaining = TOTALTIME;
        this.accuracy = 100;
        this.totalCharaters = 0;
        this.actualContent = new Content(DEFAULT_ACTUAL_CONTENT);
        this.typedContent = new Content(DEFAULT_TYPED_CONTENT);
        this.idTimerInterval = undefined;
        this.fullTypedContent = "";
        this.wordsPerMinute = 0;
        this.charsPerMinute = 0;
    }
    refreshStatusBlock() {

        let statusBlockHtml = `<div class="status-block">
                <span class="status-label" id="error-label">Errors</span>
                <div class="status-content" id="status-block-error">0</div>
            </div>
            <div class="status-block">
                <span class="status-label"  id="time-label">Time</span>
                <div class="status-content" id="status-block-time">${TOTALTIME / 1000}</div>
            </div>
            <div class="status-block">
                <span class="status-label" id="accuracy-label">%Accuracy</span>
                <div class="status-content" id="status-block-accuracy">100</div>
            </div>`;
        status.innerHTML = statusBlockHtml;
        errorItem = document.getElementById('status-block-error');
        timeRemaingItem = document.getElementById('status-block-time');
        accuracyItem = document.getElementById('status-block-accuracy');
        actualData = document.getElementById("content-space");
        typedData = document.getElementById('typing-space');
        status = document.getElementById('status');
        restartDiv.innerHTML = "";
    }
    startTimer(timeleftpasssed) {
        game.gameStarted = true;
        console.log("game.gameStarted " + game.gameStarted);
        let timeleft = timeleftpasssed;
        let idTimeout = setTimeout(function () {
            console.log("setTimeout this.gameStarted " + game.gameStarted);
            if (game.gameStarted) {
                clearInterval(game.idTimerInterval);
                typedData.setAttribute("disabled", "disabled");
                typedData.setAttribute("readonly", "readonly");

                timeRemaingItem.style.color = "#000000";
                typedData.style.backgroundColor = "#a9a9a9";
                game.gameStarted = false;
                game.totalCharaters += typedData.value.length;
                game.fullTypedContent += typedData.value;
                game.calculateAccuracy(game.totalCharaters);
                game.createWpmCpm();
                game.calculateSpeed(game.fullTypedContent);
            }
        }, timeleftpasssed + 2000);

        this.idTimerInterval = setInterval(function () {
            let timeLeftPercent = (timeleft / typeTimeout) * 100;
            timeRemaingItem.innerText = `${timeleft / 1000}s`;
            if (timeLeftPercent <= 40) {
                timeRemaingItem.style.color = "#ff0000";
            } else {
                timeRemaingItem.style.color = "#000000";
            }
            timeleft = timeleft - 1000;
        }, 1000);
    }
    startGame() {
        if (game.gameStarted == false) {
            typedData.removeAttribute("disabled");
            game.refreshStatusBlock();
            game.resetValues();
            typedData.removeAttribute("readonly");
            typedData.style.backgroundColor = "#f7eecc";
            timeRemaingItem.style.color = "#000000";

            game.actualContent.data = game.actualContent.getRandomSentence();
            typedData.value = "";
            actualData.innerText = "";
            game.actualContent.getStreamedContent();
            game.startTimer(TOTALTIME);

        }
    }
    loadContent() {
        let currentSentenceTotalChar = typedData.value.length;
        game.typedContent.data = typedData.value;

        if (game.actualContent.data.length == game.typedContent.data.length) {
            game.actualContent.getStreamedContent();
            game.errors += game.error_current_sentence;
            game.error_current_sentence=0;
            game.actualContent.data = game.actualContent.getRandomSentence();
            console.log(" next sentence loding..game.totalCharaters" + game.totalCharaters);
            game.totalCharaters += currentSentenceTotalChar;
            console.log("after ..game.totalCharaters + currentSentenceTotalChar" + game.totalCharaters);
            game.fullTypedContent += typedData.value + '~';
            actualData.innerText = "";
            typedData.value = "";
            game.actualContent.getStreamedContent();
            console.log("tottal character passed accuracy "+game.totalCharaters );
            game.calculateAccuracy(game.totalCharaters);
            console.log("fullTypedContent passed speed "+game.fullTypedContent );
            // game.calculateSpeed(game.fullTypedContent);
            console.log("Current Sentence" + game.actualContent.data);
        } else {
            actualData.innerText = "";
            game.actualContent.getStreamedContent();
            game.calculateAccuracy(game.totalCharaters + currentSentenceTotalChar);
        }
    }

    calculateAccuracy(totalChar) {
        if (totalChar === 0) totalChar = 1;
        let er = (((game.errors + game.error_current_sentence)  > 0) ? (game.errors + game.error_current_sentence) : 0);
        
        game.accuracy = Math.floor((((totalChar - er) / totalChar) * 100));
        accuracyItem.innerText = game.accuracy;

        console.log("***totalChar " + totalChar);
        console.log("game.errors " + game.errors);
        console.log("game.error_current_sentence " + game.error_current_sentence);
        console.log("total err " + er);
        console.log("game.accuracy " + game.accuracy);
    }
    calculateSpeed = (fullTypedContent) => {
        let words = fullTypedContent.split(' ');
        words = words.filter(wordtotrim => {
            return (wordtotrim.length > 0);
        })
        let newLineChar = words.filter((word, index) => {
            let wordsplit = word.split("~");
            if (wordsplit.length > 1 && wordsplit[1].length > 0) {
                return true;
            } else {
                return false;
            }
        });
        this.wordsPerMinute = words.length + newLineChar.length;
        this.charsPerMinute = fullTypedContent.length - newLineChar.length;
        console.log("fullTypedContent.length -newLineChar.length "  + (fullTypedContent.length-newLineChar.length))
        cpm.innerHTML = this.charsPerMinute;
        wpm.innerHTML = this.wordsPerMinute;
    }
    createWpmCpm = () => {
        let newdiv = document.createElement('div');
        newdiv.classList.add("status-block");
        newdiv.innerHTML = `<span class="status-label" id="cpm-label">cpm</span>
        <div class="status-content" id="status-block-cpm">100</div>`;
        status.insertBefore(newdiv, status.firstChild);
        cpm = document.getElementById("status-block-cpm");

        newdiv = document.createElement('div');
        newdiv.classList.add("status-block");
        newdiv.innerHTML = `<span class="status-label" id="wpm-label">wpm</span>
        <div class="status-content" id="status-block-wpm">100</div>`;
        status.insertBefore(newdiv, status.firstChild);
        wpm = document.getElementById("status-block-wpm");

        const button = document.createElement('button');
        button.classList.add("restart-button");
        button.textContent = "Restart";
        button.setAttribute("id", "restart-button");
        restartDiv.appendChild(button);
        restartbutton = document.getElementById('restart-button');
        restartbutton.addEventListener('click', game.startGame);
    }
}

class Content {
    constructor(defaultData) {
        this.data = defaultData;
    }

    getRandomSentence() {
        let randomSentence = "";
        let randomNumber = Math.floor(Math.random() * 10);
        return RANDOM_PHRASE[randomNumber];
    }

    getStreamedContent() {
        let error_current_sentence_local=0;
        let contentArr = [...this.data];
        let typedArr = [...(typedData.value)];
        // game.errors = 0;
        contentArr.forEach((eachChar, index) => {
            let charelement = eachChar;
            const spanElement = document.createElement('span');
            spanElement.innerText = charelement;
            if (typedArr.length == index) {
                spanElement.classList.add('current');
            }
            if (typedArr[index] == undefined) {
            } else if (charelement.toUpperCase() === typedArr[index].toUpperCase()) {
                spanElement.classList.add('correct');
            } else if (charelement.toUpperCase() !== typedArr[index].toUpperCase()) {
                if (charelement === ' ') { spanElement.classList.add('wrongbackground'); }
                else { spanElement.classList.add('wrong'); }
                // game.errors++;
                error_current_sentence_local++;
            }
            game.error_current_sentence = error_current_sentence_local;
            errorItem.innerText = game.errors + error_current_sentence_local;
            actualData.appendChild(spanElement);
        });
    }
}

function loadGame() {
    return new Typer();
}

game = loadGame();
typedData.addEventListener('click', game.startGame);
typedData.addEventListener('input', game.loadContent);




