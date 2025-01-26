// script.js
const chessboard = document.getElementById('chessboard');
const captured1 = document.getElementById('captured1');
const captured2 = document.getElementById('captured2');
const toast = document.getElementById('toast');

const pieces = {
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔',
    'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚'
};

const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let board = JSON.parse(JSON.stringify(initialBoard));
let currentPlayer = 'white'; // white starts first

function createBoard() {
    chessboard.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square', (row + col) % 2 === 0 ? 'white' : 'black');
            square.dataset.row = row;
            square.dataset.col = col;
            const piece = board[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece');
                pieceElement.innerText = pieces[piece];
                pieceElement.draggable = true;
                pieceElement.dataset.row = row;
                pieceElement.dataset.col = col;
                pieceElement.dataset.piece = piece;
                pieceElement.addEventListener('dragstart', dragStart);
                square.appendChild(pieceElement);
            }
            square.addEventListener('dragover', dragOver);
            square.addEventListener('drop', drop);
            chessboard.appendChild(square);
        }
    }
}

let draggedPiece = null;

function dragStart(event) {
    if ((currentPlayer === 'white' && event.target.dataset.piece === event.target.dataset.piece.toUpperCase()) ||
        (currentPlayer === 'black' && event.target.dataset.piece === event.target.dataset.piece.toLowerCase())) {
        draggedPiece = event.target;
        setTimeout(() => {
            event.target.style.display = 'none';
        }, 0);
    } else {
        showToast('Opponent\'s turn!');
        event.preventDefault();
    }
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const targetSquare = event.target.classList.contains('square') ? event.target : event.target.parentElement;
    if (targetSquare.classList.contains('square') && isValidMove(draggedPiece, targetSquare)) {
        const fromRow = parseInt(draggedPiece.dataset.row);
        const fromCol = parseInt(draggedPiece.dataset.col);
        const toRow = parseInt(targetSquare.dataset.row);
        const toCol = parseInt(targetSquare.dataset.col);

        // Capture the piece if present
        if (targetSquare.firstChild) {
            const capturedPiece = targetSquare.firstChild;
            capturedPiece.classList.remove('piece');
            capturedPiece.classList.add('piece');
            if (capturedPiece.dataset.piece === capturedPiece.dataset.piece.toUpperCase()) {
                captured2.appendChild(capturedPiece);
            } else {
                captured1.appendChild(capturedPiece);
            }
        }

        // Move the piece in the board array
        board[toRow][toCol] = board[fromRow][fromCol];
        board[fromRow][fromCol] = '';

        // Update the piece's data attributes
        draggedPiece.dataset.row = toRow;
        draggedPiece.dataset.col = toCol;

        // Append the piece to the new square
        targetSquare.appendChild(draggedPiece);

        // Switch turns
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    } else {
        showToast('Invalid move!');
    }
    draggedPiece.style.display = 'flex';
    draggedPiece = null;
}

// Check if the move is valid according to chess rules
function isValidMove(piece, targetSquare) {
    const pieceType = piece.dataset.piece;
    const fromRow = parseInt(piece.dataset.row);
    const fromCol = parseInt(piece.dataset.col);
    const toRow = parseInt(targetSquare.dataset.row);
    const toCol = parseInt(targetSquare.dataset.col);

    switch (pieceType.toLowerCase()) {
        case 'p': return isValidPawnMove(pieceType, fromRow, fromCol, toRow, toCol);
        case 'r': return isValidRookMove(fromRow, fromCol, toRow, toCol);
        case 'n': return isValidKnightMove(fromRow, fromCol, toRow, toCol);
        case 'b': return isValidBishopMove(fromRow, fromCol, toRow, toCol);
        case 'q': return isValidQueenMove(fromRow, fromCol, toRow, toCol);
        case 'k': return isValidKingMove(fromRow, fromCol, toRow, toCol);
        default: return false;
    }
}

function isValidPawnMove(pieceType, fromRow, fromCol, toRow, toCol) {
    const direction = pieceType === 'P' ? -1 : 1;
    if (fromCol === toCol) {
        if (toRow === fromRow + direction && !board[toRow][toCol]) return true;
        if (toRow === fromRow + 2 * direction && !board[toRow][toCol] && !board[fromRow + direction][toCol] && (fromRow === 1 || fromRow === 6)) return true;
    } else if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && board[toRow][toCol]) {
        return true;
    }
    return false;
}

function isValidRookMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow === toRow || fromCol === toCol) {
        const rowIncrement = Math.sign(toRow - fromRow);
        const colIncrement = Math.sign(toCol - fromCol);
        let row = fromRow + rowIncrement;
        let col = fromCol + colIncrement;
        while (row !== toRow || col !== toCol) {
            if (board[row][col]) return false;
            row += rowIncrement;
            col += colIncrement;
        }
        return true;
    }
    return false;
}

function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    return (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) || (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2);
}

function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
        const rowIncrement = Math.sign(toRow - fromRow);
        const colIncrement = Math.sign(toCol - fromCol);
        let row = fromRow + rowIncrement;
        let col = fromCol + colIncrement;
        while (row !== toRow || col !== toCol) {
            if (board[row][col]) return false;
            row += rowIncrement;
            col += colIncrement;
        }
        return true;
    }
    return false;
}

function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    return isValidRookMove(fromRow, fromCol, toRow, toCol) || isValidBishopMove(fromRow, fromCol, toRow, toCol);
}

function isValidKingMove(fromRow, fromCol, toRow, toCol) {
    return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
}

function showToast(message) {
    toast.innerText = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

createBoard();