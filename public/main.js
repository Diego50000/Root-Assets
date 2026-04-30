// ───── Game State ─────
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameOver = false;

// ───── Win Combinations ─────
const WIN_COMBOS = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal
  [2, 4, 6], // diagonal
];

// ───── Auth ─────
checkSession();

async function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  document.getElementById('message').textContent = data.error || '';
  if (data.ok) checkSession();
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  document.getElementById('message').textContent = data.error || '';
  if (data.ok) checkSession();
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('app-section').style.display = 'none';
}

async function checkSession() {
  const res = await fetch('/api/session');
  const data = await res.json();

  if (data.authenticated) {
    document.getElementById('email-display').textContent = data.email;
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
  }
}

// ───── Game ─────
function handleClick(index) {
  if (board[index] !== '') return;
  if (gameOver) return;

  board[index] = currentPlayer;
  renderBoard();

  if (checkWin(currentPlayer)) {
    document.getElementById('turn-indicator').textContent = `Player ${currentPlayer} wins! 🎉`;
    gameOver = true;
    return;
  }

  if (checkDraw()) {
    document.getElementById('turn-indicator').textContent = "It's a draw! 🤝";
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  document.getElementById('turn-indicator').textContent = `Player ${currentPlayer}'s turn`;
}

function checkWin(player) {
  return WIN_COMBOS.some(combo => {
    return combo.every(index => board[index] === player);
  });
}

function checkDraw() {
  return board.every(cell => cell !== '');
}

function renderBoard() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, i) => {
    cell.textContent = board[i];
  });
}

function resetGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameOver = false;
  renderBoard();
  document.getElementById('turn-indicator').textContent = "Player X's turn";
}