// satranc.js - Tarihsel Satranç Motoru (Osmanlı vs Bizans)
// Dış kütüphane kullanılmadan, sıfırdan yazılmıştır.

let chessMode = 'pvp'; // 'pvp' veya 'pve'
let board = new Array(64).fill(null);
let currentTurn = 'w'; // 'w' (Osmanlı) veya 'b' (Bizans)
let selectedSquare = null;
let validMoves = [];
let gameOver = false;
let promotionMove = null;

// Unicode Taşlar (Klasik Siyah-Beyaz)
const piecesInfo = {
    'w': { colorText: 'Beyaz', icon: '♙', k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    'b': { colorText: 'Siyah', icon: '♟', k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
};

// Başlangıç Dizilimi
const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

function initChess(mode) {
    chessMode = mode || 'pvp';
    currentTurn = 'w';
    selectedSquare = null;
    validMoves = [];
    gameOver = false;
    document.getElementById('chess-restart').style.display = 'none';
    document.getElementById('chess-promotion').style.display = 'none';
    
    loadFen(initialFen);
    updateChessUI();
    renderBoard();
}

function loadFen(fen) {
    board.fill(null);
    let rows = fen.split('/');
    let idx = 0;
    for(let r = 0; r < 8; r++) {
        for(let c = 0; c < rows[r].length; c++) {
            let char = rows[r][c];
            if(!isNaN(char)) {
                idx += parseInt(char);
            } else {
                let color = (char === char.toLowerCase()) ? 'b' : 'w';
                board[idx] = { type: char.toLowerCase(), color: color };
                idx++;
            }
        }
    }
}

function renderBoard() {
    const container = document.getElementById('chess-board');
    container.innerHTML = '';
    
    for(let i = 0; i < 64; i++) {
        let row = Math.floor(i / 8);
        let col = i % 8;
        let isLight = (row + col) % 2 === 0;
        
        let sq = document.createElement('div');
        sq.className = `chess-square ${isLight ? 'light' : 'dark'}`;
        if(selectedSquare === i) sq.classList.add('selected');
        if(validMoves.includes(i)) sq.classList.add('valid-move');
        
        sq.onclick = () => onSquareClick(i);
        
        let piece = board[i];
        if(piece) {
            let pDiv = document.createElement('div');
            pDiv.className = 'chess-piece';
            pDiv.innerText = piecesInfo[piece.color][piece.type];
            // Klasik renk ayarı (Siyah ve Beyaz)
            pDiv.style.color = piece.color === 'w' ? '#ffffff' : '#000000';
            if(piece.color === 'w') pDiv.style.textShadow = "1px 1px 2px rgba(0,0,0,0.8)";
            sq.appendChild(pDiv);
        }
        
        container.appendChild(sq);
    }
}

function updateChessUI() {
    let statusText = `Sıra: ${piecesInfo[currentTurn].colorText}`;
    if(gameOver) statusText = "OYUN BİTTİ!";
    document.getElementById('chess-status').innerText = statusText;
    document.getElementById('chess-turn-icon').innerText = piecesInfo[currentTurn].icon;
}

function onSquareClick(index) {
    if(gameOver || (chessMode === 'pve' && currentTurn === 'b')) return;
    
    // Geçerli hamleye tıklandıysa
    if(validMoves.includes(index) && selectedSquare !== null) {
        let piece = board[selectedSquare];
        let row = Math.floor(index / 8);
        
        // Terfi kontrolü
        if(piece.type === 'p' && (row === 0 || row === 7)) {
            promotionMove = { from: selectedSquare, to: index };
            document.getElementById('chess-promotion').style.display = 'flex';
            return;
        }
        
        executeMove(selectedSquare, index, null);
        return;
    }
    
    // Kendi taşına tıklandıysa seç
    let piece = board[index];
    if(piece && piece.color === currentTurn) {
        selectedSquare = index;
        validMoves = getLegalMoves(index);
        renderBoard();
    } else {
        selectedSquare = null;
        validMoves = [];
        renderBoard();
    }
}

function promotePawn(newType) {
    document.getElementById('chess-promotion').style.display = 'none';
    if(promotionMove) {
        executeMove(promotionMove.from, promotionMove.to, newType);
        promotionMove = null;
    }
}

function executeMove(from, to, promoType) {
    // Hamleyi yap
    let piece = board[from];
    board[to] = promoType ? { type: promoType, color: piece.color } : piece;
    board[from] = null;
    
    selectedSquare = null;
    validMoves = [];
    currentTurn = currentTurn === 'w' ? 'b' : 'w';
    
    // Şah-Mat kontrolü
    let allLegalMoves = getAllLegalMoves(currentTurn);
    if(allLegalMoves.length === 0) {
        gameOver = true;
        document.getElementById('chess-restart').style.display = 'block';
        if(isCheck(currentTurn, board)) {
            let winner = currentTurn === 'w' ? 'Siyah' : 'Beyaz';
            alert(`ŞAH MAT! ${winner} kazandı.`);
            if(chessMode === 'pve' && winner === 'Beyaz') {
                if(typeof unlockBadge === 'function') unlockBadge('satranc_usta');
            }
        } else {
            alert("PAT! Oyun Berabere.");
        }
    }
    
    updateChessUI();
    renderBoard();
    
    // Yapay Zeka Hamlesi
    if(chessMode === 'pve' && currentTurn === 'b' && !gameOver) {
        setTimeout(makeAIMove, 500);
    }
}

// --- HAMLE KURALLARI VE MOTOR ---
const directions = {
    'n': [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
    'b': [[-1, -1], [-1, 1], [1, -1], [1, 1]],
    'r': [[-1, 0], [1, 0], [0, -1], [0, 1]],
    'q': [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]],
    'k': [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]
};

function getLegalMoves(index) {
    let rawMoves = getRawMoves(index, board);
    let legalMoves = [];
    let pieceColor = board[index].color;
    
    for(let to of rawMoves) {
        // Hamleyi simüle et
        let tempBoard = [...board];
        tempBoard[to] = tempBoard[index];
        tempBoard[index] = null;
        
        // Kendi şahı tehdit altında mı?
        if(!isCheck(pieceColor, tempBoard)) {
            legalMoves.push(to);
        }
    }
    return legalMoves;
}

function getAllLegalMoves(color) {
    let moves = [];
    for(let i = 0; i < 64; i++) {
        if(board[i] && board[i].color === color) {
            let legals = getLegalMoves(i);
            legals.forEach(to => moves.push({from: i, to: to}));
        }
    }
    return moves;
}

function getRawMoves(index, b) {
    let piece = b[index];
    if(!piece) return [];
    
    let moves = [];
    let row = Math.floor(index / 8);
    let col = index % 8;
    
    if(piece.type === 'p') {
        let dir = piece.color === 'w' ? -1 : 1;
        let startRow = piece.color === 'w' ? 6 : 1;
        
        // İleri 1 adım
        let forward1 = index + (dir * 8);
        if(b[forward1] === null) {
            moves.push(forward1);
            // İleri 2 adım
            let forward2 = index + (dir * 16);
            if(row === startRow && b[forward2] === null) {
                moves.push(forward2);
            }
        }
        
        // Çapraz yeme
        let cLeft = index + (dir * 8) - 1;
        let cRight = index + (dir * 8) + 1;
        if(col > 0 && b[cLeft] && b[cLeft].color !== piece.color) moves.push(cLeft);
        if(col < 7 && b[cRight] && b[cRight].color !== piece.color) moves.push(cRight);
        
    } else if(piece.type === 'n' || piece.type === 'k') {
        let dirs = directions[piece.type];
        for(let d of dirs) {
            let nr = row + d[0], nc = col + d[1];
            if(nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                let nIdx = nr * 8 + nc;
                if(b[nIdx] === null || b[nIdx].color !== piece.color) moves.push(nIdx);
            }
        }
    } else {
        // Kayar taşlar (K, F, V)
        let dirs = directions[piece.type];
        for(let d of dirs) {
            let nr = row + d[0], nc = col + d[1];
            while(nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                let nIdx = nr * 8 + nc;
                if(b[nIdx] === null) {
                    moves.push(nIdx);
                } else {
                    if(b[nIdx].color !== piece.color) moves.push(nIdx);
                    break;
                }
                nr += d[0]; nc += d[1];
            }
        }
    }
    return moves;
}

function isCheck(color, b) {
    let kingIdx = -1;
    for(let i = 0; i < 64; i++) {
        if(b[i] && b[i].type === 'k' && b[i].color === color) { kingIdx = i; break; }
    }
    let oppColor = color === 'w' ? 'b' : 'w';
    for(let i = 0; i < 64; i++) {
        if(b[i] && b[i].color === oppColor) {
            let oppMoves = getRawMoves(i, b);
            if(oppMoves.includes(kingIdx)) return true;
        }
    }
    return false;
}

// --- YAPAY ZEKA (MİNİMAX - PvE) ---
const pieceValues = { 'p': 10, 'n': 30, 'b': 30, 'r': 50, 'q': 90, 'k': 900 };

function evaluateBoard(b) {
    let score = 0;
    for(let i = 0; i < 64; i++) {
        if(b[i]) {
            let val = pieceValues[b[i].type];
            score += b[i].color === 'b' ? val : -val; // AI ('b') için pozitif
        }
    }
    return score;
}

function makeAIMove() {
    let bestScore = -Infinity;
    let bestMove = null;
    let moves = getAllLegalMoves('b');
    
    if(moves.length === 0) return;
    
    // Çok basit, rastgelelik katılmış 1 derinlikli arama (Öğrenciler için uygun)
    moves.sort(() => Math.random() - 0.5); 
    
    for(let m of moves) {
        let tempBoard = [...board];
        tempBoard[m.to] = tempBoard[m.from];
        tempBoard[m.from] = null;
        
        let score = evaluateBoard(tempBoard);
        if(score > bestScore) {
            bestScore = score;
            bestMove = m;
        }
    }
    
    if(bestMove) {
        let promo = null;
        let row = Math.floor(bestMove.to / 8);
        if(board[bestMove.from].type === 'p' && row === 7) promo = 'q';
        executeMove(bestMove.from, bestMove.to, promo);
    }
}
