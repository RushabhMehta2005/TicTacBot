document.addEventListener('DOMContentLoaded', function() {
    // MAINTAINED VARIABLE DECLARATIONS

    // Variables to write in the boxes and keep track of turn
    let playerChar = '';
    let AIChar = '';
    let currentTurn = '';
    const EMPTY = '';

    // Main variables 
    let boxes = document.querySelectorAll('.box');
    let board = [[EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY]];
    
    // Game start buttons
    let playX = document.getElementById('X');
    let playO = document.getElementById('O');

    // Game end message tags
    let msgContainer = document.querySelector('.msg-container');
    let msgText = document.getElementById('msg');
    let new_game = document.getElementById('new-btn');

    // DOM MANIPULATION AND INTEGRATION WITH GAME LOGIC

    /*  When playX is clicked: 
            user is X
            ai is O
            boxes become clickable
            We wait for user to make move
    */
    playX.addEventListener('click', function() {
        playerChar = 'X';
        AIChar = 'O';
        currentTurn = playerChar;
        enableBoxes();
    });

    /*  When playO is clicked: 
            user is O
            ai is X
            boxes become clickable
            ai makes move
    */
    playO.addEventListener('click', function() {
        playerChar = 'O';
        AIChar = 'X';
        currentTurn = AIChar;
        enableBoxes();
        makeAIMove();
    });

    /*  enableBoxes:
            Refreshes whole board 
            boxes become clickable
            playX and playO become unclickable 
    */ 
    function enableBoxes() {
        boxes.forEach(box => {
            box.textContent = '';
            box.disabled = false;
            box.addEventListener('click', playerMove);
        });
        playX.disabled = true;
        playO.disabled = true;
    }

    /*  disableBoxes:
            all boxes become unclickable
    */
    function disableBoxes() {
        boxes.forEach(box => {
            box.disabled = true;
            box.removeEventListener('click', playerMove);
        });
    }

    /*  playerMove:
            for a sequence of 2 moves: user move and then ai move
    */
    function playerMove(event) {
        // This line creates copy of boxes array and gives us the index of the box which was clicked
        let index = Array.from(boxes).indexOf(event.target);

        // We can find row and col (for 2D array board) from index of it in 1D array (copy of boxes)
        let row = Math.floor(index / 3);
        let col = index % 3;

        // Ideally this check would not be needed but yeah 
        if (board[row][col] === EMPTY) {
            board[row][col] = playerChar;
            event.target.innerHTML = playerChar;
            // We cannot click again until ai makes its move
            disableBoxes();

            // if game is not over then ai should make its move 
            if (!gameover()) {
                currentTurn = AIChar;
                // added delay for minimax to complete execution
                setTimeout(makeAIMove, 500);
            }
        }
    }


    function makeAIMove() {
        let action = minimax(board); // Minimax returns optimal move and thus ai always makes best move
        let row = action[0];
        let col = action[1];
        board[row][col] = AIChar;
        // we can find index using row and col
        let index = row * 3 + col;
        boxes[index].innerHTML = AIChar;

        // now player turn
        currentTurn = playerChar;

        // now we can make all boxes clickable again, IF they are empty
        for (let i = 0; i < boxes.length; i++) {
            if (boxes[i].innerHTML === EMPTY) {
                boxes[i].disabled = false;
                boxes[i].addEventListener('click', playerMove);
            }
        }

        // game over then game over
        if (gameover()) {
            return;
        }
    }

    // Returns true if game is over, else false
    function gameover() {
        let win = winner(board);
        if (win !== EMPTY) {
            // If AI won (user cannot actually win but kept this here for completion sake)
            showMsg(win === playerChar ? 'You win!' : 'You lose.\nTry again!'); // no idea why newline didnt work in js
            return true;
        } else if (terminal(board)) { // no winner but game still over => draw
            showMsg('Draw.\nTry again!');
            return true;
        }
        // game not over
        return false;
    }

    // func to show win/lose/draw message at end of game
    function showMsg(message) {
        msgText.textContent = message;
        msgContainer.classList.remove('hide');
        new_game.addEventListener('click', resetGame);
    }


    // If user clicks new game, we reset the board and disabled and un-disable the neccesary buttons
    function resetGame() {
        msgContainer.classList.add('hide');
        new_game.removeEventListener('click', resetGame);
        board = [[EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY]];
        currentTurn = '';
        playerChar = '';
        AIChar = '';
        for (let i = 0; i < boxes.length; i++) {
            boxes[i].innerHTML = EMPTY;
            boxes[i].disabled = true;
        }

        // user has to choose the character 
        playX.disabled = false;
        playO.disabled = false;
    }


    // PURE GAME AND ALGORITHMIC LOGIC

    function player(board) {
        // Returns whos turn is it to make a move

        // If game is over then any value
        if (terminal(board) === true) {
            return -1;
        }

        // We count number of X and O
        let num_x = 0;
        let num_o = 0;

        for (let i = 0; i < 3; i++) {
            num_x += count(board[i], "X");
            num_o += count(board[i], "O");
        }

        if (num_x == num_o) {
            return "X";
        }
        else {
            return "O";
        }
    }

    function actions(board) {
        // Returns 2D array of all possible moves that can be made from given board position

        // If game is over then any value
        if (terminal(board) == true) {
            return -1;
        }

        // If a box is empty, we can potentially make a move there
        // MOVE = [coords]
        let action_set = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === EMPTY) {
                    let move = [i, j];
                    action_set.push(move);
                }
            }
        }
        
        return action_set;
    }

    function result(board, action) {
        // Returns the board that results from making move [i, j] on the board.

        // We dont wanna modify original board
        let new_board = deepCopy(board);

        let i = action[0];
        let j = action[1];
        
        // Error, ideally could never happen
        if (new_board[i][j] !== EMPTY) {
            return null;
        }

        // Add the move to the board and return it
        let turn = player(new_board);
        new_board[i][j] = turn;
        return new_board;
    }

    function winner(board) {
        // Returns winner of the board, if there is one
        for (let i = 0; i < 3; i++) {
            // Rows
            if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][0] !== EMPTY) {
                return board[i][0];
            }
            // Columns
            if (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[0][i] !== EMPTY) {
                return board[0][i];
            }
        }
        // Diagonals
        if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== EMPTY) {
            return board[0][0];
        }
    
        if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[0][2] !== EMPTY) {
            return board[0][2];
        }

        return EMPTY;
    }

    function terminal(board) {
        // Returns true if game is over, false otherwise

        // If someone won then game over
        if (winner(board) !== "") {
            return true;
        }

        // If all boxes are filled then game is over
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === EMPTY) {
                    return false;
                }
            }
        }

        return true;
    }

    function utility(board) {
        // Returns 1 if X has won the game, -1 if O has won, 0 otherwise

        if (winner(board) === "X") {
            return 1;
        }
        else if (winner(board) === "O") {
            return -1;
        }
        else {
            return 0; // Draw
        }
    }
    

    function minimax(board) {
        // Returns the optimal action for the current player on the board


        // X wants value (utility) to be high => Maximising Player
        // O wants value (utility) to be low => Minimising Player

        // If game is over, there is no best move
        if (terminal(board)) {
            return null;
        }

        let turn = player(board); // Find whos turn it is at this game state
        let alpha = -Infinity; // Best value that X is assured currently
        let beta = Infinity;   // Best value that O is assured currently
        let best_move; // best move in [i, j] format
        let v; // current move value
        for (let action of actions(board)) {
            if (turn === "X") {// Maximising player
                // What is the guaranteed value that we can get from this action on given game state ? :
                // It accounts for the fact that O will choose a move thats worst for X 
                v = MIN_VALUE(result(board, action), alpha, beta);
                if (v === 1) { 
                    // 1 is the value of board evaluation (utility(board)) when X has won, thus this move is really good(best) as it confirms that X will win. 
                    return action;
                }
                if (v > alpha) { // we found a better move than before
                    // Updating alpha to a bigger value [Basically: alpha = Math.max(alpha, v) always]
                    alpha = v;
                    best_move = action; // updating value of best_move
                }
            }

            if (turn === "O") { // Minimising Player
                // What is the guaranteed value that we can get from this action on given game state ? :
                // It accounts for the fact that X will choose a move thats worst for O
                v = MAX_VALUE(result(board, action), alpha, beta);
                if (v === -1) {
                    // -1 is the value of utility(board) when O wins, thus this is best move for O
                    return action;
                }
                if (v < beta) { // Better move found
                    beta = v; // beta = Math.min(beta, v) always
                    best_move = action; // updating value of best_move
                }
            }
        }

        return best_move;
    }


    function MIN_VALUE(board, alpha, beta) {
        // Returns the board utility value which is BEST from O's perspective

        // If game over:
        if (terminal(board)) {
            return utility(board);
        }

        let v = Infinity; // Guaranteed best value till now

        for (let action of actions(board)) {
            // We want minimum value of v considering all possible actions 
            // Can this board get any lower value than the current state (v), considering X's actions (result of MAX_VALUE)
            v = Math.min(v, MAX_VALUE(result(board, action), alpha, beta));

            if (v <= alpha) {
                return v; // Pruning
            }

            beta = Math.min(beta, v);
        }

        return v;
    }

    function MAX_VALUE(board, alpha, beta) {
        // Returns the board utility value which is BEST from X's perspective

        // If game over:
        if (terminal(board)) {
            return utility(board);
        }

        let v = -Infinity; // Guaranteed best value till now

        for (let action of actions(board)) {
            // We want maximum value of v considering all possible actions 
            // Can this board get any bigger value than the current state (v), considering O's actions (result of MIN_VALUE)
            v = Math.max(v, MIN_VALUE(result(board, action), alpha, beta));

            if (v >= beta) {
                return v; // Pruning
            }

            alpha = Math.max(alpha, v);
        }

        return v;
    }

    // HELPER FUNCTIONS 

    // Count number of occurences of value in array 
    function count(array, value) {
        let n = 0;
        for (let i = 0; i < array.length; i++) {
            if(array[i] == value) {
                n += 1;
            }
        }
        return n;
    }
    

    // Returns deepcopy of multidimensional array
    function deepCopy(arr) {
        let copy = [];
        for (let i = 0; i < arr.length; i++) {
            if (Array.isArray(arr[i])) {
                // If the element is an array, recursively call deepCopy
                copy[i] = deepCopy(arr[i]);
            } else {
                // If the element is not an array, simply copy it
                copy[i] = arr[i];
            }
        }
        return copy;
    }

});