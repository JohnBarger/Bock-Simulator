function normalize(value) {
  return value.trim().toLowerCase();
}

export function startGame(gameId) {
  if (gameId === "red_dawn") {
    return { id: gameId, fleetsPlaced: [], expectedZones: ["north", "east", "reserve"] };
  }
  if (gameId === "signal_hunt") {
    return { id: gameId, hops: [], solution: ["relay-3", "ghost-array", "mirror-gate"] };
  }
  if (gameId === "world_theater") {
    return { id: gameId, posture: [], resolved: false };
  }
  if (gameId === "tic_tac_toe") {
    return { id: gameId, board: Array(9).fill(null), over: false };
  }
  if (gameId === "checkers") {
    return { id: gameId, board: createCheckersBoard(), over: false };
  }
  if (gameId === "chess") {
    return {
      id: gameId,
      board: createChessBoard(),
      over: false,
      chessMeta: createInitialChessMeta(),
    };
  }
  if (gameId === "poker") {
    const deck = createShuffledDeck();
    return { id: gameId, deck, hand: deck.splice(0, 5), held: [], over: false };
  }
  return null;
}

export function getGameIntro(gameId) {
  if (gameId === "red_dawn") {
    return [
      "RED DAWN EXERCISE :: Place patrol groups into NORTH, EAST, and RESERVE.",
      "Use `deploy <zone>` until all three stations are occupied.",
    ];
  }
  if (gameId === "signal_hunt") {
    return [
      "SIGNAL HUNT :: Trace the ghost packet chain.",
      "Use `trace relay-3`, `trace ghost-array`, and `trace mirror-gate` in the proper order.",
    ];
  }
  if (gameId === "world_theater") {
    return [
      "WORLD THEATER :: Set your strategic posture with `posture shield`, `posture feint`, or `posture strike`.",
      "After three posture choices, use `advance` to watch the conflict simulation unfold.",
    ];
  }
  if (gameId === "tic_tac_toe") {
    return [
      "TIC-TAC-TOE :: You are X. BOCK is O.",
      "Use `mark a1` through `mark c3` to claim a square. Type `board` to inspect the grid.",
      renderTicTacToeBoard(Array(9).fill(null)),
    ];
  }
  if (gameId === "checkers") {
    return [
      "CHECKERS :: You command red pieces from the lower ranks.",
      "Use `move b2 a3` style commands. Type `board` to inspect the field.",
      renderGridBoard(createCheckersBoard()),
    ];
  }
  if (gameId === "chess") {
    return [
      "CHESS :: You are white. BOCK is black.",
      "Use `move e2 e4`. Use `castle kingside` or `castle queenside` when legal.",
      "This simulation tracks core movement, captures, and castling.",
      renderGridBoard(createChessBoard()),
    ];
  }
  if (gameId === "poker") {
    const preview = startGame("poker");
    return [
      "POKER :: A solitary draw table under green lamp light.",
      "Use `hold 1 3 5` to keep cards, then `draw` to replace the others. Type `hand` to review your cards.",
      `HAND :: ${renderPokerHand(preview.hand)}`,
    ];
  }
  return ["Simulation unavailable."];
}

export function handleGameCommand(gameState, rawInput) {
  const input = normalize(rawInput);

  if (input === "exit" || input === "quit") {
    return { lines: ["Simulation suspended. Returning to BOCK shell."], complete: true, nextState: null, voiceLines: ["Simulation suspended. Returning to Bock shell."] };
  }
  if (gameState.id === "red_dawn") return handleRedDawn(gameState, input);
  if (gameState.id === "signal_hunt") return handleSignalHunt(gameState, input);
  if (gameState.id === "world_theater") return handleWorldTheater(gameState, input);
  if (gameState.id === "tic_tac_toe") return handleTicTacToe(gameState, input);
  if (gameState.id === "checkers") return handleCheckers(gameState, input);
  if (gameState.id === "chess") return handleChess(gameState, input);
  if (gameState.id === "poker") return handlePoker(gameState, input);

  return { lines: ["Simulation channel is not responding."], complete: false, nextState: gameState, voiceLines: ["Simulation channel is not responding."] };
}

function handleRedDawn(gameState, input) {
  if (!input.startsWith("deploy ")) return invalidGameInput(gameState, "Use `deploy north`, `deploy east`, or `deploy reserve`.");
  const zone = input.replace("deploy ", "").trim();
  if (!gameState.expectedZones.includes(zone)) return invalidGameInput(gameState, `Zone ${zone.toUpperCase()} does not exist in this exercise.`);
  if (gameState.fleetsPlaced.includes(zone)) return invalidGameInput(gameState, `Patrol group already assigned to ${zone.toUpperCase()}.`);

  const nextState = { ...gameState, fleetsPlaced: [...gameState.fleetsPlaced, zone] };
  if (nextState.fleetsPlaced.length === nextState.expectedZones.length) {
    return {
      lines: ["Fleet lattice complete. BOCK rates your deterrence screen as ACCEPTABLE.", "A theater clerk quietly stamps the board in red wax."],
      complete: true,
      nextState,
      voiceLines: ["Fleet lattice complete. Bock rates your deterrence screen as acceptable.", "A theater clerk quietly stamps the board in red wax."],
    };
  }

  return {
    lines: [`Patrol group committed to ${zone.toUpperCase()}.`, `${nextState.expectedZones.length - nextState.fleetsPlaced.length} sectors remain unfilled.`],
    complete: false,
    nextState,
    voiceLines: [`Patrol group committed to ${zone.toUpperCase()}.`],
  };
}

function handleSignalHunt(gameState, input) {
  if (!input.startsWith("trace ")) return invalidGameInput(gameState, "Use `trace <node>` to pursue the ghost signal.");
  const node = input.replace("trace ", "").trim();
  const expectedNode = gameState.solution[gameState.hops.length];

  if (node !== expectedNode) {
    return {
      lines: [`Signal integrity lost at ${node.toUpperCase()}.`, "The ghost packet folds back into static. Sequence reset."],
      complete: false,
      nextState: { ...gameState, hops: [] },
      voiceLines: [`Signal integrity lost at ${node.toUpperCase()}.`, "The ghost packet folds back into static. Sequence reset."],
    };
  }

  const hops = [...gameState.hops, node];
  const nextState = { ...gameState, hops };
  if (hops.length === gameState.solution.length) {
    return {
      lines: ["Ghost traffic resolved. The phantom burst was only BOCK talking to itself.", "It leaves behind a cold impression of applause from an empty operations room."],
      complete: true,
      nextState,
      voiceLines: ["Ghost traffic resolved. The phantom burst was only Bock talking to itself.", "It leaves behind a cold impression of applause from an empty operations room."],
    };
  }

  return {
    lines: [`${node.toUpperCase()} aligned.`, `Next vector window opened. ${gameState.solution.length - hops.length} hops remain.`],
    complete: false,
    nextState,
    voiceLines: [`${node.toUpperCase()} aligned.`, `Next vector window opened. ${gameState.solution.length - hops.length} hops remain.`],
  };
}

function handleWorldTheater(gameState, input) {
  if (input.startsWith("posture ")) {
    const stance = input.replace("posture ", "").trim();
    if (!["shield", "feint", "strike"].includes(stance)) return invalidGameInput(gameState, "Valid posture options: shield, feint, strike.");
    if (gameState.posture.length >= 3) return invalidGameInput(gameState, "Posture matrix full. Use `advance` to resolve the exercise.");
    return { lines: [`Posture ${stance.toUpperCase()} committed to the war room board.`], complete: false, nextState: { ...gameState, posture: [...gameState.posture, stance] }, voiceLines: [`Posture ${stance.toUpperCase()} committed to the war room board.`] };
  }

  if (input === "advance") {
    if (gameState.posture.length < 3) return invalidGameInput(gameState, "BOCK requires three posture selections before global simulation can advance.");
    const hasStrike = gameState.posture.includes("strike");
    const hasShield = gameState.posture.includes("shield");
    const ending = hasStrike && hasShield
      ? ["WORLD THEATER :: sirens climb across the hemisphere map in disciplined waves.", "Convoys vanish into coded weather. Capitals go dark by procedural order.", "The exercise concludes with no victors, only surviving paperwork."]
      : ["WORLD THEATER :: fleets circle under aurora light while diplomats chase delayed signals.", "A brittle peace holds because every side mistakes the other's fear for patience.", "BOCK closes the file and marks the century TEMPORARILY SPARED."];
    return { lines: ending, complete: true, nextState: { ...gameState, resolved: true }, voiceLines: ending.map((line) => line.replace(/\bBOCK\b/g, "Bock")) };
  }

  return invalidGameInput(gameState, "Use `posture <mode>` or `advance`. Type `exit` to leave the simulation.");
}

function handleTicTacToe(gameState, input) {
  if (input === "board") return { lines: [renderTicTacToeBoard(gameState.board)], complete: false, nextState: gameState, voiceLines: [] };
  if (!input.startsWith("mark ")) return invalidGameInput(gameState, "Use `mark a1` through `mark c3` to place a mark.");
  const cell = parseGridCell(input.replace("mark ", "").trim(), 3);
  if (cell === null) return invalidGameInput(gameState, "That square is outside the BOCK practice board.");
  if (gameState.board[cell]) return invalidGameInput(gameState, "That square is already occupied.");

  const board = [...gameState.board];
  board[cell] = "X";
  const winner = getTicTacToeWinner(board);
  if (winner || board.every(Boolean)) return finishTicTacToe(board, winner);
  const aiMove = pickTicTacToeMove(board);
  board[aiMove] = "O";
  return finishTicTacToe(board, getTicTacToeWinner(board), aiMove);
}

function finishTicTacToe(board, winner, aiMove = null) {
  const lines = [renderTicTacToeBoard(board)];
  const nextState = { id: "tic_tac_toe", board, over: Boolean(winner || board.every(Boolean)) };
  if (winner === "X") return { lines: [...lines, "You win. BOCK acknowledges a narrow tactical embarrassment."], complete: true, nextState, voiceLines: ["You win. Bock acknowledges a narrow tactical embarrassment."] };
  if (winner === "O") return { lines: [...lines, "BOCK completes the line and claims the board."], complete: true, nextState, voiceLines: ["Bock completes the line and claims the board."] };
  if (board.every(Boolean)) return { lines: [...lines, "Deadlock. Even BOCK respects a stubborn draw."], complete: true, nextState, voiceLines: ["Deadlock. Even Bock respects a stubborn draw."] };
  return { lines: [...lines, `BOCK marks ${formatGridCell(aiMove, 3)}.`], complete: false, nextState, voiceLines: [`Bock marks ${formatGridCell(aiMove, 3)}.`] };
}

function handleCheckers(gameState, input) {
  if (input === "board") return { lines: [renderGridBoard(gameState.board)], complete: false, nextState: gameState, voiceLines: [] };
  if (!input.startsWith("move ")) return invalidGameInput(gameState, "Use `move b2 a3` style commands.");
  const [, from, to] = input.split(/\s+/);
  const move = applyCheckersMove(gameState.board, from, to, "r");
  if (!move.valid) return invalidGameInput(gameState, move.message);

  let board = move.board;
  const lines = [renderGridBoard(board), `You advance from ${from.toUpperCase()} to ${to.toUpperCase()}.`];
  const voiceLines = [`You advance from ${from.toUpperCase()} to ${to.toUpperCase()}.`];
  if (countPieces(board, isBlackChecker) === 0) return { lines: [...lines, "The black ranks collapse. You win the exercise."], complete: true, nextState: { ...gameState, board, over: true }, voiceLines: [...voiceLines, "The black ranks collapse. You win the exercise."] };

  const aiMove = pickCheckersMove(board, "b");
  if (!aiMove) return { lines: [...lines, "BOCK has no legal move remaining. The board is yours."], complete: true, nextState: { ...gameState, board, over: true }, voiceLines: [...voiceLines, "Bock has no legal move remaining. The board is yours."] };

  board = aiMove.board;
  lines.push(`BOCK answers with ${aiMove.from.toUpperCase()} to ${aiMove.to.toUpperCase()}.`, renderGridBoard(board));
  voiceLines.push(`Bock answers with ${aiMove.from.toUpperCase()} to ${aiMove.to.toUpperCase()}.`);
  if (countPieces(board, isRedChecker) === 0) return { lines: [...lines, "Your red screen is swept clean. BOCK claims the board."], complete: true, nextState: { ...gameState, board, over: true }, voiceLines: [...voiceLines, "Your red screen is swept clean. Bock claims the board."] };
  return { lines, complete: false, nextState: { ...gameState, board }, voiceLines };
}

function handleChess(gameState, input) {
  if (input === "board") return { lines: [renderGridBoard(gameState.board)], complete: false, nextState: gameState, voiceLines: [] };
  let from;
  let to;
  let playerActionLabel = "";

  if (input.startsWith("move ")) {
    [, from, to] = input.split(/\s+/);
    playerActionLabel = `White moves ${from?.toUpperCase()} to ${to?.toUpperCase()}.`;
  } else if (input.startsWith("castle")) {
    const [, side = "kingside"] = input.split(/\s+/);
    if (!["kingside", "queenside"].includes(side)) {
      return invalidGameInput(gameState, "Use `castle kingside` or `castle queenside`.");
    }
    from = "e1";
    to = side === "kingside" ? "g1" : "c1";
    playerActionLabel = `White castles ${side.toUpperCase()}.`;
  } else {
    return invalidGameInput(gameState, "Use `move e2 e4`, `castle kingside`, or `castle queenside`.");
  }

  const move = applyChessMove(gameState.board, from, to, "w", gameState.chessMeta);
  if (!move.valid) return invalidGameInput(gameState, move.message);

  let board = move.board;
  let chessMeta = move.chessMeta ?? gameState.chessMeta;
  const lines = [renderGridBoard(board), playerActionLabel];
  const voiceLines = [playerActionLabel];
  if (!findKing(board, "b")) return { lines: [...lines, "Black king removed from the theater. BOCK concedes this simplified war game."], complete: true, nextState: { ...gameState, board, chessMeta, over: true }, voiceLines: [...voiceLines, "Black king removed from the theater. Bock concedes this simplified war game."] };

  const aiMove = pickChessMove(board, "b", chessMeta);
  if (!aiMove) return { lines: [...lines, "BOCK has no orderly reply. The board falls silent."], complete: true, nextState: { ...gameState, board, chessMeta, over: true }, voiceLines: [...voiceLines, "Bock has no orderly reply. The board falls silent."] };

  board = aiMove.board;
  chessMeta = aiMove.chessMeta ?? chessMeta;
  lines.push(`BOCK moves ${aiMove.from.toUpperCase()} to ${aiMove.to.toUpperCase()}.`, renderGridBoard(board));
  voiceLines.push(`Bock moves ${aiMove.from.toUpperCase()} to ${aiMove.to.toUpperCase()}.`);
  if (!findKing(board, "w")) return { lines: [...lines, "Your king is removed. BOCK files the result as a cold inevitability."], complete: true, nextState: { ...gameState, board, chessMeta, over: true }, voiceLines: [...voiceLines, "Your king is removed. Bock files the result as a cold inevitability."] };
  return { lines, complete: false, nextState: { ...gameState, board, chessMeta }, voiceLines };
}

function handlePoker(gameState, input) {
  if (input === "hand" || input === "board") return { lines: [`HAND :: ${renderPokerHand(gameState.hand)}`, renderHeldLine(gameState.held)], complete: false, nextState: gameState, voiceLines: [] };
  if (input === "deal") {
    const nextState = startGame("poker");
    return { lines: [`HAND :: ${renderPokerHand(nextState.hand)}`, renderHeldLine(nextState.held)], complete: false, nextState, voiceLines: ["Fresh hand dealt."] };
  }
  if (input.startsWith("hold ")) {
    const held = [...new Set(input.replace("hold ", "").trim().split(/\s+/).map((value) => Number(value) - 1).filter((value) => Number.isInteger(value) && value >= 0 && value < 5))];
    return { lines: [`HELD :: ${held.length ? held.map((value) => value + 1).join(", ") : "NONE"}`, renderHeldLine(held)], complete: false, nextState: { ...gameState, held }, voiceLines: ["Holding cards updated."] };
  }
  if (input === "draw") {
    const deck = [...gameState.deck];
    const hand = gameState.hand.map((card, index) => (gameState.held.includes(index) ? card : deck.shift()));
    const score = scorePokerHand(hand);
    return { lines: [`HAND :: ${renderPokerHand(hand)}`, `RESULT :: ${score}`, "Use `hold` to mark cards before the next `draw`, or `exit` to leave the table."], complete: false, nextState: { ...gameState, deck, hand, held: [] }, voiceLines: [`Result. ${score}.`] };
  }
  return invalidGameInput(gameState, "Use `hold`, `draw`, `hand`, or `deal` at the table.");
}

function invalidGameInput(gameState, message) {
  return { lines: [message], complete: false, nextState: gameState, voiceLines: [message.replace(/`/g, "")] };
}

function renderTicTacToeBoard(board) {
  const cells = board.map((value, index) => value ?? formatGridCell(index, 3).toUpperCase());
  return [`${cells[6]} | ${cells[7]} | ${cells[8]}`, "--+---+--", `${cells[3]} | ${cells[4]} | ${cells[5]}`, "--+---+--", `${cells[0]} | ${cells[1]} | ${cells[2]}`].join("\n");
}

function getTicTacToeWinner(board) {
  for (const [a, b, c] of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function pickTicTacToeMove(board) {
  const preferredMoveOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  let bestScore = -Infinity;
  let bestMove = null;

  for (const move of preferredMoveOrder) {
    if (board[move]) continue;
    const simulation = [...board];
    simulation[move] = "O";
    const score = scoreTicTacToePosition(simulation, false, 0);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function scoreTicTacToePosition(board, isAiTurn, depth) {
  const winner = getTicTacToeWinner(board);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (board.every(Boolean)) return 0;

  if (isAiTurn) {
    let best = -Infinity;
    for (let index = 0; index < board.length; index += 1) {
      if (board[index]) continue;
      const simulation = [...board];
      simulation[index] = "O";
      best = Math.max(best, scoreTicTacToePosition(simulation, false, depth + 1));
    }
    return best;
  }

  let best = Infinity;
  for (let index = 0; index < board.length; index += 1) {
    if (board[index]) continue;
    const simulation = [...board];
    simulation[index] = "X";
    best = Math.min(best, scoreTicTacToePosition(simulation, true, depth + 1));
  }
  return best;
}

function createCheckersBoard() {
  const board = Array.from({ length: 8 }, () => Array(8).fill("."));
  for (let row = 0; row < 3; row += 1) for (let col = 0; col < 8; col += 1) if ((row + col) % 2 === 1) board[row][col] = "r";
  for (let row = 5; row < 8; row += 1) for (let col = 0; col < 8; col += 1) if ((row + col) % 2 === 1) board[row][col] = "b";
  return board;
}

function isRedChecker(piece) { return piece === "r" || piece === "R"; }
function isBlackChecker(piece) { return piece === "b" || piece === "B"; }
function promoteChecker(piece, row) { if (piece === "r" && row === 7) return "R"; if (piece === "b" && row === 0) return "B"; return piece; }

function applyCheckersMove(board, fromCell, toCell, side) {
  const from = parseGridCell(fromCell, 8);
  const to = parseGridCell(toCell, 8);
  if (from === null || to === null) return { valid: false, message: "That move leaves the checkerboard." };
  const [fromRow, fromCol] = decodeCell(from, 8);
  const [toRow, toCol] = decodeCell(to, 8);
  const piece = board[fromRow][fromCol];
  if (piece === "." || (side === "r" ? !isRedChecker(piece) : !isBlackChecker(piece))) return { valid: false, message: "No controllable piece occupies that origin square." };
  if (board[toRow][toCol] !== ".") return { valid: false, message: "Destination square is already occupied." };

  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;
  const direction = side === "r" ? 1 : -1;
  const isKing = piece === piece.toUpperCase();
  const boardCopy = cloneBoard(board);

  if (Math.abs(colDiff) === 1 && (rowDiff === direction || (isKing && Math.abs(rowDiff) === 1))) {
    boardCopy[toRow][toCol] = promoteChecker(piece, toRow);
    boardCopy[fromRow][fromCol] = ".";
    return { valid: true, board: boardCopy };
  }
  if (Math.abs(colDiff) === 2 && (rowDiff === direction * 2 || (isKing && Math.abs(rowDiff) === 2))) {
    const jumpedRow = fromRow + rowDiff / 2;
    const jumpedCol = fromCol + colDiff / 2;
    const jumped = board[jumpedRow][jumpedCol];
    const enemy = side === "r" ? isBlackChecker(jumped) : isRedChecker(jumped);
    if (!enemy) return { valid: false, message: "There is nothing to capture on that line." };
    boardCopy[toRow][toCol] = promoteChecker(piece, toRow);
    boardCopy[fromRow][fromCol] = ".";
    boardCopy[jumpedRow][jumpedCol] = ".";
    return { valid: true, board: boardCopy };
  }
  return { valid: false, message: "Checkers pieces move diagonally by one, or capture by two." };
}

function pickCheckersMove(board, side) {
  const moves = getAllCheckersMoves(board, side);
  if (!moves.length) return null;

  let bestMove = null;
  let bestScore = -Infinity;
  for (const move of moves) {
    const score = scoreCheckersPosition(move.board, side === "r" ? "b" : "r", 3, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

function createChessBoard() {
  return [["R","N","B","Q","K","B","N","R"],["P","P","P","P","P","P","P","P"],[".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".","."],["p","p","p","p","p","p","p","p"],["r","n","b","q","k","b","n","r"]];
}

function createInitialChessMeta() {
  return {
    whiteKingMoved: false,
    blackKingMoved: false,
    whiteRookAMoved: false,
    whiteRookHMoved: false,
    blackRookAMoved: false,
    blackRookHMoved: false,
  };
}

function applyChessMove(board, fromCell, toCell, side, chessMeta = createInitialChessMeta()) {
  const from = parseGridCell(fromCell, 8);
  const to = parseGridCell(toCell, 8);
  if (from === null || to === null) return { valid: false, message: "That move leaves the chessboard." };
  const [fromRow, fromCol] = decodeCell(from, 8);
  const [toRow, toCol] = decodeCell(to, 8);
  const piece = board[fromRow][fromCol];
  if (piece === "." || (side === "w" ? piece !== piece.toLowerCase() : piece !== piece.toUpperCase())) return { valid: false, message: "No controlled piece stands on that square." };
  const target = board[toRow][toCol];
  if (target !== "." && sameSide(piece, target)) return { valid: false, message: "Your own line already occupies that square." };
  if (!isLegalChessMove(board, fromRow, fromCol, toRow, toCol, piece, chessMeta)) return { valid: false, message: "That piece cannot move along the requested line." };
  const boardCopy = cloneBoard(board);
  const nextMeta = { ...chessMeta };
  if (isCastlingMove(fromRow, fromCol, toRow, toCol, piece)) {
    applyCastlingMove(boardCopy, fromRow, toCol, piece);
  } else {
    boardCopy[toRow][toCol] = piece;
    boardCopy[fromRow][fromCol] = ".";
  }
  updateChessMetaForMove(nextMeta, piece, fromRow, fromCol);
  updateChessMetaForCapturedRook(nextMeta, target, toRow, toCol);
  if (!isCastlingMove(fromRow, fromCol, toRow, toCol, piece)) {
    if (piece === "p" && toRow === 0) boardCopy[toRow][toCol] = "q";
    if (piece === "P" && toRow === 7) boardCopy[toRow][toCol] = "Q";
  }
  return { valid: true, board: boardCopy, chessMeta: nextMeta };
}

function pickChessMove(board, side, chessMeta = createInitialChessMeta()) {
  const moves = getAllChessMoves(board, side, chessMeta);
  if (!moves.length) return null;

  let bestMove = null;
  let bestScore = -Infinity;
  for (const move of moves) {
    const score = scoreChessPosition(move.board, side === "w" ? "b" : "w", move.chessMeta, 2, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

function getAllCheckersMoves(board, side) {
  const moves = [];
  for (let row = 0; row < 8; row += 1) for (let col = 0; col < 8; col += 1) {
    const piece = board[row][col];
    if (piece === "." || (side === "r" ? !isRedChecker(piece) : !isBlackChecker(piece))) continue;
    const from = formatGridCell(encodeCell(row, col, 8), 8);
    for (const deltaCol of [-2, -1, 1, 2]) for (const deltaRow of [-2, -1, 1, 2]) {
      const targetRow = row + deltaRow;
      const targetCol = col + deltaCol;
      if (targetRow < 0 || targetRow > 7 || targetCol < 0 || targetCol > 7) continue;
      const to = formatGridCell(encodeCell(targetRow, targetCol, 8), 8);
      const applied = applyCheckersMove(board, from, to, side);
      if (applied.valid) {
        moves.push({ from, to, board: applied.board, capture: Math.abs(deltaRow) === 2 });
      }
    }
  }
  const captures = moves.filter((move) => move.capture);
  return captures.length ? captures : moves;
}

function scoreCheckersPosition(board, sideToMove, depth, alpha, beta) {
  const perspective = "b";
  const ownPieces = countPieces(board, sideToMove === "r" ? isRedChecker : isBlackChecker);
  const enemyPieces = countPieces(board, sideToMove === "r" ? isBlackChecker : isRedChecker);
  if (!ownPieces || !enemyPieces || depth === 0) {
    return evaluateCheckersBoard(board, perspective);
  }

  const moves = getAllCheckersMoves(board, sideToMove);
  if (!moves.length) {
    return evaluateCheckersBoard(board, perspective);
  }

  const maximizing = sideToMove === perspective;
  let best = maximizing ? -Infinity : Infinity;
  for (const move of moves) {
    const nextScore = scoreCheckersPosition(move.board, sideToMove === "r" ? "b" : "r", depth - 1, alpha, beta);
    if (maximizing) {
      best = Math.max(best, nextScore);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, nextScore);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }
  return best;
}

function evaluateCheckersBoard(board, perspective) {
  let score = 0;
  for (let row = 0; row < 8; row += 1) for (let col = 0; col < 8; col += 1) {
    const piece = board[row][col];
    if (piece === ".") continue;
    const isPerspectivePiece = perspective === "r" ? isRedChecker(piece) : isBlackChecker(piece);
    const value = piece === piece.toUpperCase() ? 1.75 : 1;
    const advancement = perspective === "r" ? row : 7 - row;
    const centrality = 3.5 - Math.abs(col - 3.5);
    const pieceScore = value + advancement * 0.08 + centrality * 0.04;
    score += isPerspectivePiece ? pieceScore : -pieceScore;
  }
  return score;
}

function getAllChessMoves(board, side, chessMeta = createInitialChessMeta()) {
  const moves = [];
  for (let fromRow = 0; fromRow < 8; fromRow += 1) for (let fromCol = 0; fromCol < 8; fromCol += 1) {
    const piece = board[fromRow][fromCol];
    if (piece === "." || (side === "w" ? piece !== piece.toLowerCase() : piece !== piece.toUpperCase())) continue;
    for (let toRow = 0; toRow < 8; toRow += 1) for (let toCol = 0; toCol < 8; toCol += 1) {
      const from = formatGridCell(encodeCell(fromRow, fromCol, 8), 8);
      const to = formatGridCell(encodeCell(toRow, toCol, 8), 8);
      const applied = applyChessMove(board, from, to, side, chessMeta);
      if (applied.valid) {
        const captureValue = pieceValue(board[toRow][toCol]);
        const castlingBonus = isCastlingMove(fromRow, fromCol, toRow, toCol, piece) ? 0.4 : 0;
        moves.push({
          from,
          to,
          board: applied.board,
          chessMeta: applied.chessMeta,
          immediateScore: captureValue + castlingBonus,
        });
      }
    }
  }
  return moves.sort((left, right) => right.immediateScore - left.immediateScore);
}

function scoreChessPosition(board, sideToMove, chessMeta, depth, alpha, beta) {
  if (!findKing(board, "w")) return 9999;
  if (!findKing(board, "b")) return -9999;
  if (depth === 0) return evaluateChessBoard(board, "b");

  const moves = getAllChessMoves(board, sideToMove, chessMeta);
  if (!moves.length) return evaluateChessBoard(board, "b");

  const maximizing = sideToMove === "b";
  let best = maximizing ? -Infinity : Infinity;
  for (const move of moves) {
    const score = scoreChessPosition(move.board, sideToMove === "w" ? "b" : "w", move.chessMeta, depth - 1, alpha, beta);
    if (maximizing) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }
  return best;
}

function evaluateChessBoard(board, perspective) {
  let score = 0;
  for (let row = 0; row < 8; row += 1) for (let col = 0; col < 8; col += 1) {
    const piece = board[row][col];
    if (piece === ".") continue;
    const isPerspectivePiece = perspective === "w" ? piece === piece.toLowerCase() : piece === piece.toUpperCase();
    const material = pieceValue(piece);
    const centrality = (3.5 - Math.abs(col - 3.5)) * 0.06 + (3.5 - Math.abs(row - 3.5)) * 0.04;
    const mobilityBias = piece.toLowerCase() === "p" ? 0 : 0.1;
    const pieceScore = material + centrality + mobilityBias;
    score += isPerspectivePiece ? pieceScore : -pieceScore;
  }
  return score;
}

function isLegalChessMove(board, fromRow, fromCol, toRow, toCol, piece, chessMeta) {
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;
  const absRow = Math.abs(rowDiff);
  const absCol = Math.abs(colDiff);
  const lower = piece.toLowerCase();
  const target = board[toRow][toCol];

  if (lower === "p") {
    const direction = piece === "p" ? -1 : 1;
    const startRow = piece === "p" ? 6 : 1;
    if (colDiff === 0 && target === ".") {
      if (rowDiff === direction) return true;
      if (fromRow === startRow && rowDiff === direction * 2) return board[fromRow + direction][fromCol] === ".";
    }
    return absCol === 1 && rowDiff === direction && target !== "." && !sameSide(piece, target);
  }
  if (lower === "n") return (absRow === 2 && absCol === 1) || (absRow === 1 && absCol === 2);
  if (lower === "b") return absRow === absCol && isPathClear(board, fromRow, fromCol, toRow, toCol);
  if (lower === "r") return (rowDiff === 0 || colDiff === 0) && isPathClear(board, fromRow, fromCol, toRow, toCol);
  if (lower === "q") return ((absRow === absCol) || rowDiff === 0 || colDiff === 0) && isPathClear(board, fromRow, fromCol, toRow, toCol);
  if (lower === "k") {
    if (absRow <= 1 && absCol <= 1) return true;
    return canCastle(board, fromRow, fromCol, toRow, toCol, piece, chessMeta);
  }
  return false;
}

function isCastlingMove(fromRow, fromCol, toRow, toCol, piece) {
  return piece.toLowerCase() === "k" && fromRow === toRow && Math.abs(toCol - fromCol) === 2;
}

function canCastle(board, fromRow, fromCol, toRow, toCol, piece, chessMeta) {
  if (!isCastlingMove(fromRow, fromCol, toRow, toCol, piece)) return false;
  const isWhite = piece === "k";
  const homeRow = isWhite ? 7 : 0;
  if (fromRow !== homeRow || fromCol !== 4) return false;
  if (isWhite && chessMeta.whiteKingMoved) return false;
  if (!isWhite && chessMeta.blackKingMoved) return false;

  const kingside = toCol === 6;
  const rookCol = kingside ? 7 : 0;
  const rook = board[homeRow][rookCol];
  const expectedRook = isWhite ? "r" : "R";
  if (rook !== expectedRook) return false;
  if (isWhite && kingside && chessMeta.whiteRookHMoved) return false;
  if (isWhite && !kingside && chessMeta.whiteRookAMoved) return false;
  if (!isWhite && kingside && chessMeta.blackRookHMoved) return false;
  if (!isWhite && !kingside && chessMeta.blackRookAMoved) return false;

  const pathCols = kingside ? [5, 6] : [1, 2, 3];
  return pathCols.every((col) => board[homeRow][col] === ".");
}

function applyCastlingMove(board, row, toCol, piece) {
  const kingside = toCol === 6;
  const rookFromCol = kingside ? 7 : 0;
  const rookToCol = kingside ? 5 : 3;
  board[row][toCol] = piece;
  board[row][4] = ".";
  board[row][rookToCol] = board[row][rookFromCol];
  board[row][rookFromCol] = ".";
}

function updateChessMetaForMove(chessMeta, piece, fromRow, fromCol) {
  if (piece === "k") chessMeta.whiteKingMoved = true;
  if (piece === "K") chessMeta.blackKingMoved = true;
  if (piece === "r" && fromRow === 7 && fromCol === 0) chessMeta.whiteRookAMoved = true;
  if (piece === "r" && fromRow === 7 && fromCol === 7) chessMeta.whiteRookHMoved = true;
  if (piece === "R" && fromRow === 0 && fromCol === 0) chessMeta.blackRookAMoved = true;
  if (piece === "R" && fromRow === 0 && fromCol === 7) chessMeta.blackRookHMoved = true;
}

function updateChessMetaForCapturedRook(chessMeta, capturedPiece, toRow, toCol) {
  if (capturedPiece === "r" && toRow === 7 && toCol === 0) chessMeta.whiteRookAMoved = true;
  if (capturedPiece === "r" && toRow === 7 && toCol === 7) chessMeta.whiteRookHMoved = true;
  if (capturedPiece === "R" && toRow === 0 && toCol === 0) chessMeta.blackRookAMoved = true;
  if (capturedPiece === "R" && toRow === 0 && toCol === 7) chessMeta.blackRookHMoved = true;
}

function isPathClear(board, fromRow, fromCol, toRow, toCol) {
  const rowStep = Math.sign(toRow - fromRow);
  const colStep = Math.sign(toCol - fromCol);
  let row = fromRow + rowStep;
  let col = fromCol + colStep;
  while (row !== toRow || col !== toCol) {
    if (board[row][col] !== ".") return false;
    row += rowStep;
    col += colStep;
  }
  return true;
}

function sameSide(left, right) {
  return (left === left.toLowerCase() && right === right.toLowerCase()) || (left === left.toUpperCase() && right === right.toUpperCase());
}

function findKing(board, side) {
  const king = side === "w" ? "k" : "K";
  return board.some((row) => row.includes(king));
}

function pieceValue(piece) {
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
  return values[piece?.toLowerCase?.()] ?? 0;
}

function createShuffledDeck() {
  const deck = [];
  for (const suit of ["S", "H", "D", "C"]) for (const rank of ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"]) deck.push(`${rank}${suit}`);
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = (index * 17 + 11) % (index + 1);
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
}

function renderPokerHand(hand) {
  return hand.map((card, index) => `[${index + 1}:${card}]`).join(" ");
}

function renderHeldLine(held) {
  return `HELD SLOTS :: ${held.length ? held.map((value) => value + 1).join(", ") : "NONE"}`;
}

function scorePokerHand(hand) {
  const ranks = hand.map((card) => card.slice(0, -1));
  const suits = hand.map((card) => card.slice(-1));
  const counts = Object.values(countBy(ranks)).sort((a, b) => b - a);
  const values = ranks.map(rankToValue).sort((a, b) => a - b);
  const flush = suits.every((suit) => suit === suits[0]);
  const straight = values.every((value, index) => index === 0 || value === values[index - 1] + 1);
  if (straight && flush) return "STRAIGHT FLUSH";
  if (counts[0] === 4) return "FOUR OF A KIND";
  if (counts[0] === 3 && counts[1] === 2) return "FULL HOUSE";
  if (flush) return "FLUSH";
  if (straight) return "STRAIGHT";
  if (counts[0] === 3) return "THREE OF A KIND";
  if (counts[0] === 2 && counts[1] === 2) return "TWO PAIR";
  if (counts[0] === 2) return "ONE PAIR";
  return "HIGH CARD";
}

function rankToValue(rank) {
  const table = { A: 14, K: 13, Q: 12, J: 11 };
  return table[rank] ?? Number(rank);
}

function countBy(values) {
  return values.reduce((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});
}

function renderGridBoard(board) {
  const rows = [];
  for (let row = 7; row >= 0; row -= 1) rows.push(`${row + 1} ${board[row].join(" ")}`);
  rows.push("  a b c d e f g h");
  return rows.join("\n");
}

function cloneBoard(board) { return board.map((row) => [...row]); }
function countPieces(board, predicate) { return board.flat().filter(predicate).length; }

function parseGridCell(cell, size) {
  if (!/^[a-z]\d+$/i.test(cell)) return null;
  const col = cell.charCodeAt(0) - 97;
  const row = Number(cell.slice(1)) - 1;
  if (col < 0 || col >= size || row < 0 || row >= size) return null;
  return encodeCell(row, col, size);
}

function formatGridCell(index, size) {
  const [row, col] = decodeCell(index, size);
  return `${String.fromCharCode(97 + col)}${row + 1}`;
}

function encodeCell(row, col, size) { return row * size + col; }
function decodeCell(index, size) { return [Math.floor(index / size), index % size]; }
