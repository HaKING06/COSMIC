// ============================================================================
// COSMIC UNIVERSE v11.0 — TypeScript Puzzle & Cipher Core Engine
// Strict ES2020 logic engines, handcrafted levels, deterministic solvers &
// validators compiled to js/ts_compiled/puzzleEngine.js (window.CosmicPuzzleCore).
// ============================================================================

interface Window {
    CosmicPuzzleCore?: CosmicPuzzleCoreAPI;
}

declare const module: { exports?: unknown } | undefined;

type Direction = 'N' | 'E' | 'S' | 'W';

interface Coord {
    r: number;
    c: number;
}

// ----------------------------------------------------------------------------
// 1. Quantum Sokoban Types
// ----------------------------------------------------------------------------
interface SokobanLevelDef {
    id: number;
    name: string;
    par: number;
    storyTarget?: boolean;
    map: string[];
}

interface SokobanSnapshot {
    player: Coord;
    boxes: Coord[];
    moves: number;
    pushes: number;
}

interface SokobanState {
    levelIndex: number;
    name: string;
    rows: number;
    cols: number;
    par: number;
    walls: boolean[][];
    targets: boolean[][];
    player: Coord;
    boxes: Coord[];
    moves: number;
    pushes: number;
    lastDir: Direction;
    undoStack: SokobanSnapshot[];
}

interface SokobanMoveResult {
    moved: boolean;
    pushed: boolean;
    won: boolean;
    deadlocked: boolean;
}

// ----------------------------------------------------------------------------
// 2. Laser Mirror Grid Types
// ----------------------------------------------------------------------------
type LaserCellType = 'empty' | 'wall' | 'emitter' | 'receiver' | 'mirror' | 'splitter';
type MirrorOrient = '/' | '\\';

interface LaserItemDef {
    r: number;
    c: number;
    type: LaserCellType;
    dir?: Direction;
    init?: MirrorOrient;
    sol?: MirrorOrient;
}

interface LaserLevelDef {
    id: number;
    name: string;
    rows: number;
    cols: number;
    par: number;
    items: LaserItemDef[];
}

interface LaserCell {
    type: LaserCellType;
    dir?: Direction;
    orient?: MirrorOrient;
    sol?: MirrorOrient;
}

interface LaserSegment {
    r1: number;
    c1: number;
    r2: number;
    c2: number;
}

interface LaserTraceResult {
    segments: LaserSegment[];
    litReceivers: string[];
    totalReceivers: number;
    solved: boolean;
}

interface LaserState {
    levelIndex: number;
    name: string;
    rows: number;
    cols: number;
    par: number;
    moves: number;
    grid: LaserCell[][];
    undoStack: Array<{ r: number; c: number; moves: number }>;
}

// ----------------------------------------------------------------------------
// 3. Circuit Pipe Link Types
// ----------------------------------------------------------------------------
type PipeKind = '.' | '#' | 'S' | 'G' | 'I' | 'L' | 'T' | 'X';

interface PipeCell {
    kind: PipeKind;
    rot: number;
    solvedRot: number;
    ports?: Direction[];
}

interface PipeLevelDef {
    id: number;
    name: string;
    bonusSec: number;
    par: number;
    storyTarget?: boolean;
    spec: string[][];
}

interface PipeEvalResult {
    powered: string[];
    litGates: number;
    totalGates: number;
    solved: boolean;
}

interface PipeState {
    levelIndex: number;
    name: string;
    rows: number;
    cols: number;
    bonusSec: number;
    par: number;
    moves: number;
    grid: PipeCell[][];
    undoStack: Array<{ r: number; c: number; prevRot: number; moves: number }>;
}

// ----------------------------------------------------------------------------
// 4. Quantum 2048 Types
// ----------------------------------------------------------------------------
interface ElementMeta {
    value: number;
    symbol: string;
    name: string;
    color: string;
    glow: string;
}

interface Board2048Snapshot {
    board: number[][];
    score: number;
    moves: number;
}

interface Board2048State {
    board: number[][];
    score: number;
    bestScore: number;
    moves: number;
    wonReached: boolean;
    prevSnapshot: Board2048Snapshot | null;
    rngState: number;
}

interface Move2048Result {
    moved: boolean;
    scoreGain: number;
    mergedCells: Coord[];
    spawnedCell: Coord | null;
    wonNow: boolean;
    isGameOver: boolean;
}

// ----------------------------------------------------------------------------
// 5. Nebula Minesweeper Types
// ----------------------------------------------------------------------------
interface MineLevelDef {
    id: number;
    name: string;
    rows: number;
    cols: number;
    mines: number;
}

interface MineCell {
    mine: boolean;
    revealed: boolean;
    flagged: boolean;
    adj: number;
}

interface MinesweeperState {
    levelIndex: number;
    name: string;
    rows: number;
    cols: number;
    mineCount: number;
    minesPlaced: boolean;
    revealedSafeCount: number;
    flagsPlaced: number;
    moves: number;
    hitMine: Coord | null;
    won: boolean;
    lost: boolean;
    grid: MineCell[][];
}

interface MineRevealResult {
    changed: boolean;
    exploded: boolean;
    won: boolean;
    newlyRevealed: Coord[];
}

// ----------------------------------------------------------------------------
// 6. Match-3 Isotope Core Types
// ----------------------------------------------------------------------------
type GemSpecial = 'none' | 'nova_row';

interface GemTile {
    kind: number;
    special: GemSpecial;
    uid: number;
}

interface Match3LevelDef {
    id: number;
    name: string;
    typesCount: number;
    targetScore: number;
    maxMoves: number;
}

interface Match3State {
    levelIndex: number;
    name: string;
    size: number;
    typesCount: number;
    targetScore: number;
    maxMoves: number;
    movesLeft: number;
    movesUsed: number;
    score: number;
    combo: number;
    nextUid: number;
    rngState: number;
    grid: Array<Array<GemTile | null>>;
}

interface Match3SwapResult {
    valid: boolean;
    won: boolean;
}

interface Match3StepResult {
    hadMatches: boolean;
    cleared: Array<{ r: number; c: number; kind: number; special: GemSpecial }>;
    novaRows: number[];
    purgedKinds: number[];
    spawnedNova: Coord[];
    scoreGain: number;
    combo: number;
    shuffled: boolean;
}

// ----------------------------------------------------------------------------
// 7. Lights Out Array Types
// ----------------------------------------------------------------------------
interface LightsOutLevelDef {
    id: number;
    name: string;
    size: number;
    par: number;
    seedMoves: Coord[];
}

interface LightsOutState {
    levelIndex: number;
    name: string;
    size: number;
    par: number;
    moves: number;
    grid: boolean[][];
    undoStack: Array<{ r: number; c: number; moves: number }>;
}

// ----------------------------------------------------------------------------
// 8. Memory Star Matrix Types
// ----------------------------------------------------------------------------
interface MemoryLevelDef {
    id: number;
    name: string;
    rows: number;
    cols: number;
    parMoves: number;
}

interface MemoryCard {
    id: number;
    spriteKey: string;
    revealed: boolean;
    matched: boolean;
}

interface MemoryState {
    levelIndex: number;
    name: string;
    rows: number;
    cols: number;
    parMoves: number;
    moves: number;
    streak: number;
    bestStreak: number;
    score: number;
    matchedPairs: number;
    totalPairs: number;
    firstPick: number | null;
    secondPick: number | null;
    mismatchPending: boolean;
    cards: MemoryCard[];
}

interface MemoryPickResult {
    accepted: boolean;
    matched: boolean;
    mismatch: boolean;
    won: boolean;
    scoreGain: number;
}

// ----------------------------------------------------------------------------
// 9. Nonogram Star Map Types
// ----------------------------------------------------------------------------
type NonogramMark = 0 | 1 | 2; // 0 empty, 1 filled, 2 cross X

interface NonogramLevelDef {
    id: number;
    name: string;
    rows: number;
    cols: number;
    bitmap: number[][];
}

interface NonogramClueStatus {
    rowDone: boolean[];
    colDone: boolean[];
    rowGroupDone: boolean[][];
    colGroupDone: boolean[][];
}

interface NonogramState {
    levelIndex: number;
    name: string;
    rows: number;
    cols: number;
    solution: number[][];
    board: NonogramMark[][];
    rowClues: number[][];
    colClues: number[][];
    moves: number;
    undoStack: Array<{ r: number; c: number; prev: NonogramMark; moves: number; autoCrossed?: Coord[] }>;
}

// ----------------------------------------------------------------------------
// 10. Hanoi Warp Cores Types
// ----------------------------------------------------------------------------
interface HanoiLevelDef {
    id: number;
    name: string;
    disks: number;
    optimal: number;
}

interface HanoiState {
    levelIndex: number;
    name: string;
    disks: number;
    optimal: number;
    moves: number;
    pegs: [number[], number[], number[]];
    undoStack: Array<{ from: number; to: number; moves: number }>;
}

// ----------------------------------------------------------------------------
// 11. WASM Cellular Containment Types
// ----------------------------------------------------------------------------
type CellularCell = 0 | 1 | 2 | 3; // 0 empty, 1 infected, 2 bulkhead wall, 3 cyan firewall

interface CellularLevelDef {
    id: number;
    name: string;
    wallsPerTurn: number;
    parTurns: number;
    grid: string[];
}

interface CellularMetrics {
    infectedCount: number;
    walkableCount: number;
    firewallCount: number;
    lossRatio: number;
    reachableEmpty: number;
    won: boolean;
    lost: boolean;
}

interface CellularState {
    levelIndex: number;
    name: string;
    rows: number;
    cols: number;
    wallsPerTurn: number;
    parTurns: number;
    turn: number;
    wallsPlacedThisTurn: number;
    grid: CellularCell[][];
    turnWallStack: Coord[];
}

// ----------------------------------------------------------------------------
// 12. Orbital Sudoku Mini Types (6x6, 2x3 boxes)
// ----------------------------------------------------------------------------
interface SudokuLevelDef {
    id: number;
    name: string;
    difficulty: string;
    puzzle: number[];
    solution: number[];
}

interface SudokuState {
    levelIndex: number;
    name: string;
    difficulty: string;
    given: boolean[];
    board: number[];
    solution: number[];
    moves: number;
    undoStack: Array<{ idx: number; prev: number; moves: number }>;
}

// ----------------------------------------------------------------------------
// Public API Interface
// ----------------------------------------------------------------------------
interface CosmicPuzzleCoreAPI {
    version: string;
    computeStars(moves: number, par: number): 1 | 2 | 3;
    // 1. Sokoban
    SOKOBAN_LEVELS: SokobanLevelDef[];
    createSokobanState(levelIndex: number): SokobanState;
    stepSokoban(state: SokobanState, dr: number, dc: number): SokobanMoveResult;
    undoSokoban(state: SokobanState): boolean;
    isSokobanWon(state: SokobanState): boolean;
    detectSokobanDeadlock(state: SokobanState): boolean;
    solveSokobanHint(state: SokobanState, maxStates?: number): Direction | null;
    verifySokobanLevel(levelIndex: number): { valid: boolean; optimalMoves: number; boxCount: number; targetCount: number };
    // 2. Laser Mirror Grid
    LASER_LEVELS: LaserLevelDef[];
    createLaserState(levelIndex: number): LaserState;
    toggleLaserCell(state: LaserState, r: number, c: number): boolean;
    undoLaser(state: LaserState): boolean;
    traceLasers(rows: number, cols: number, grid: LaserCell[][]): LaserTraceResult;
    getLaserHint(state: LaserState): Coord | null;
    // 3. Circuit Pipe Link
    PIPE_LEVELS: PipeLevelDef[];
    getPipePorts(cell: PipeCell): Direction[];
    createPipeState(levelIndex: number): PipeState;
    rotatePipeCell(state: PipeState, r: number, c: number): boolean;
    undoPipe(state: PipeState): boolean;
    evalPipeFlow(rows: number, cols: number, grid: PipeCell[][]): PipeEvalResult;
    getPipeHint(state: PipeState): Coord | null;
    // 4. Quantum 2048
    ELEMENTS_2048: Record<number, ElementMeta>;
    create2048State(seed?: number, bestScore?: number): Board2048State;
    slide2048(state: Board2048State, dir: Direction): Move2048Result;
    undo2048(state: Board2048State): boolean;
    has2048Moves(board: number[][]): boolean;
    // 5. Nebula Minesweeper
    MINE_LEVELS: MineLevelDef[];
    createMinesweeperState(levelIndex: number, seed?: number): MinesweeperState;
    revealMineCell(state: MinesweeperState, r: number, c: number, seed?: number): MineRevealResult;
    toggleMineFlag(state: MinesweeperState, r: number, c: number): boolean;
    chordMineCell(state: MinesweeperState, r: number, c: number): MineRevealResult;
    getMineHint(state: MinesweeperState): Coord | null;
    // 6. Match-3 Isotope Core
    MATCH3_LEVELS: Match3LevelDef[];
    MATCH3_SPRITE_KEYS: string[];
    createMatch3State(levelIndex: number, seed?: number): Match3State;
    findValidMatch3Move(grid: Array<Array<GemTile | null>>): { a: Coord; b: Coord } | null;
    tryMatch3Swap(state: Match3State, a: Coord, b: Coord): Match3SwapResult;
    resolveMatch3CascadeStep(state: Match3State, preferredNova?: Coord): Match3StepResult;
    shuffleMatch3Board(state: Match3State): void;
    // 7. Lights Out Array
    LIGHTS_OUT_LEVELS: LightsOutLevelDef[];
    createLightsOutState(levelIndex: number): LightsOutState;
    toggleLightsOut(state: LightsOutState, r: number, c: number): boolean;
    undoLightsOut(state: LightsOutState): boolean;
    isLightsOutSolved(state: LightsOutState): boolean;
    solveLightsOutGF2(grid: boolean[][]): Coord[];
    // 8. Memory Star Matrix
    MEMORY_LEVELS: MemoryLevelDef[];
    MEMORY_SPRITE_KEYS: string[];
    createMemoryState(levelIndex: number, seed?: number): MemoryState;
    pickMemoryCard(state: MemoryState, idx: number): MemoryPickResult;
    resolveMemoryMismatch(state: MemoryState): void;
    // 9. Nonogram Star Map
    NONOGRAM_LEVELS: NonogramLevelDef[];
    computeLineClues(line: number[]): number[];
    createNonogramState(levelIndex: number): NonogramState;
    setNonogramCell(state: NonogramState, r: number, c: number, mark: NonogramMark): boolean;
    undoNonogram(state: NonogramState): boolean;
    getNonogramClueStatus(state: NonogramState): NonogramClueStatus;
    isNonogramSolved(state: NonogramState): boolean;
    getNonogramHint(state: NonogramState): Coord | null;
    verifyNonogramUnique(levelIndex: number): { solutions: number; lineSolvable: boolean };
    // 10. Hanoi Warp Cores
    HANOI_LEVELS: HanoiLevelDef[];
    createHanoiState(levelIndex: number): HanoiState;
    moveHanoiDisk(state: HanoiState, fromPeg: number, toPeg: number): boolean;
    undoHanoi(state: HanoiState): boolean;
    isHanoiWon(state: HanoiState): boolean;
    getHanoiOptimalHint(state: HanoiState): { from: number; to: number } | null;
    // 11. WASM Cellular Containment
    CELLULAR_LEVELS: CellularLevelDef[];
    createCellularState(levelIndex: number): CellularState;
    placeCellularFirewall(state: CellularState, r: number, c: number): boolean;
    undoCellularFirewall(state: CellularState): boolean;
    computeCellularMetrics(state: CellularState): CellularMetrics;
    stepCellularFallback(flatGrid: Uint8Array, rows: number, cols: number): Uint8Array;
    applyCellularStepResult(state: CellularState, steppedFlat: Uint8Array): CellularMetrics;
    // 12. Orbital Sudoku Mini
    SUDOKU_LEVELS: SudokuLevelDef[];
    createSudokuState(levelIndex: number): SudokuState;
    setSudokuCell(state: SudokuState, r: number, c: number, val: number): boolean;
    undoSudoku(state: SudokuState): boolean;
    getSudokuConflicts(board: number[]): boolean[];
    isSudokuWon(state: SudokuState): boolean;
    getSudokuHint(state: SudokuState): { r: number; c: number; val: number } | null;
    countSudokuSolutions(board: number[], limit?: number): number;
}

(function (root: typeof globalThis) {
    'use strict';

    function clampLevelIndex(idx: number, len: number): number {
        if (!Number.isFinite(idx)) return 0;
        const n = Math.floor(idx);
        return Math.max(0, Math.min(len - 1, n));
    }

    function nextRand(state: number): { val: number; next: number } {
        let t = (state + 0x6D2B79F5) | 0;
        const next = t;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        const val = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        return { val, next };
    }

    function computeStars(moves: number, par: number): 1 | 2 | 3 {
        if (moves <= par) return 3;
        if (moves <= Math.ceil(par * 1.4) + 2) return 2;
        return 1;
    }

    // ========================================================================
    // 1. QUANTUM SOKOBAN (12 Handcrafted Solvable Levels)
    // ========================================================================
    const SOKOBAN_LEVELS: SokobanLevelDef[] = [
        {
            id: 1,
            name: 'Cargo Bay Alpha',
            par: 8,
            map: [
                '#######',
                '#     #',
                '# @$  #',
                '#  $. #',
                '#  .  #',
                '#     #',
                '#######'
            ]
        },
        {
            id: 2,
            name: 'Airlock Alignment',
            par: 13,
            map: [
                '#######',
                '# .   #',
                '# #$$ #',
                '# @ . #',
                '#     #',
                '#######'
            ]
        },
        {
            id: 3,
            name: 'Warp Dock Calibration',
            par: 15,
            storyTarget: true,
            map: [
                '########',
                '#   .  #',
                '#  $$# #',
                '# @$. .#',
                '#    # #',
                '#      #',
                '########'
            ]
        },
        {
            id: 4,
            name: 'Twin Thruster Hold',
            par: 16,
            map: [
                '########',
                '# .  . #',
                '#  $$  #',
                '#  #@# #',
                '#  $.  #',
                '#      #',
                '########'
            ]
        },
        {
            id: 5,
            name: 'Hyperdrive Matrix',
            par: 24,
            map: [
                '#########',
                '# .   . #',
                '# #$ $# #',
                '#   @   #',
                '# #$ $# #',
                '# .   . #',
                '#########'
            ]
        },
        {
            id: 6,
            name: 'Docking Ring',
            par: 25,
            map: [
                '#########',
                '#  ...  #',
                '# #$$$# #',
                '#   $   #',
                '#  #@#  #',
                '#   .   #',
                '#########'
            ]
        },
        {
            id: 7,
            name: 'Cryo Vault',
            par: 26,
            map: [
                '########',
                '#   .  #',
                '# #$$# #',
                '#  $. .#',
                '#  @   #',
                '#      #',
                '########'
            ]
        },
        {
            id: 8,
            name: 'Singularity Freight',
            par: 26,
            map: [
                '#########',
                '# .   . #',
                '# #$$$# #',
                '#   @   #',
                '#  $.$  #',
                '# .   . #',
                '#########'
            ]
        },
        {
            id: 9,
            name: 'Subspace Hold',
            par: 30,
            map: [
                '#########',
                '# .   . #',
                '#  $$$  #',
                '#  #@#  #',
                '#  $ .  #',
                '#   .   #',
                '#########'
            ]
        },
        {
            id: 10,
            name: 'Reactor Storage',
            par: 38,
            map: [
                '########',
                '# .  . #',
                '#  $$  #',
                '# #  # #',
                '# @$ $ #',
                '# .  . #',
                '########'
            ]
        },
        {
            id: 11,
            name: 'Bulkhead Switchback',
            par: 42,
            map: [
                '#########',
                '#   #   #',
                '# @$ $  #',
                '## ##.# #',
                '#  $. . #',
                '#       #',
                '#########'
            ]
        },
        {
            id: 12,
            name: 'Omega Hangar Deck',
            par: 48,
            map: [
                '##########',
                '#  ..#   #',
                '# $$$  # #',
                '#  # @ # #',
                '# .#$ $# #',
                '#  .  .  #',
                '##########'
            ]
        }
    ];

    function createSokobanState(levelIndex: number): SokobanState {
        const idx = clampLevelIndex(levelIndex, SOKOBAN_LEVELS.length);
        const def = SOKOBAN_LEVELS[idx];
        const rows = def.map.length;
        const cols = def.map[0].length;
        const walls: boolean[][] = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
        const targets: boolean[][] = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
        const boxes: Coord[] = [];
        let player: Coord = { r: 1, c: 1 };

        for (let r = 0; r < rows; r++) {
            const line = def.map[r];
            for (let c = 0; c < cols; c++) {
                const ch = line[c] || ' ';
                if (ch === '#') walls[r][c] = true;
                else if (ch === '.') targets[r][c] = true;
                else if (ch === '$') boxes.push({ r, c });
                else if (ch === '*') {
                    boxes.push({ r, c });
                    targets[r][c] = true;
                } else if (ch === '@') {
                    player = { r, c };
                } else if (ch === '+') {
                    player = { r, c };
                    targets[r][c] = true;
                }
            }
        }

        return {
            levelIndex: idx,
            name: def.name,
            rows,
            cols,
            par: def.par,
            walls,
            targets,
            player,
            boxes,
            moves: 0,
            pushes: 0,
            lastDir: 'S',
            undoStack: []
        };
    }

    function dirFromDelta(dr: number, dc: number): Direction {
        if (dr < 0) return 'N';
        if (dr > 0) return 'S';
        if (dc < 0) return 'W';
        return 'E';
    }

    function findBoxIndex(boxes: Coord[], r: number, c: number): number {
        for (let i = 0; i < boxes.length; i++) {
            if (boxes[i].r === r && boxes[i].c === c) return i;
        }
        return -1;
    }

    function isSokobanWon(state: SokobanState): boolean {
        return state.boxes.length > 0 && state.boxes.every((b) => state.targets[b.r][b.c]);
    }

    function detectSokobanDeadlock(state: SokobanState): boolean {
        for (const b of state.boxes) {
            if (state.targets[b.r][b.c]) continue;
            const u = b.r > 0 && state.walls[b.r - 1][b.c];
            const d = b.r + 1 < state.rows && state.walls[b.r + 1][b.c];
            const l = b.c > 0 && state.walls[b.r][b.c - 1];
            const r = b.c + 1 < state.cols && state.walls[b.r][b.c + 1];
            if ((u && l) || (u && r) || (d && l) || (d && r)) return true;
        }
        return false;
    }

    function stepSokoban(state: SokobanState, dr: number, dc: number): SokobanMoveResult {
        const nr = state.player.r + dr;
        const nc = state.player.c + dc;
        if (nr < 0 || nr >= state.rows || nc < 0 || nc >= state.cols || state.walls[nr][nc]) {
            return { moved: false, pushed: false, won: isSokobanWon(state), deadlocked: detectSokobanDeadlock(state) };
        }
        const boxIdx = findBoxIndex(state.boxes, nr, nc);
        let pushed = false;
        if (boxIdx >= 0) {
            const br = nr + dr;
            const bc = nc + dc;
            if (
                br < 0 || br >= state.rows || bc < 0 || bc >= state.cols ||
                state.walls[br][bc] || findBoxIndex(state.boxes, br, bc) >= 0
            ) {
                return { moved: false, pushed: false, won: isSokobanWon(state), deadlocked: detectSokobanDeadlock(state) };
            }
            state.undoStack.push({
                player: { r: state.player.r, c: state.player.c },
                boxes: state.boxes.map((b) => ({ r: b.r, c: b.c })),
                moves: state.moves,
                pushes: state.pushes
            });
            state.boxes[boxIdx] = { r: br, c: bc };
            state.pushes++;
            pushed = true;
        } else {
            state.undoStack.push({
                player: { r: state.player.r, c: state.player.c },
                boxes: state.boxes.map((b) => ({ r: b.r, c: b.c })),
                moves: state.moves,
                pushes: state.pushes
            });
        }
        state.player = { r: nr, c: nc };
        state.moves++;
        state.lastDir = dirFromDelta(dr, dc);
        return {
            moved: true,
            pushed,
            won: isSokobanWon(state),
            deadlocked: detectSokobanDeadlock(state)
        };
    }

    function undoSokoban(state: SokobanState): boolean {
        const snap = state.undoStack.pop();
        if (!snap) return false;
        state.player = snap.player;
        state.boxes = snap.boxes;
        state.moves = snap.moves;
        state.pushes = snap.pushes;
        return true;
    }

    function solveSokobanInternal(
        rows: number,
        cols: number,
        walls: boolean[][],
        targets: boolean[][],
        startPlayer: Coord,
        startBoxes: Coord[],
        maxStates: number
    ): { optimalMoves: number; firstDir: Direction | null } {
        const key = (r: number, c: number): number => r * cols + c;
        const dead = new Set<number>();
        const targetSet = new Set<number>();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (targets[r][c]) targetSet.add(key(r, c));
                else if (!walls[r][c] && r > 0 && r < rows - 1 && c > 0 && c < cols - 1) {
                    const u = walls[r - 1][c];
                    const d = walls[r + 1][c];
                    const l = walls[r][c - 1];
                    const ri = walls[r][c + 1];
                    if ((u && l) || (u && ri) || (d && l) || (d && ri)) dead.add(key(r, c));
                }
            }
        }
        const p0 = key(startPlayer.r, startPlayer.c);
        const b0 = startBoxes.map((b) => key(b.r, b.c)).sort((a, b) => a - b);
        if (b0.every((x) => targetSet.has(x))) return { optimalMoves: 0, firstDir: null };

        const enc = (p: number, b: number[]): string => p + '|' + b.join(',');
        const visited = new Set<string>([enc(p0, b0)]);
        const queue: Array<{ p: number; b: number[]; d: number; first: Direction | null }> = [
            { p: p0, b: b0, d: 0, first: null }
        ];
        const deltas: Array<{ delta: number; dir: Direction }> = [
            { delta: -cols, dir: 'N' },
            { delta: cols, dir: 'S' },
            { delta: -1, dir: 'W' },
            { delta: 1, dir: 'E' }
        ];

        let head = 0;
        while (head < queue.length && visited.size < maxStates) {
            const cur = queue[head++];
            const boxSet = new Set(cur.b);
            for (const step of deltas) {
                const np = cur.p + step.delta;
                const nr = Math.floor(np / cols);
                const nc = np % cols;
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || walls[nr][nc]) continue;
                const firstDir = cur.first ?? step.dir;
                if (boxSet.has(np)) {
                    const nb = np + step.delta;
                    const br = Math.floor(nb / cols);
                    const bc = nb % cols;
                    if (br < 0 || br >= rows || bc < 0 || bc >= cols || walls[br][bc] || boxSet.has(nb) || dead.has(nb)) {
                        continue;
                    }
                    const nextBoxes = cur.b.map((x) => (x === np ? nb : x)).sort((a, b) => a - b);
                    if (nextBoxes.every((x) => targetSet.has(x))) {
                        return { optimalMoves: cur.d + 1, firstDir };
                    }
                    const sig = enc(np, nextBoxes);
                    if (!visited.has(sig)) {
                        visited.add(sig);
                        queue.push({ p: np, b: nextBoxes, d: cur.d + 1, first: firstDir });
                    }
                } else {
                    const sig = enc(np, cur.b);
                    if (!visited.has(sig)) {
                        visited.add(sig);
                        queue.push({ p: np, b: cur.b, d: cur.d + 1, first: firstDir });
                    }
                }
            }
        }
        return { optimalMoves: -1, firstDir: null };
    }

    function solveSokobanHint(state: SokobanState, maxStates = 60000): Direction | null {
        return solveSokobanInternal(
            state.rows, state.cols, state.walls, state.targets, state.player, state.boxes, maxStates
        ).firstDir;
    }

    function verifySokobanLevel(levelIndex: number): { valid: boolean; optimalMoves: number; boxCount: number; targetCount: number } {
        const state = createSokobanState(levelIndex);
        let targetCount = 0;
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                if (state.targets[r][c]) targetCount++;
            }
        }
        const boxCount = state.boxes.length;
        if (boxCount === 0 || boxCount !== targetCount) {
            return { valid: false, optimalMoves: -1, boxCount, targetCount };
        }
        const res = solveSokobanInternal(
            state.rows, state.cols, state.walls, state.targets, state.player, state.boxes, 300000
        );
        return { valid: res.optimalMoves > 0, optimalMoves: res.optimalMoves, boxCount, targetCount };
    }

    // ========================================================================
    // 2. LASER MIRROR GRID (10 Handcrafted Optical Prism Puzzles)
    // ========================================================================
    const LASER_LEVELS: LaserLevelDef[] = [
        {
            id: 1, name: 'Prism Calibration', rows: 5, cols: 5, par: 1,
            items: [
                { r: 2, c: 0, type: 'emitter', dir: 'E' },
                { r: 2, c: 3, type: 'mirror', init: '\\', sol: '/' },
                { r: 0, c: 3, type: 'receiver' },
                { r: 2, c: 4, type: 'wall' }
            ]
        },
        {
            id: 2, name: 'Double Bounce', rows: 6, cols: 6, par: 2,
            items: [
                { r: 1, c: 0, type: 'emitter', dir: 'E' },
                { r: 1, c: 4, type: 'mirror', init: '/', sol: '\\' },
                { r: 4, c: 4, type: 'mirror', init: '\\', sol: '/' },
                { r: 4, c: 1, type: 'receiver' },
                { r: 2, c: 2, type: 'wall' }
            ]
        },
        {
            id: 3, name: 'Beam Splitter Intro', rows: 6, cols: 6, par: 2,
            items: [
                { r: 3, c: 0, type: 'emitter', dir: 'E' },
                { r: 3, c: 2, type: 'splitter', init: '\\', sol: '/' },
                { r: 3, c: 5, type: 'receiver' },
                { r: 0, c: 2, type: 'mirror', init: '\\', sol: '/' },
                { r: 0, c: 5, type: 'receiver' },
                { r: 5, c: 2, type: 'wall' }
            ]
        },
        {
            id: 4, name: 'Bulkhead Ricochet', rows: 6, cols: 6, par: 3,
            items: [
                { r: 0, c: 1, type: 'emitter', dir: 'S' },
                { r: 4, c: 1, type: 'mirror', init: '/', sol: '\\' },
                { r: 4, c: 4, type: 'mirror', init: '\\', sol: '/' },
                { r: 1, c: 4, type: 'mirror', init: '/', sol: '\\' },
                { r: 1, c: 2, type: 'receiver' },
                { r: 2, c: 2, type: 'wall' },
                { r: 2, c: 3, type: 'wall' }
            ]
        },
        {
            id: 5, name: 'Tri-Node Array', rows: 7, cols: 7, par: 4,
            items: [
                { r: 3, c: 0, type: 'emitter', dir: 'E' },
                { r: 3, c: 2, type: 'splitter', init: '/', sol: '\\' },
                { r: 3, c: 5, type: 'mirror', init: '\\', sol: '/' },
                { r: 0, c: 5, type: 'receiver' },
                { r: 5, c: 2, type: 'splitter', init: '\\', sol: '/' },
                { r: 5, c: 0, type: 'receiver' },
                { r: 6, c: 2, type: 'mirror', init: '/', sol: '\\' },
                { r: 6, c: 6, type: 'receiver' },
                { r: 1, c: 2, type: 'wall' },
                { r: 4, c: 4, type: 'wall' }
            ]
        },
        {
            id: 6, name: 'Crossfire Lattice', rows: 7, cols: 7, par: 4,
            items: [
                { r: 0, c: 3, type: 'emitter', dir: 'S' },
                { r: 2, c: 3, type: 'splitter', init: '\\', sol: '/' },
                { r: 2, c: 1, type: 'mirror', init: '\\', sol: '/' },
                { r: 5, c: 1, type: 'mirror', init: '/', sol: '\\' },
                { r: 5, c: 5, type: 'receiver' },
                { r: 4, c: 3, type: 'mirror', init: '/', sol: '\\' },
                { r: 4, c: 6, type: 'receiver' },
                { r: 2, c: 5, type: 'wall' },
                { r: 3, c: 2, type: 'wall' }
            ]
        },
        {
            id: 7, name: 'Twin Emitters', rows: 7, cols: 7, par: 4,
            items: [
                { r: 1, c: 0, type: 'emitter', dir: 'E' },
                { r: 5, c: 6, type: 'emitter', dir: 'W' },
                { r: 1, c: 3, type: 'mirror', init: '/', sol: '\\' },
                { r: 4, c: 3, type: 'mirror', init: '\\', sol: '/' },
                { r: 4, c: 1, type: 'receiver' },
                { r: 5, c: 2, type: 'mirror', init: '/', sol: '\\' },
                { r: 2, c: 2, type: 'mirror', init: '\\', sol: '/' },
                { r: 2, c: 5, type: 'receiver' },
                { r: 3, c: 4, type: 'wall' }
            ]
        },
        {
            id: 8, name: 'Prism Cascade', rows: 7, cols: 7, par: 4,
            items: [
                { r: 6, c: 1, type: 'emitter', dir: 'N' },
                { r: 4, c: 1, type: 'splitter', init: '\\', sol: '/' },
                { r: 4, c: 4, type: 'splitter', init: '/', sol: '\\' },
                { r: 6, c: 4, type: 'receiver' },
                { r: 4, c: 6, type: 'receiver' },
                { r: 1, c: 1, type: 'mirror', init: '\\', sol: '/' },
                { r: 1, c: 5, type: 'mirror', init: '/', sol: '\\' },
                { r: 3, c: 5, type: 'receiver' },
                { r: 2, c: 3, type: 'wall' },
                { r: 5, c: 2, type: 'wall' }
            ]
        },
        {
            id: 9, name: 'Refractor Vault', rows: 8, cols: 8, par: 5,
            items: [
                { r: 0, c: 2, type: 'emitter', dir: 'S' },
                { r: 3, c: 2, type: 'splitter', init: '/', sol: '\\' },
                { r: 3, c: 5, type: 'mirror', init: '\\', sol: '/' },
                { r: 1, c: 5, type: 'mirror', init: '\\', sol: '/' },
                { r: 1, c: 7, type: 'receiver' },
                { r: 6, c: 2, type: 'mirror', init: '/', sol: '\\' },
                { r: 6, c: 6, type: 'splitter', init: '\\', sol: '/' },
                { r: 6, c: 7, type: 'receiver' },
                { r: 4, c: 6, type: 'receiver' },
                { r: 2, c: 4, type: 'wall' },
                { r: 5, c: 3, type: 'wall' },
                { r: 5, c: 4, type: 'wall' }
            ]
        },
        {
            id: 10, name: 'Omega Optical Core', rows: 8, cols: 8, par: 7,
            items: [
                { r: 4, c: 0, type: 'emitter', dir: 'E' },
                { r: 4, c: 2, type: 'splitter', init: '\\', sol: '/' },
                { r: 1, c: 2, type: 'mirror', init: '\\', sol: '/' },
                { r: 1, c: 6, type: 'splitter', init: '/', sol: '\\' },
                { r: 1, c: 7, type: 'receiver' },
                { r: 3, c: 6, type: 'receiver' },
                { r: 4, c: 5, type: 'mirror', init: '/', sol: '\\' },
                { r: 6, c: 5, type: 'splitter', init: '\\', sol: '/' },
                { r: 6, c: 2, type: 'receiver' },
                { r: 7, c: 5, type: 'mirror', init: '/', sol: '\\' },
                { r: 7, c: 7, type: 'receiver' },
                { r: 3, c: 3, type: 'wall' },
                { r: 5, c: 3, type: 'wall' },
                { r: 2, c: 4, type: 'wall' }
            ]
        }
    ];

    const DIR_VEC: Record<Direction, [number, number]> = {
        N: [-1, 0],
        E: [0, 1],
        S: [1, 0],
        W: [0, -1]
    };
    const REFLECT_SLASH: Record<Direction, Direction> = { N: 'E', E: 'N', S: 'W', W: 'S' };
    const REFLECT_BACK: Record<Direction, Direction> = { N: 'W', W: 'N', S: 'E', E: 'S' };

    function createLaserState(levelIndex: number): LaserState {
        const idx = clampLevelIndex(levelIndex, LASER_LEVELS.length);
        const def = LASER_LEVELS[idx];
        const grid: LaserCell[][] = Array.from({ length: def.rows }, () =>
            Array.from({ length: def.cols }, (): LaserCell => ({ type: 'empty' }))
        );
        for (const it of def.items) {
            grid[it.r][it.c] = {
                type: it.type,
                dir: it.dir,
                orient: it.init,
                sol: it.sol
            };
        }
        return {
            levelIndex: idx,
            name: def.name,
            rows: def.rows,
            cols: def.cols,
            par: def.par,
            moves: 0,
            grid,
            undoStack: []
        };
    }

    function toggleLaserCell(state: LaserState, r: number, c: number): boolean {
        if (r < 0 || r >= state.rows || c < 0 || c >= state.cols) return false;
        const cell = state.grid[r][c];
        if (cell.type !== 'mirror' && cell.type !== 'splitter') return false;
        state.undoStack.push({ r, c, moves: state.moves });
        cell.orient = cell.orient === '/' ? '\\' : '/';
        state.moves++;
        return true;
    }

    function undoLaser(state: LaserState): boolean {
        const last = state.undoStack.pop();
        if (!last) return false;
        const cell = state.grid[last.r][last.c];
        cell.orient = cell.orient === '/' ? '\\' : '/';
        state.moves = last.moves;
        return true;
    }

    function traceLasers(rows: number, cols: number, grid: LaserCell[][]): LaserTraceResult {
        const litSet = new Set<string>();
        const segments: LaserSegment[] = [];
        const visited = new Set<string>();
        const queue: Array<{ r: number; c: number; dir: Direction }> = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                if (cell.type === 'emitter' && cell.dir) {
                    queue.push({ r, c, dir: cell.dir });
                }
            }
        }

        while (queue.length > 0) {
            const beam = queue.shift()!;
            let r = beam.r;
            let c = beam.c;
            let dir = beam.dir;
            while (true) {
                const sk = `${r},${c},${dir}`;
                if (visited.has(sk)) break;
                visited.add(sk);
                const [dr, dc] = DIR_VEC[dir];
                const nr = r + dr;
                const nc = c + dc;
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
                    segments.push({ r1: r, c1: c, r2: r + dr * 0.45, c2: c + dc * 0.45 });
                    break;
                }
                const next = grid[nr][nc];
                if (next.type === 'wall' || next.type === 'emitter') {
                    segments.push({ r1: r, c1: c, r2: r + dr * 0.42, c2: c + dc * 0.42 });
                    break;
                }
                segments.push({ r1: r, c1: c, r2: nr, c2: nc });
                if (next.type === 'receiver') {
                    litSet.add(`${nr},${nc}`);
                    r = nr;
                    c = nc;
                    continue;
                }
                if (next.type === 'mirror') {
                    dir = next.orient === '/' ? REFLECT_SLASH[dir] : REFLECT_BACK[dir];
                    r = nr;
                    c = nc;
                    continue;
                }
                if (next.type === 'splitter') {
                    const reflDir = next.orient === '/' ? REFLECT_SLASH[dir] : REFLECT_BACK[dir];
                    queue.push({ r: nr, c: nc, dir: reflDir });
                    r = nr;
                    c = nc;
                    continue;
                }
                r = nr;
                c = nc;
            }
        }

        let totalReceivers = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c].type === 'receiver') totalReceivers++;
            }
        }
        return {
            segments,
            litReceivers: Array.from(litSet),
            totalReceivers,
            solved: totalReceivers > 0 && litSet.size === totalReceivers
        };
    }

    function getLaserHint(state: LaserState): Coord | null {
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                const cell = state.grid[r][c];
                if ((cell.type === 'mirror' || cell.type === 'splitter') && cell.sol && cell.orient !== cell.sol) {
                    return { r, c };
                }
            }
        }
        return null;
    }

    // ========================================================================
    // 3. CIRCUIT PIPE LINK (8 Levels, Story Ch.5 Target: Level 3)
    // ========================================================================
    const PIPE_LEVELS: PipeLevelDef[] = [
        {
            id: 1, name: 'Reactor Conduit 01', bonusSec: 40, par: 8,
            spec: [
                ['.', '.', '.', '.', '.'],
                ['.', 'L10', 'I10', 'L21', '.'],
                ['SE', 'L31', '#', 'L02', 'GW'],
                ['.', '.', '.', '.', '.'],
                ['.', '.', '.', '.', '.']
            ]
        },
        {
            id: 2, name: 'Dual Split Array', bonusSec: 45, par: 15,
            spec: [
                ['.', '.', 'L13', 'I10', 'GW'],
                ['.', '.', 'I01', '.', '.'],
                ['SE', 'I10', 'T01', 'L20', '.'],
                ['.', '#', '.', 'I01', '.'],
                ['.', '.', '.', 'L02', 'GW']
            ]
        },
        {
            id: 3, name: 'Cryo Junction', bonusSec: 55, par: 23, storyTarget: true,
            spec: [
                ['.', 'L12', 'I10', 'L23', '.', '.'],
                ['SE', 'T32', '#', 'T12', 'I10', 'GW'],
                ['.', 'L01', 'I10', 'L20', '#', '.'],
                ['.', '.', '#', 'I01', '.', '.'],
                ['.', '.', '.', 'L03', 'I10', 'GW'],
                ['.', '.', '.', '.', '.', '.']
            ]
        },
        {
            id: 4, name: 'Tri-Gate Matrix', bonusSec: 60, par: 26,
            spec: [
                ['.', '.', 'L10', 'I10', 'I10', 'GW'],
                ['SE', 'I10', 'T30', 'L20', '#', '.'],
                ['.', '#', 'I01', 'L01', 'L21', '.'],
                ['.', '.', 'T12', 'I10', 'T20', 'GW'],
                ['.', '.', 'L03', '#', 'I01', '.'],
                ['.', '.', '.', '.', 'L02', 'GW']
            ]
        },
        {
            id: 5, name: 'Shield Grid Relay', bonusSec: 65, par: 29,
            spec: [
                ['.', 'L10', 'T23', 'I10', 'T23', 'GW'],
                ['.', 'I01', 'I01', '#', 'I01', '.'],
                ['SE', 'T01', 'X00', 'I10', 'T12', 'GW'],
                ['.', '#', 'I01', '#', 'I01', '.'],
                ['.', '.', 'L03', 'I10', 'T30', '.'],
                ['.', '.', '.', '.', 'L02', 'GW']
            ]
        },
        {
            id: 6, name: 'Subspace Bus', bonusSec: 75, par: 32,
            spec: [
                ['.', 'L13', 'I10', 'T21', 'I10', 'I10', 'GW'],
                ['.', 'I01', '#', 'I01', '.', '#', '.'],
                ['SE', 'T02', 'I10', 'X00', 'I10', 'L21', '.'],
                ['.', '.', '#', 'I01', '#', 'I01', '.'],
                ['.', 'L10', 'I10', 'T30', 'I10', 'T13', 'GW'],
                ['.', 'I01', '.', '#', '.', 'I01', '.'],
                ['.', 'L02', 'I10', 'I10', 'I10', 'T02', 'GW']
            ]
        },
        {
            id: 7, name: 'Hypercore Distribution', bonusSec: 80, par: 32,
            spec: [
                ['.', '.', 'L10', 'I10', 'T23', 'I10', 'GW'],
                ['.', 'L12', 'T31', '#', 'I01', '#', '.'],
                ['SE', 'T30', '#', 'L13', 'X00', 'I10', 'GW'],
                ['.', 'I01', '.', 'I01', 'I01', '#', '.'],
                ['.', 'L03', 'I10', 'T21', 'T02', 'L21', '.'],
                ['.', '.', '#', 'I01', '#', 'I01', '.'],
                ['.', '.', '.', 'L02', 'I10', 'T20', 'GW']
            ]
        },
        {
            id: 8, name: 'Omega Nexus Grid', bonusSec: 90, par: 36,
            spec: [
                ['.', 'L10', 'T20', 'I10', 'T23', 'I10', 'GW'],
                ['.', 'I01', 'I01', '#', 'I01', '#', '.'],
                ['SE', 'X00', 'T30', 'I10', 'T12', '#', '.'],
                ['.', 'I01', 'I01', '#', 'I01', '.', '.'],
                ['.', 'L02', 'T10', 'I10', 'X00', 'I10', 'GW'],
                ['.', '#', 'I01', '#', 'I01', '#', '.'],
                ['.', '.', 'L03', 'I10', 'T01', 'I10', 'GW']
            ]
        }
    ];

    const OPP_DIR: Record<Direction, Direction> = { N: 'S', S: 'N', E: 'W', W: 'E' };

    function getPipePorts(cell: PipeCell): Direction[] {
        if (cell.ports) return cell.ports;
        const r = ((cell.rot % 4) + 4) % 4;
        if (cell.kind === 'I') return r % 2 === 0 ? ['N', 'S'] : ['E', 'W'];
        if (cell.kind === 'L') {
            const table: Direction[][] = [['N', 'E'], ['E', 'S'], ['S', 'W'], ['W', 'N']];
            return table[r];
        }
        if (cell.kind === 'T') {
            const table: Direction[][] = [['N', 'E', 'W'], ['N', 'E', 'S'], ['E', 'S', 'W'], ['S', 'W', 'N']];
            return table[r];
        }
        if (cell.kind === 'X') return ['N', 'E', 'S', 'W'];
        return [];
    }

    function createPipeState(levelIndex: number): PipeState {
        const idx = clampLevelIndex(levelIndex, PIPE_LEVELS.length);
        const def = PIPE_LEVELS[idx];
        const rows = def.spec.length;
        const cols = def.spec[0].length;
        const grid: PipeCell[][] = Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c): PipeCell => {
                const tok = def.spec[r][c];
                if (tok === '.' || tok === '#') return { kind: tok, rot: 0, solvedRot: 0 };
                if (tok.startsWith('S')) {
                    return { kind: 'S', rot: 0, solvedRot: 0, ports: tok.slice(1).split('') as Direction[] };
                }
                if (tok.startsWith('G')) {
                    return { kind: 'G', rot: 0, solvedRot: 0, ports: tok.slice(1).split('') as Direction[] };
                }
                return {
                    kind: tok[0] as PipeKind,
                    rot: parseInt(tok[2], 10),
                    solvedRot: parseInt(tok[1], 10)
                };
            })
        );
        return {
            levelIndex: idx,
            name: def.name,
            rows,
            cols,
            bonusSec: def.bonusSec,
            par: def.par,
            moves: 0,
            grid,
            undoStack: []
        };
    }

    function rotatePipeCell(state: PipeState, r: number, c: number): boolean {
        if (r < 0 || r >= state.rows || c < 0 || c >= state.cols) return false;
        const cell = state.grid[r][c];
        if (cell.kind !== 'I' && cell.kind !== 'L' && cell.kind !== 'T') return false;
        state.undoStack.push({ r, c, prevRot: cell.rot, moves: state.moves });
        const mod = cell.kind === 'I' ? 2 : 4;
        cell.rot = (cell.rot + 1) % mod;
        state.moves++;
        return true;
    }

    function undoPipe(state: PipeState): boolean {
        const snap = state.undoStack.pop();
        if (!snap) return false;
        state.grid[snap.r][snap.c].rot = snap.prevRot;
        state.moves = snap.moves;
        return true;
    }

    function evalPipeFlow(rows: number, cols: number, grid: PipeCell[][]): PipeEvalResult {
        const powered = new Set<string>();
        const queue: Coord[] = [];
        const gates: string[] = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                if (cell.kind === 'S') {
                    powered.add(`${r},${c}`);
                    queue.push({ r, c });
                } else if (cell.kind === 'G') {
                    gates.push(`${r},${c}`);
                }
            }
        }

        let head = 0;
        while (head < queue.length) {
            const { r, c } = queue[head++];
            const ports = getPipePorts(grid[r][c]);
            for (const d of ports) {
                const [dr, dc] = DIR_VEC[d];
                const nr = r + dr;
                const nc = c + dc;
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                const nk = `${nr},${nc}`;
                if (powered.has(nk)) continue;
                const nPorts = getPipePorts(grid[nr][nc]);
                if (nPorts.includes(OPP_DIR[d])) {
                    powered.add(nk);
                    queue.push({ r: nr, c: nc });
                }
            }
        }

        const litGates = gates.filter((g) => powered.has(g)).length;
        return {
            powered: Array.from(powered),
            litGates,
            totalGates: gates.length,
            solved: gates.length > 0 && litGates === gates.length
        };
    }

    function getPipeHint(state: PipeState): Coord | null {
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                const cell = state.grid[r][c];
                if (cell.kind === 'I') {
                    if ((cell.rot % 2) !== (cell.solvedRot % 2)) return { r, c };
                } else if (cell.kind === 'L' || cell.kind === 'T') {
                    if ((cell.rot % 4) !== (cell.solvedRot % 4)) return { r, c };
                }
            }
        }
        return null;
    }

    // ========================================================================
    // 4. QUANTUM 2048 (Cosmic Element Fusion)
    // ========================================================================
    const ELEMENTS_2048: Record<number, ElementMeta> = {
        2:    { value: 2,    symbol: 'H',           name: 'Hydrogen',    color: '#1e3a5f', glow: '#38bdf8' },
        4:    { value: 4,    symbol: 'He',          name: 'Helium',      color: '#164e63', glow: '#22d3ee' },
        8:    { value: 8,    symbol: 'Li',          name: 'Lithium',     color: '#065f46', glow: '#34d399' },
        16:   { value: 16,   symbol: 'C',           name: 'Carbon',      color: '#365314', glow: '#a3e635' },
        32:   { value: 32,   symbol: 'O',           name: 'Oxygen',      color: '#713f12', glow: '#facc15' },
        64:   { value: 64,   symbol: 'Fe',          name: 'Iron',        color: '#7c2d12', glow: '#fb923c' },
        128:  { value: 128,  symbol: 'Xe',          name: 'Xenon',       color: '#7f1d1d', glow: '#f87171' },
        256:  { value: 256,  symbol: 'Nova',        name: 'Nova',        color: '#831843', glow: '#f472b6' },
        512:  { value: 512,  symbol: 'Pulsar',      name: 'Pulsar',      color: '#581c87', glow: '#c084fc' },
        1024: { value: 1024, symbol: 'Quasar',      name: 'Quasar',      color: '#312e81', glow: '#818cf8' },
        2048: { value: 2048, symbol: 'Singularity', name: 'Singularity', color: '#0f172a', glow: '#fbbf24' },
        4096: { value: 4096, symbol: 'Omega',       name: 'Omega',       color: '#090d16', glow: '#ffffff' }
    };

    function spawn2048Tile(board: number[][], rngState: number): { cell: Coord | null; nextRng: number } {
        const empty: Coord[] = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (board[r][c] === 0) empty.push({ r, c });
            }
        }
        if (empty.length === 0) return { cell: null, nextRng: rngState };
        const r1 = nextRand(rngState);
        const pick = empty[Math.floor(r1.val * empty.length)];
        const r2 = nextRand(r1.next);
        board[pick.r][pick.c] = r2.val < 0.9 ? 2 : 4;
        return { cell: pick, nextRng: r2.next };
    }

    function create2048State(seed = Date.now(), bestScore = 0): Board2048State {
        const board = Array.from({ length: 4 }, () => new Array<number>(4).fill(0));
        let rngState = seed | 0;
        const s1 = spawn2048Tile(board, rngState);
        rngState = s1.nextRng;
        const s2 = spawn2048Tile(board, rngState);
        rngState = s2.nextRng;
        return {
            board,
            score: 0,
            bestScore,
            moves: 0,
            wonReached: false,
            prevSnapshot: null,
            rngState
        };
    }

    function has2048Moves(board: number[][]): boolean {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const v = board[r][c];
                if (v === 0) return true;
                if (r + 1 < 4 && board[r + 1][c] === v) return true;
                if (c + 1 < 4 && board[r][c + 1] === v) return true;
            }
        }
        return false;
    }

    function slide2048(state: Board2048State, dir: Direction): Move2048Result {
        const prevBoard = state.board.map((r) => r.slice());
        const nextBoard = state.board.map((r) => r.slice());
        let moved = false;
        let scoreGain = 0;
        const mergedCells: Coord[] = [];

        const collapseLine = (vals: number[]): { out: number[]; gain: number; mergedIdx: number[] } => {
            const nz = vals.filter((x) => x !== 0);
            const out: number[] = [];
            const mergedIdx: number[] = [];
            let gain = 0;
            let i = 0;
            while (i < nz.length) {
                if (i + 1 < nz.length && nz[i] === nz[i + 1]) {
                    const v = nz[i] * 2;
                    mergedIdx.push(out.length);
                    out.push(v);
                    gain += v;
                    i += 2;
                } else {
                    out.push(nz[i]);
                    i += 1;
                }
            }
            while (out.length < 4) out.push(0);
            return { out, gain, mergedIdx };
        };

        for (let i = 0; i < 4; i++) {
            const line: number[] = [];
            for (let j = 0; j < 4; j++) {
                if (dir === 'W') line.push(nextBoard[i][j]);
                else if (dir === 'E') line.push(nextBoard[i][3 - j]);
                else if (dir === 'N') line.push(nextBoard[j][i]);
                else line.push(nextBoard[3 - j][i]);
            }
            const res = collapseLine(line);
            scoreGain += res.gain;
            for (let j = 0; j < 4; j++) {
                let r = i, c = j;
                if (dir === 'W') { r = i; c = j; }
                else if (dir === 'E') { r = i; c = 3 - j; }
                else if (dir === 'N') { r = j; c = i; }
                else { r = 3 - j; c = i; }
                if (nextBoard[r][c] !== res.out[j]) moved = true;
                nextBoard[r][c] = res.out[j];
                if (res.mergedIdx.includes(j)) mergedCells.push({ r, c });
            }
        }

        if (!moved) {
            return {
                moved: false,
                scoreGain: 0,
                mergedCells: [],
                spawnedCell: null,
                wonNow: false,
                isGameOver: !has2048Moves(state.board)
            };
        }

        state.prevSnapshot = {
            board: prevBoard,
            score: state.score,
            moves: state.moves
        };
        const sp = spawn2048Tile(nextBoard, state.rngState);
        state.rngState = sp.nextRng;
        state.board = nextBoard;
        state.score += scoreGain;
        if (state.score > state.bestScore) state.bestScore = state.score;
        state.moves++;

        let wonNow = false;
        if (!state.wonReached) {
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (state.board[r][c] >= 2048) {
                        state.wonReached = true;
                        wonNow = true;
                    }
                }
            }
        }

        return {
            moved: true,
            scoreGain,
            mergedCells,
            spawnedCell: sp.cell,
            wonNow,
            isGameOver: !has2048Moves(state.board)
        };
    }

    function undo2048(state: Board2048State): boolean {
        if (!state.prevSnapshot) return false;
        state.board = state.prevSnapshot.board.map((r) => r.slice());
        state.score = state.prevSnapshot.score;
        state.moves = state.prevSnapshot.moves;
        state.prevSnapshot = null;
        return true;
    }

    // ========================================================================
    // 5. NEBULA MINESWEEPER (3 Tiers: 8x8, 10x10, 12x12)
    // ========================================================================
    const MINE_LEVELS: MineLevelDef[] = [
        { id: 1, name: 'Sector Sweep (8x8)',   rows: 8,  cols: 8,  mines: 10 },
        { id: 2, name: 'Nebula Field (10x10)', rows: 10, cols: 10, mines: 18 },
        { id: 3, name: 'Void Minefield (12x12)', rows: 12, cols: 12, mines: 28 }
    ];

    function createMinesweeperState(levelIndex: number): MinesweeperState {
        const idx = clampLevelIndex(levelIndex, MINE_LEVELS.length);
        const def = MINE_LEVELS[idx];
        const grid: MineCell[][] = Array.from({ length: def.rows }, () =>
            Array.from({ length: def.cols }, (): MineCell => ({
                mine: false,
                revealed: false,
                flagged: false,
                adj: 0
            }))
        );
        return {
            levelIndex: idx,
            name: def.name,
            rows: def.rows,
            cols: def.cols,
            mineCount: def.mines,
            minesPlaced: false,
            revealedSafeCount: 0,
            flagsPlaced: 0,
            moves: 0,
            hitMine: null,
            won: false,
            lost: false,
            grid
        };
    }

    function placeMinesExcluding(state: MinesweeperState, safeR: number, safeC: number, seed: number): void {
        const candidates: Coord[] = [];
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
                candidates.push({ r, c });
            }
        }
        let rng = seed | 0;
        for (let i = candidates.length - 1; i > 0; i--) {
            const rr = nextRand(rng);
            rng = rr.next;
            const j = Math.floor(rr.val * (i + 1));
            const tmp = candidates[i];
            candidates[i] = candidates[j];
            candidates[j] = tmp;
        }
        const count = Math.min(state.mineCount, candidates.length);
        for (let i = 0; i < count; i++) {
            const { r, c } = candidates[i];
            state.grid[r][c].mine = true;
        }
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                if (state.grid[r][c].mine) continue;
                let adj = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols && state.grid[nr][nc].mine) {
                            adj++;
                        }
                    }
                }
                state.grid[r][c].adj = adj;
            }
        }
        state.minesPlaced = true;
    }

    function checkMinesweeperWin(state: MinesweeperState): boolean {
        const totalSafe = state.rows * state.cols - state.mineCount;
        if (state.revealedSafeCount >= totalSafe && !state.lost) {
            state.won = true;
            for (let r = 0; r < state.rows; r++) {
                for (let c = 0; c < state.cols; c++) {
                    if (state.grid[r][c].mine) state.grid[r][c].flagged = true;
                }
            }
            state.flagsPlaced = state.mineCount;
            return true;
        }
        return false;
    }

    function revealMineCell(state: MinesweeperState, r: number, c: number, seed = Date.now()): MineRevealResult {
        if (state.won || state.lost) return { changed: false, exploded: false, won: state.won, newlyRevealed: [] };
        if (r < 0 || r >= state.rows || c < 0 || c >= state.cols) {
            return { changed: false, exploded: false, won: false, newlyRevealed: [] };
        }
        const cell = state.grid[r][c];
        if (cell.revealed || cell.flagged) return { changed: false, exploded: false, won: false, newlyRevealed: [] };

        if (!state.minesPlaced) {
            placeMinesExcluding(state, r, c, seed);
        }
        state.moves++;

        if (cell.mine) {
            cell.revealed = true;
            state.lost = true;
            state.hitMine = { r, c };
            for (let rr = 0; rr < state.rows; rr++) {
                for (let cc = 0; cc < state.cols; cc++) {
                    if (state.grid[rr][cc].mine) state.grid[rr][cc].revealed = true;
                }
            }
            return { changed: true, exploded: true, won: false, newlyRevealed: [{ r, c }] };
        }

        const newlyRevealed: Coord[] = [];
        const queue: Coord[] = [{ r, c }];
        cell.revealed = true;
        state.revealedSafeCount++;
        newlyRevealed.push({ r, c });

        let head = 0;
        while (head < queue.length) {
            const cur = queue[head++];
            if (state.grid[cur.r][cur.c].adj !== 0) continue;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = cur.r + dr, nc = cur.c + dc;
                    if (nr < 0 || nr >= state.rows || nc < 0 || nc >= state.cols) continue;
                    const nb = state.grid[nr][nc];
                    if (!nb.revealed && !nb.mine) {
                        if (nb.flagged) {
                            nb.flagged = false;
                            state.flagsPlaced = Math.max(0, state.flagsPlaced - 1);
                        }
                        nb.revealed = true;
                        state.revealedSafeCount++;
                        newlyRevealed.push({ r: nr, c: nc });
                        if (nb.adj === 0) queue.push({ r: nr, c: nc });
                    }
                }
            }
        }

        const won = checkMinesweeperWin(state);
        return { changed: true, exploded: false, won, newlyRevealed };
    }

    function toggleMineFlag(state: MinesweeperState, r: number, c: number): boolean {
        if (state.won || state.lost) return false;
        if (r < 0 || r >= state.rows || c < 0 || c >= state.cols) return false;
        const cell = state.grid[r][c];
        if (cell.revealed) return false;
        cell.flagged = !cell.flagged;
        state.flagsPlaced += cell.flagged ? 1 : -1;
        return true;
    }

    function chordMineCell(state: MinesweeperState, r: number, c: number): MineRevealResult {
        if (state.won || state.lost) return { changed: false, exploded: false, won: state.won, newlyRevealed: [] };
        if (r < 0 || r >= state.rows || c < 0 || c >= state.cols) {
            return { changed: false, exploded: false, won: false, newlyRevealed: [] };
        }
        const center = state.grid[r][c];
        if (!center.revealed || center.adj <= 0) {
            return { changed: false, exploded: false, won: false, newlyRevealed: [] };
        }
        let adjFlags = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols && state.grid[nr][nc].flagged) {
                    adjFlags++;
                }
            }
        }
        if (adjFlags !== center.adj) {
            return { changed: false, exploded: false, won: false, newlyRevealed: [] };
        }
        let changed = false;
        let exploded = false;
        let won = false;
        const newlyRevealed: Coord[] = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= state.rows || nc < 0 || nc >= state.cols) continue;
                const nb = state.grid[nr][nc];
                if (!nb.revealed && !nb.flagged) {
                    const res = revealMineCell(state, nr, nc);
                    if (res.changed) changed = true;
                    if (res.exploded) exploded = true;
                    if (res.won) won = true;
                    newlyRevealed.push(...res.newlyRevealed);
                }
            }
        }
        return { changed, exploded, won, newlyRevealed };
    }

    function getMineHint(state: MinesweeperState): Coord | null {
        if (state.won || state.lost) return null;
        if (!state.minesPlaced) {
            return { r: Math.floor(state.rows / 2), c: Math.floor(state.cols / 2) };
        }
        // Prefer frontier unrevealed safe cell adjacent to revealed cells
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                const cell = state.grid[r][c];
                if (!cell.revealed && !cell.mine && !cell.flagged) {
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = r + dr, nc = c + dc;
                            if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols && state.grid[nr][nc].revealed) {
                                return { r, c };
                            }
                        }
                    }
                }
            }
        }
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                const cell = state.grid[r][c];
                if (!cell.revealed && !cell.mine && !cell.flagged) return { r, c };
            }
        }
        return null;
    }

    // ========================================================================
    // 6. MATCH-3 ISOTOPE CORE (7x7, 8 Progressive Levels)
    // ========================================================================
    const MATCH3_SPRITE_KEYS: string[] = [
        'cryo_crystal',
        'energy_prism',
        'coin_star',
        'plasma_bomb',
        'shield_battery',
        'portal_vortex'
    ];

    const MATCH3_LEVELS: Match3LevelDef[] = [
        { id: 1, name: 'Isotope Ignition',   typesCount: 5, targetScore: 900,  maxMoves: 16 },
        { id: 2, name: 'Crystal Harmonic',   typesCount: 5, targetScore: 1400, maxMoves: 18 },
        { id: 3, name: 'Prism Resonance',    typesCount: 5, targetScore: 2000, maxMoves: 18 },
        { id: 4, name: 'Core Saturation',    typesCount: 6, targetScore: 2400, maxMoves: 20 },
        { id: 5, name: 'Quantum Lattice',    typesCount: 6, targetScore: 3000, maxMoves: 20 },
        { id: 6, name: 'Nova Cascade',       typesCount: 6, targetScore: 3800, maxMoves: 22 },
        { id: 7, name: 'Vortex Overdrive',   typesCount: 6, targetScore: 4600, maxMoves: 22 },
        { id: 8, name: 'Singularity Core',   typesCount: 6, targetScore: 5600, maxMoves: 24 }
    ];

    function findMatchRuns(grid: Array<Array<GemTile | null>>): Array<{ cells: Coord[]; len: number; kind: number }> {
        const N = grid.length;
        const runs: Array<{ cells: Coord[]; len: number; kind: number }> = [];

        // Horizontal runs
        for (let r = 0; r < N; r++) {
            let c = 0;
            while (c < N) {
                const g = grid[r][c];
                if (!g) { c++; continue; }
                let end = c + 1;
                while (end < N && grid[r][end] && grid[r][end]!.kind === g.kind) end++;
                const len = end - c;
                if (len >= 3) {
                    const cells: Coord[] = [];
                    for (let k = c; k < end; k++) cells.push({ r, c: k });
                    runs.push({ cells, len, kind: g.kind });
                }
                c = end;
            }
        }
        // Vertical runs
        for (let c = 0; c < N; c++) {
            let r = 0;
            while (r < N) {
                const g = grid[r][c];
                if (!g) { r++; continue; }
                let end = r + 1;
                while (end < N && grid[end][c] && grid[end][c]!.kind === g.kind) end++;
                const len = end - r;
                if (len >= 3) {
                    const cells: Coord[] = [];
                    for (let k = r; k < end; k++) cells.push({ r: k, c });
                    runs.push({ cells, len, kind: g.kind });
                }
                r = end;
            }
        }
        return runs;
    }

    function swapGridCells(grid: Array<Array<GemTile | null>>, a: Coord, b: Coord): void {
        const tmp = grid[a.r][a.c];
        grid[a.r][a.c] = grid[b.r][b.c];
        grid[b.r][b.c] = tmp;
    }

    function findValidMatch3Move(grid: Array<Array<GemTile | null>>): { a: Coord; b: Coord } | null {
        const N = grid.length;
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                if (!grid[r][c]) continue;
                const nbrs: Coord[] = [];
                if (c + 1 < N) nbrs.push({ r, c: c + 1 });
                if (r + 1 < N) nbrs.push({ r: r + 1, c });
                for (const nb of nbrs) {
                    if (!grid[nb.r][nb.c]) continue;
                    if (grid[r][c]!.kind === grid[nb.r][nb.c]!.kind) continue;
                    swapGridCells(grid, { r, c }, nb);
                    const has = findMatchRuns(grid).length > 0;
                    swapGridCells(grid, { r, c }, nb);
                    if (has) return { a: { r, c }, b: nb };
                }
            }
        }
        return null;
    }

    function injectGuaranteedMatch3Move(state: Match3State): void {
        const N = state.size;
        for (let r = 0; r < N - 1; r++) {
            for (let c = 0; c < N - 2; c++) {
                for (let k = 0; k < state.typesCount; k++) {
                    const prevA = state.grid[r][c];
                    const prevB = state.grid[r][c + 1];
                    const prevC = state.grid[r + 1][c + 2];
                    if (!prevA || !prevB || !prevC) continue;
                    const ka = prevA.kind;
                    const kb = prevB.kind;
                    const kc = prevC.kind;
                    prevA.kind = k;
                    prevB.kind = k;
                    prevC.kind = k;
                    if (findMatchRuns(state.grid).length === 0 && findValidMatch3Move(state.grid)) {
                        return;
                    }
                    prevA.kind = ka;
                    prevB.kind = kb;
                    prevC.kind = kc;
                }
            }
        }
    }

    function fillCleanMatch3Grid(state: Match3State): void {
        const N = state.size;
        for (let attempt = 0; attempt < 40; attempt++) {
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    const forbidden = new Set<number>();
                    if (c >= 2 && state.grid[r][c - 1] && state.grid[r][c - 2] &&
                        state.grid[r][c - 1]!.kind === state.grid[r][c - 2]!.kind) {
                        forbidden.add(state.grid[r][c - 1]!.kind);
                    }
                    if (r >= 2 && state.grid[r - 1][c] && state.grid[r - 2][c] &&
                        state.grid[r - 1][c]!.kind === state.grid[r - 2][c]!.kind) {
                        forbidden.add(state.grid[r - 1][c]!.kind);
                    }
                    const choices: number[] = [];
                    for (let k = 0; k < state.typesCount; k++) {
                        if (!forbidden.has(k)) choices.push(k);
                    }
                    const rr = nextRand(state.rngState);
                    state.rngState = rr.next;
                    const kind = choices[Math.floor(rr.val * choices.length)];
                    state.grid[r][c] = { kind, special: 'none', uid: state.nextUid++ };
                }
            }
            if (findValidMatch3Move(state.grid)) return;
        }
        injectGuaranteedMatch3Move(state);
    }

    function createMatch3State(levelIndex: number, seed = Date.now()): Match3State {
        const idx = clampLevelIndex(levelIndex, MATCH3_LEVELS.length);
        const def = MATCH3_LEVELS[idx];
        const size = 7;
        const grid: Array<Array<GemTile | null>> = Array.from({ length: size }, () =>
            new Array<GemTile | null>(size).fill(null)
        );
        const state: Match3State = {
            levelIndex: idx,
            name: def.name,
            size,
            typesCount: def.typesCount,
            targetScore: def.targetScore,
            maxMoves: def.maxMoves,
            movesLeft: def.maxMoves,
            movesUsed: 0,
            score: 0,
            combo: 0,
            nextUid: 1,
            rngState: seed | 0,
            grid
        };
        fillCleanMatch3Grid(state);
        return state;
    }

    function shuffleMatch3Board(state: Match3State): void {
        const N = state.size;
        const pool: GemTile[] = [];
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const g = state.grid[r][c];
                if (g) pool.push(g);
            }
        }
        if (pool.length === N * N) {
            for (let attempt = 0; attempt < 30; attempt++) {
                for (let i = pool.length - 1; i > 0; i--) {
                    const rr = nextRand(state.rngState);
                    state.rngState = rr.next;
                    const j = Math.floor(rr.val * (i + 1));
                    const tmp = pool[i];
                    pool[i] = pool[j];
                    pool[j] = tmp;
                }
                for (let r = 0; r < N; r++) {
                    for (let c = 0; c < N; c++) {
                        state.grid[r][c] = pool[r * N + c];
                    }
                }
                if (findMatchRuns(state.grid).length === 0 && findValidMatch3Move(state.grid)) {
                    return;
                }
            }
        }
        const novaCount = pool.filter((g) => g.special === 'nova_row').length;
        fillCleanMatch3Grid(state);
        for (let n = 0; n < novaCount; n++) {
            const rr = nextRand(state.rngState);
            state.rngState = rr.next;
            const cr = Math.floor(rr.val * N);
            const rr2 = nextRand(state.rngState);
            state.rngState = rr2.next;
            const cc = Math.floor(rr2.val * N);
            if (state.grid[cr][cc]) state.grid[cr][cc]!.special = 'nova_row';
        }
    }

    function tryMatch3Swap(state: Match3State, a: Coord, b: Coord): Match3SwapResult {
        if (state.score >= state.targetScore) return { valid: false, won: true };
        const dr = Math.abs(a.r - b.r);
        const dc = Math.abs(a.c - b.c);
        if (dr + dc !== 1) return { valid: false, won: false };
        if (state.movesLeft <= 0) return { valid: false, won: false };
        if (!state.grid[a.r][a.c] || !state.grid[b.r][b.c]) {
            return { valid: false, won: state.score >= state.targetScore };
        }
        swapGridCells(state.grid, a, b);
        const runs = findMatchRuns(state.grid);
        if (runs.length === 0) {
            swapGridCells(state.grid, a, b);
            return { valid: false, won: state.score >= state.targetScore };
        }
        state.movesLeft--;
        state.movesUsed++;
        state.combo = 0;
        return { valid: true, won: state.score >= state.targetScore };
    }

    function resolveMatch3CascadeStep(state: Match3State, preferredNova?: Coord): Match3StepResult {
        const N = state.size;
        const runs = findMatchRuns(state.grid);
        if (runs.length === 0) {
            let shuffled = false;
            if (!findValidMatch3Move(state.grid)) {
                shuffleMatch3Board(state);
                shuffled = true;
            }
            return {
                hadMatches: false,
                cleared: [],
                novaRows: [],
                purgedKinds: [],
                spawnedNova: [],
                scoreGain: 0,
                combo: state.combo,
                shuffled
            };
        }

        state.combo++;
        const toClear = new Set<string>();
        const novaSpawnCells = new Map<string, number>(); // key -> kind
        const purgedKindsSet = new Set<number>();
        const novaRowsSet = new Set<number>();

        for (const run of runs) {
            for (const c of run.cells) {
                toClear.add(`${c.r},${c.c}`);
            }
            if (run.len === 4) {
                let target = run.cells[1];
                if (preferredNova && run.cells.some((x) => x.r === preferredNova.r && x.c === preferredNova.c)) {
                    target = preferredNova;
                }
                novaSpawnCells.set(`${target.r},${target.c}`, run.kind);
            } else if (run.len >= 5) {
                purgedKindsSet.add(run.kind);
            }
        }

        // 5-match clears all of that color on the board
        if (purgedKindsSet.size > 0) {
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    const g = state.grid[r][c];
                    if (g && purgedKindsSet.has(g.kind)) {
                        toClear.add(`${r},${c}`);
                    }
                }
            }
        }

        // Trigger any Nova Row Clear gems caught in cleared set (chain reaction!)
        let expanded = true;
        while (expanded) {
            expanded = false;
            for (const key of Array.from(toClear)) {
                const [rStr, cStr] = key.split(',');
                const r = parseInt(rStr, 10);
                const c = parseInt(cStr, 10);
                const g = state.grid[r][c];
                if (g && g.special === 'nova_row' && !novaRowsSet.has(r)) {
                    novaRowsSet.add(r);
                    for (let cc = 0; cc < N; cc++) {
                        const nk = `${r},${cc}`;
                        if (!toClear.has(nk)) {
                            toClear.add(nk);
                            expanded = true;
                        }
                    }
                }
            }
        }

        const cleared: Array<{ r: number; c: number; kind: number; special: GemSpecial }> = [];
        const spawnedNova: Coord[] = [];

        for (const key of toClear) {
            const [rStr, cStr] = key.split(',');
            const r = parseInt(rStr, 10);
            const c = parseInt(cStr, 10);
            const g = state.grid[r][c];
            if (g) {
                cleared.push({ r, c, kind: g.kind, special: g.special });
            }
            if (novaSpawnCells.has(key)) {
                const kind = novaSpawnCells.get(key)!;
                state.grid[r][c] = { kind, special: 'nova_row', uid: state.nextUid++ };
                spawnedNova.push({ r, c });
            } else {
                state.grid[r][c] = null;
            }
        }

        // Gravity drop and top refill
        for (let c = 0; c < N; c++) {
            let writeR = N - 1;
            for (let r = N - 1; r >= 0; r--) {
                if (state.grid[r][c] !== null) {
                    if (writeR !== r) {
                        state.grid[writeR][c] = state.grid[r][c];
                        state.grid[r][c] = null;
                    }
                    writeR--;
                }
            }
            for (let r = writeR; r >= 0; r--) {
                const rr = nextRand(state.rngState);
                state.rngState = rr.next;
                const kind = Math.floor(rr.val * state.typesCount);
                state.grid[r][c] = { kind, special: 'none', uid: state.nextUid++ };
            }
        }

        const mult = 1 + (state.combo - 1) * 0.5;
        const basePts = cleared.length * 35 + novaRowsSet.size * 120 + purgedKindsSet.size * 220;
        const scoreGain = Math.round(basePts * mult);
        state.score += scoreGain;

        let shuffled = false;
        if (findMatchRuns(state.grid).length === 0 && !findValidMatch3Move(state.grid)) {
            shuffleMatch3Board(state);
            shuffled = true;
        }

        return {
            hadMatches: true,
            cleared,
            novaRows: Array.from(novaRowsSet),
            purgedKinds: Array.from(purgedKindsSet),
            spawnedNova,
            scoreGain,
            combo: state.combo,
            shuffled
        };
    }

    // ========================================================================
    // 7. LIGHTS OUT ARRAY (10 Solvable Levels + GF(2) Solver)
    // ========================================================================
    function buildSeededLightsOutLevels(): LightsOutLevelDef[] {
        const specs: Array<{ size: number; clicks: number; name: string }> = [
            { size: 4, clicks: 3,  name: 'Beacon Sync 4x4' },
            { size: 4, clicks: 5,  name: 'Subgrid Alpha' },
            { size: 4, clicks: 7,  name: 'Phase Array 4x4' },
            { size: 5, clicks: 5,  name: 'Relay Matrix 5x5' },
            { size: 5, clicks: 7,  name: 'Pulse Grid 5x5' },
            { size: 5, clicks: 9,  name: 'Ion Transponder' },
            { size: 5, clicks: 11, name: 'Warp Harmonic' },
            { size: 6, clicks: 7,  name: 'Deep Space 6x6' },
            { size: 6, clicks: 10, name: 'Quasar Array 6x6' },
            { size: 6, clicks: 13, name: 'Omega Telemetry' }
        ];
        return specs.map((sp, idx) => {
            let rng = (7301 + idx * 919) | 0;
            const chosen = new Set<string>();
            const seedMoves: Coord[] = [];
            while (seedMoves.length < sp.clicks) {
                const rr1 = nextRand(rng);
                const rr2 = nextRand(rr1.next);
                rng = rr2.next;
                const r = Math.floor(rr1.val * sp.size);
                const c = Math.floor(rr2.val * sp.size);
                const k = `${r},${c}`;
                if (!chosen.has(k)) {
                    chosen.add(k);
                    seedMoves.push({ r, c });
                }
            }
            return {
                id: idx + 1,
                name: sp.name,
                size: sp.size,
                par: sp.clicks + 1,
                seedMoves
            };
        });
    }

    const LIGHTS_OUT_LEVELS: LightsOutLevelDef[] = buildSeededLightsOutLevels();

    function applyCrossToggle(grid: boolean[][], r: number, c: number): void {
        const N = grid.length;
        const pts: Coord[] = [{ r, c }];
        if (r > 0) pts.push({ r: r - 1, c });
        if (r + 1 < N) pts.push({ r: r + 1, c });
        if (c > 0) pts.push({ r, c: c - 1 });
        if (c + 1 < N) pts.push({ r, c: c + 1 });
        for (const p of pts) grid[p.r][p.c] = !grid[p.r][p.c];
    }

    function createLightsOutState(levelIndex: number): LightsOutState {
        const idx = clampLevelIndex(levelIndex, LIGHTS_OUT_LEVELS.length);
        const def = LIGHTS_OUT_LEVELS[idx];
        // Start from ALL ON (true), apply deterministic valid moves so 100% solvable
        const grid: boolean[][] = Array.from({ length: def.size }, () =>
            new Array<boolean>(def.size).fill(true)
        );
        for (const mv of def.seedMoves) {
            applyCrossToggle(grid, mv.r, mv.c);
        }
        return {
            levelIndex: idx,
            name: def.name,
            size: def.size,
            par: def.par,
            moves: 0,
            grid,
            undoStack: []
        };
    }

    function toggleLightsOut(state: LightsOutState, r: number, c: number): boolean {
        if (r < 0 || r >= state.size || c < 0 || c >= state.size) return false;
        state.undoStack.push({ r, c, moves: state.moves });
        applyCrossToggle(state.grid, r, c);
        state.moves++;
        return true;
    }

    function undoLightsOut(state: LightsOutState): boolean {
        const last = state.undoStack.pop();
        if (!last) return false;
        applyCrossToggle(state.grid, last.r, last.c);
        state.moves = last.moves;
        return true;
    }

    function isLightsOutSolved(state: LightsOutState): boolean {
        for (let r = 0; r < state.size; r++) {
            for (let c = 0; c < state.size; c++) {
                if (!state.grid[r][c]) return false;
            }
        }
        return true;
    }

    function solveLightsOutGF2(grid: boolean[][]): Coord[] {
        const N = grid.length;
        const M = N * N;
        // Build M x (M + 1) augmented matrix over GF(2) using bigint bitmasks
        const rows: bigint[] = [];
        const rhsBit = BigInt(M);
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                let rowMask = 0n;
                const vars: Coord[] = [{ r, c }];
                if (r > 0) vars.push({ r: r - 1, c });
                if (r + 1 < N) vars.push({ r: r + 1, c });
                if (c > 0) vars.push({ r, c: c - 1 });
                if (c + 1 < N) vars.push({ r, c: c + 1 });
                for (const v of vars) {
                    rowMask |= (1n << BigInt(v.r * N + v.c));
                }
                // Goal is ALL true (1), so rhs = 1 XOR current(r, c)
                if (!grid[r][c]) {
                    rowMask |= (1n << rhsBit);
                }
                rows.push(rowMask);
            }
        }

        const pivotCols: number[] = new Array<number>(M).fill(-1);
        let pivotRow = 0;
        for (let col = 0; col < M && pivotRow < M; col++) {
            const bit = 1n << BigInt(col);
            let sel = -1;
            for (let r = pivotRow; r < M; r++) {
                if ((rows[r] & bit) !== 0n) {
                    sel = r;
                    break;
                }
            }
            if (sel < 0) continue;
            const tmp = rows[pivotRow];
            rows[pivotRow] = rows[sel];
            rows[sel] = tmp;
            pivotCols[pivotRow] = col;
            for (let r = 0; r < M; r++) {
                if (r !== pivotRow && (rows[r] & bit) !== 0n) {
                    rows[r] ^= rows[pivotRow];
                }
            }
            pivotRow++;
        }

        const baseSol = new Array<number>(M).fill(0);
        const isPivot = new Array<boolean>(M).fill(false);
        for (let r = 0; r < pivotRow; r++) {
            const col = pivotCols[r];
            if (col >= 0) {
                isPivot[col] = true;
                baseSol[col] = (rows[r] & (1n << rhsBit)) !== 0n ? 1 : 0;
            }
        }
        const freeCols: number[] = [];
        for (let c = 0; c < M; c++) {
            if (!isPivot[c]) freeCols.push(c);
        }

        let bestSol = baseSol;
        let bestWeight = baseSol.reduce((acc, v) => acc + v, 0);
        if (freeCols.length > 0 && freeCols.length <= 8) {
            const combos = 1 << freeCols.length;
            for (let mask = 1; mask < combos; mask++) {
                const cand = baseSol.slice();
                for (let f = 0; f < freeCols.length; f++) {
                    if ((mask & (1 << f)) !== 0) {
                        const fc = freeCols[f];
                        cand[fc] = 1;
                        const fcBit = 1n << BigInt(fc);
                        for (let r = 0; r < pivotRow; r++) {
                            if ((rows[r] & fcBit) !== 0n) {
                                cand[pivotCols[r]] ^= 1;
                            }
                        }
                    }
                }
                const w = cand.reduce((acc, v) => acc + v, 0);
                if (w < bestWeight) {
                    bestWeight = w;
                    bestSol = cand;
                }
            }
        }

        const moves: Coord[] = [];
        for (let i = 0; i < M; i++) {
            if (bestSol[i] === 1) moves.push({ r: Math.floor(i / N), c: i % N });
        }
        return moves;
    }

    // ========================================================================
    // 8. MEMORY STAR MATRIX (6 Progressive Levels 4x3 .. 6x4)
    // ========================================================================
    const MEMORY_LEVELS: MemoryLevelDef[] = [
        { id: 1, name: 'Scout Sector (4x3)',   rows: 3, cols: 4, parMoves: 9 },
        { id: 2, name: 'Orbital Pair (4x4)',   rows: 4, cols: 4, parMoves: 13 },
        { id: 3, name: 'Nebula Vault (5x4)',   rows: 4, cols: 5, parMoves: 17 },
        { id: 4, name: 'Starship Deck (5x4)',  rows: 4, cols: 5, parMoves: 15 },
        { id: 5, name: 'Hypermatrix (6x4)',    rows: 4, cols: 6, parMoves: 21 },
        { id: 6, name: 'Omega Archive (6x4)',  rows: 4, cols: 6, parMoves: 18 }
    ];

    const MEMORY_SPRITE_KEYS: string[] = [
        'cryo_crystal',
        'energy_prism',
        'coin_star',
        'plasma_bomb',
        'shield_battery',
        'portal_vortex',
        'astronaut',
        'cargo_crate',
        'warp_ring',
        'alien_drone',
        'ufo',
        'fighter',
        'moon_lander',
        'laser_turret',
        'boss_core',
        'asteroid'
    ];

    function createMemoryState(levelIndex: number, seed = Date.now()): MemoryState {
        const idx = clampLevelIndex(levelIndex, MEMORY_LEVELS.length);
        const def = MEMORY_LEVELS[idx];
        const totalCards = def.rows * def.cols;
        const totalPairs = totalCards / 2;
        let rng = seed | 0;

        const pool = MEMORY_SPRITE_KEYS.slice();
        for (let i = pool.length - 1; i > 0; i--) {
            const rr = nextRand(rng);
            rng = rr.next;
            const j = Math.floor(rr.val * (i + 1));
            const t = pool[i];
            pool[i] = pool[j];
            pool[j] = t;
        }
        const deckKeys: string[] = [];
        for (let p = 0; p < totalPairs; p++) {
            const sk = pool[p % pool.length];
            deckKeys.push(sk, sk);
        }
        for (let i = deckKeys.length - 1; i > 0; i--) {
            const rr = nextRand(rng);
            rng = rr.next;
            const j = Math.floor(rr.val * (i + 1));
            const t = deckKeys[i];
            deckKeys[i] = deckKeys[j];
            deckKeys[j] = t;
        }

        const cards: MemoryCard[] = deckKeys.map((spriteKey, id) => ({
            id,
            spriteKey,
            revealed: false,
            matched: false
        }));

        return {
            levelIndex: idx,
            name: def.name,
            rows: def.rows,
            cols: def.cols,
            parMoves: def.parMoves,
            moves: 0,
            streak: 0,
            bestStreak: 0,
            score: 0,
            matchedPairs: 0,
            totalPairs,
            firstPick: null,
            secondPick: null,
            mismatchPending: false,
            cards
        };
    }

    function pickMemoryCard(state: MemoryState, idx: number): MemoryPickResult {
        if (state.mismatchPending || idx < 0 || idx >= state.cards.length) {
            return { accepted: false, matched: false, mismatch: false, won: false, scoreGain: 0 };
        }
        const card = state.cards[idx];
        if (card.matched || card.revealed) {
            return { accepted: false, matched: false, mismatch: false, won: false, scoreGain: 0 };
        }
        card.revealed = true;
        if (state.firstPick === null) {
            state.firstPick = idx;
            return { accepted: true, matched: false, mismatch: false, won: false, scoreGain: 0 };
        }

        state.secondPick = idx;
        state.moves++;
        const first = state.cards[state.firstPick];
        if (first.spriteKey === card.spriteKey) {
            first.matched = true;
            card.matched = true;
            state.matchedPairs++;
            state.streak++;
            if (state.streak > state.bestStreak) state.bestStreak = state.streak;
            const scoreGain = 100 * state.streak;
            state.score += scoreGain;
            state.firstPick = null;
            state.secondPick = null;
            return {
                accepted: true,
                matched: true,
                mismatch: false,
                won: state.matchedPairs >= state.totalPairs,
                scoreGain
            };
        }

        state.streak = 0;
        state.mismatchPending = true;
        return { accepted: true, matched: false, mismatch: true, won: false, scoreGain: 0 };
    }

    function resolveMemoryMismatch(state: MemoryState): void {
        if (!state.mismatchPending) return;
        if (state.firstPick !== null) state.cards[state.firstPick].revealed = false;
        if (state.secondPick !== null) state.cards[state.secondPick].revealed = false;
        state.firstPick = null;
        state.secondPick = null;
        state.mismatchPending = false;
    }

    // ========================================================================
    // 9. NONOGRAM STAR MAP (8 Uniquely-Solvable Handcrafted Bitmaps)
    // ========================================================================
    function parseBitmap(rows: string[]): number[][] {
        return rows.map((s) => s.split('').map((ch) => (ch === '#' ? 1 : 0)));
    }

    const NONOGRAM_RAW: Array<{ id: number; name: string; rows: string[] }> = [
        {
            id: 1, name: 'Starfighter',
            rows: [
                '...#...',
                '..###..',
                '..###..',
                '.#####.',
                '#######',
                '.#.#.#.',
                '..#.#..'
            ]
        },
        {
            id: 2, name: 'Alien Drone',
            rows: [
                '..###..',
                '.#####.',
                '##.#.##',
                '#######',
                '.#####.',
                '.#...#.',
                '#.....#'
            ]
        },
        {
            id: 3, name: 'Moon Lander',
            rows: [
                '..###..',
                '.#####.',
                '.##.##.',
                '.#####.',
                '..###..',
                '.#.#.#.',
                '##...##'
            ]
        },
        {
            id: 4, name: 'Space Helmet',
            rows: [
                '..####..',
                '.######.',
                '#.####.#',
                '#.####.#',
                '#.####.#',
                '.######.',
                '..####..',
                '.######.'
            ]
        },
        {
            id: 5, name: 'Orbital Ring',
            rows: [
                '.....###',
                '....##.#',
                '..####..',
                '.###.#..',
                '###.##..',
                '##..###.',
                '#..####.',
                '###.....'
            ]
        },
        {
            id: 6, name: 'Comet',
            rows: [
                '.....###',
                '....####',
                '...#####',
                '..#####.',
                '.###.##.',
                '###.....',
                '##......',
                '#.......'
            ]
        },
        {
            id: 7, name: 'Asteroid',
            rows: [
                '..####...',
                '.######..',
                '###..###.',
                '########.',
                '####..###',
                '########.',
                '.#######.',
                '..#####..',
                '...###...'
            ]
        },
        {
            id: 8, name: 'Nova Crest',
            rows: [
                '....##....',
                '....##....',
                '..######..',
                '.##.##.##.',
                '##########',
                '##########',
                '.##.##.##.',
                '..######..',
                '....##....',
                '...####...'
            ]
        }
    ];

    const NONOGRAM_LEVELS: NonogramLevelDef[] = NONOGRAM_RAW.map((item) => {
        const bitmap = parseBitmap(item.rows);
        return {
            id: item.id,
            name: item.name,
            rows: bitmap.length,
            cols: bitmap[0].length,
            bitmap
        };
    });

    function computeLineClues(line: number[]): number[] {
        const res: number[] = [];
        let run = 0;
        for (const v of line) {
            if (v === 1) run++;
            else if (run > 0) {
                res.push(run);
                run = 0;
            }
        }
        if (run > 0) res.push(run);
        return res.length > 0 ? res : [0];
    }

    function createNonogramState(levelIndex: number): NonogramState {
        const idx = clampLevelIndex(levelIndex, NONOGRAM_LEVELS.length);
        const def = NONOGRAM_LEVELS[idx];
        const rowClues = def.bitmap.map((row) => computeLineClues(row));
        const colClues = Array.from({ length: def.cols }, (_, c) =>
            computeLineClues(def.bitmap.map((row) => row[c]))
        );
        const board: NonogramMark[][] = Array.from({ length: def.rows }, () =>
            new Array<NonogramMark>(def.cols).fill(0)
        );
        return {
            levelIndex: idx,
            name: def.name,
            rows: def.rows,
            cols: def.cols,
            solution: def.bitmap.map((r) => r.slice()),
            board,
            rowClues,
            colClues,
            moves: 0,
            undoStack: []
        };
    }

    function arraysEqual(a: number[], b: number[]): boolean {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
        return true;
    }

    function computeGroupMatch(line: NonogramMark[], clues: number[]): { lineDone: boolean; groupDone: boolean[] } {
        const filled = line.map((v) => (v === 1 ? 1 : 0));
        const actual = computeLineClues(filled);
        if (arraysEqual(actual, clues)) {
            return { lineDone: true, groupDone: clues.map(() => true) };
        }
        // Prefix & suffix anchored group completion check
        const groupDone = clues.map(() => false);
        // Forward from left while cells are either filled or crossed (known)
        let pos = 0;
        let g = 0;
        while (pos < line.length && g < clues.length) {
            while (pos < line.length && line[pos] === 2) pos++;
            if (pos >= line.length || line[pos] !== 1) break;
            let len = 0;
            while (pos < line.length && line[pos] === 1) { len++; pos++; }
            if (len === clues[g] && (pos === line.length || line[pos] === 2)) {
                groupDone[g] = true;
                g++;
            } else {
                break;
            }
        }
        // Backward from right
        pos = line.length - 1;
        g = clues.length - 1;
        while (pos >= 0 && g >= 0) {
            while (pos >= 0 && line[pos] === 2) pos--;
            if (pos < 0 || line[pos] !== 1) break;
            let len = 0;
            while (pos >= 0 && line[pos] === 1) { len++; pos--; }
            if (len === clues[g] && (pos < 0 || line[pos] === 2)) {
                groupDone[g] = true;
                g--;
            } else {
                break;
            }
        }
        return { lineDone: false, groupDone };
    }

    function autoCrossCompletedLines(state: NonogramState): Coord[] {
        const crossed: Coord[] = [];
        for (let r = 0; r < state.rows; r++) {
            const line = state.board[r];
            const res = computeGroupMatch(line, state.rowClues[r]);
            if (res.lineDone) {
                for (let c = 0; c < state.cols; c++) {
                    if (state.board[r][c] === 0) {
                        state.board[r][c] = 2;
                        crossed.push({ r, c });
                    }
                }
            }
        }
        for (let c = 0; c < state.cols; c++) {
            const line = state.board.map((row) => row[c]);
            const res = computeGroupMatch(line, state.colClues[c]);
            if (res.lineDone) {
                for (let r = 0; r < state.rows; r++) {
                    if (state.board[r][c] === 0) {
                        state.board[r][c] = 2;
                        crossed.push({ r, c });
                    }
                }
            }
        }
        return crossed;
    }

    function setNonogramCell(state: NonogramState, r: number, c: number, mark: NonogramMark): boolean {
        if (r < 0 || r >= state.rows || c < 0 || c >= state.cols) return false;
        if (state.board[r][c] === mark) return false;
        const prev = state.board[r][c];
        const prevMoves = state.moves;
        state.board[r][c] = mark;
        state.moves++;
        const autoCrossed = autoCrossCompletedLines(state);
        state.undoStack.push({ r, c, prev, moves: prevMoves, autoCrossed });
        return true;
    }

    function undoNonogram(state: NonogramState): boolean {
        const last = state.undoStack.pop();
        if (!last) return false;
        if (last.autoCrossed) {
            for (const p of last.autoCrossed) {
                state.board[p.r][p.c] = 0;
            }
        }
        state.board[last.r][last.c] = last.prev;
        state.moves = last.moves;
        return true;
    }

    function getNonogramClueStatus(state: NonogramState): NonogramClueStatus {
        const rowDone: boolean[] = [];
        const rowGroupDone: boolean[][] = [];
        for (let r = 0; r < state.rows; r++) {
            const m = computeGroupMatch(state.board[r], state.rowClues[r]);
            rowDone.push(m.lineDone);
            rowGroupDone.push(m.groupDone);
        }
        const colDone: boolean[] = [];
        const colGroupDone: boolean[][] = [];
        for (let c = 0; c < state.cols; c++) {
            const line = state.board.map((row) => row[c]);
            const m = computeGroupMatch(line, state.colClues[c]);
            colDone.push(m.lineDone);
            colGroupDone.push(m.groupDone);
        }
        return { rowDone, colDone, rowGroupDone, colGroupDone };
    }

    function isNonogramSolved(state: NonogramState): boolean {
        for (let r = 0; r < state.rows; r++) {
            const filled = state.board[r].map((v) => (v === 1 ? 1 : 0));
            if (!arraysEqual(computeLineClues(filled), state.rowClues[r])) return false;
        }
        for (let c = 0; c < state.cols; c++) {
            const filled = state.board.map((row) => (row[c] === 1 ? 1 : 0));
            if (!arraysEqual(computeLineClues(filled), state.colClues[c])) return false;
        }
        return true;
    }

    function getNonogramHint(state: NonogramState): Coord | null {
        // First fix any wrongly filled cell
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                if (state.board[r][c] === 1 && state.solution[r][c] === 0) return { r, c };
            }
        }
        // Then reveal an unrevealed target cell
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                if (state.solution[r][c] === 1 && state.board[r][c] !== 1) return { r, c };
            }
        }
        return null;
    }

    function genNonogramConfigs(len: number, clues: number[]): number[][] {
        if (clues.length === 1 && clues[0] === 0) return [new Array<number>(len).fill(0)];
        const out: number[][] = [];
        const k = clues.length;
        function dfs(idx: number, pos: number, arr: number[]): void {
            if (idx === k) {
                out.push(arr.slice());
                return;
            }
            const block = clues[idx];
            let minRest = 0;
            for (let j = idx + 1; j < k; j++) minRest += clues[j] + 1;
            const maxStart = len - pos - block - minRest;
            for (let s = 0; s <= maxStart; s++) {
                const next = arr.slice();
                for (let t = pos + s; t < pos + s + block; t++) next[t] = 1;
                dfs(idx + 1, pos + s + block + (idx + 1 < k ? 1 : 0), next);
            }
        }
        dfs(0, 0, new Array<number>(len).fill(0));
        return out;
    }

    function verifyNonogramUnique(levelIndex: number): { solutions: number; lineSolvable: boolean } {
        const idx = clampLevelIndex(levelIndex, NONOGRAM_LEVELS.length);
        const def = NONOGRAM_LEVELS[idx];
        const R = def.rows;
        const C = def.cols;
        const rowOpts = def.bitmap.map((row) => genNonogramConfigs(C, computeLineClues(row)));
        const colOpts = Array.from({ length: C }, (_, c) =>
            genNonogramConfigs(R, computeLineClues(def.bitmap.map((r) => r[c])))
        );
        const grid: number[][] = Array.from({ length: R }, () => new Array<number>(C).fill(-1));

        function propagate(): boolean {
            let changed = true;
            while (changed) {
                changed = false;
                for (let r = 0; r < R; r++) {
                    const valid = rowOpts[r].filter((cfg) => {
                        for (let c = 0; c < C; c++) if (grid[r][c] !== -1 && grid[r][c] !== cfg[c]) return false;
                        return true;
                    });
                    if (valid.length === 0) return false;
                    for (let c = 0; c < C; c++) {
                        if (grid[r][c] !== -1) continue;
                        const v0 = valid[0][c];
                        if (valid.every((cfg) => cfg[c] === v0)) {
                            grid[r][c] = v0;
                            changed = true;
                        }
                    }
                }
                for (let c = 0; c < C; c++) {
                    const valid = colOpts[c].filter((cfg) => {
                        for (let r = 0; r < R; r++) if (grid[r][c] !== -1 && grid[r][c] !== cfg[r]) return false;
                        return true;
                    });
                    if (valid.length === 0) return false;
                    for (let r = 0; r < R; r++) {
                        if (grid[r][c] !== -1) continue;
                        const v0 = valid[0][r];
                        if (valid.every((cfg) => cfg[r] === v0)) {
                            grid[r][c] = v0;
                            changed = true;
                        }
                    }
                }
            }
            return true;
        }

        const lineSolvable = propagate() && grid.every((r) => r.every((v) => v !== -1));
        if (lineSolvable) return { solutions: 1, lineSolvable: true };

        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) grid[r][c] = -1;
        let solCount = 0;
        function search(): void {
            if (solCount >= 2) return;
            const snap = grid.map((r) => r.slice());
            if (!propagate()) {
                for (let r = 0; r < R; r++) grid[r] = snap[r];
                return;
            }
            let ur = -1, uc = -1;
            for (let r = 0; r < R && ur < 0; r++) {
                for (let c = 0; c < C; c++) {
                    if (grid[r][c] === -1) { ur = r; uc = c; break; }
                }
            }
            if (ur < 0) {
                solCount++;
            } else {
                for (const v of [1, 0]) {
                    grid[ur][uc] = v;
                    search();
                    if (solCount >= 2) break;
                }
            }
            for (let r = 0; r < R; r++) grid[r] = snap[r];
        }
        search();
        return { solutions: solCount, lineSolvable: false };
    }

    // ========================================================================
    // 10. HANOI WARP CORES (5 Levels: 3 to 7 Rings)
    // ========================================================================
    const HANOI_LEVELS: HanoiLevelDef[] = [
        { id: 1, name: '3-Ring Relay',      disks: 3, optimal: 7 },
        { id: 2, name: '4-Ring Core',       disks: 4, optimal: 15 },
        { id: 3, name: '5-Ring Capacitor',  disks: 5, optimal: 31 },
        { id: 4, name: '6-Ring Reactor',    disks: 6, optimal: 63 },
        { id: 5, name: '7-Ring Singularity', disks: 7, optimal: 127 }
    ];

    function createHanoiState(levelIndex: number): HanoiState {
        const idx = clampLevelIndex(levelIndex, HANOI_LEVELS.length);
        const def = HANOI_LEVELS[idx];
        const peg0: number[] = [];
        for (let d = def.disks; d >= 1; d--) peg0.push(d);
        return {
            levelIndex: idx,
            name: def.name,
            disks: def.disks,
            optimal: (1 << def.disks) - 1,
            moves: 0,
            pegs: [peg0, [], []],
            undoStack: []
        };
    }

    function moveHanoiDisk(state: HanoiState, fromPeg: number, toPeg: number): boolean {
        if (fromPeg === toPeg || fromPeg < 0 || fromPeg > 2 || toPeg < 0 || toPeg > 2) return false;
        const src = state.pegs[fromPeg];
        const dst = state.pegs[toPeg];
        if (src.length === 0) return false;
        const disk = src[src.length - 1];
        if (dst.length > 0 && dst[dst.length - 1] < disk) return false;
        state.undoStack.push({ from: fromPeg, to: toPeg, moves: state.moves });
        src.pop();
        dst.push(disk);
        state.moves++;
        return true;
    }

    function undoHanoi(state: HanoiState): boolean {
        const last = state.undoStack.pop();
        if (!last) return false;
        const disk = state.pegs[last.to].pop();
        if (disk !== undefined) state.pegs[last.from].push(disk);
        state.moves = last.moves;
        return true;
    }

    function isHanoiWon(state: HanoiState): boolean {
        return state.pegs[2].length === state.disks;
    }

    function getHanoiOptimalHint(state: HanoiState): { from: number; to: number } | null {
        // Recursive optimal next move from arbitrary valid state toward peg 2
        const pos = new Array<number>(state.disks + 1).fill(0);
        for (let p = 0; p < 3; p++) {
            for (const d of state.pegs[p]) pos[d] = p;
        }
        function nextMove(disk: number, targetPeg: number): { from: number; to: number } | null {
            if (disk <= 0) return null;
            const cur = pos[disk];
            if (cur === targetPeg) return nextMove(disk - 1, targetPeg);
            const aux = 3 - cur - targetPeg;
            const sub = nextMove(disk - 1, aux);
            if (sub) return sub;
            return { from: cur, to: targetPeg };
        }
        return nextMove(state.disks, 2);
    }

    // ========================================================================
    // 11. WASM CELLULAR CONTAINMENT (8 Blueprint Levels)
    // ========================================================================
    const CELLULAR_LEVELS: CellularLevelDef[] = [
        {
            id: 1, name: 'Airlock Alpha', wallsPerTurn: 2, parTurns: 3,
            grid: [
                '........',
                '..#..#..',
                '..#..#..',
                '...1....',
                '........',
                '..#..#..',
                '..#..#..',
                '........'
            ]
        },
        {
            id: 2, name: 'Cryo Corridor', wallsPerTurn: 2, parTurns: 5,
            grid: [
                '........',
                '.##..##.',
                '.#....#.',
                '...1....',
                '....1...',
                '.#....#.',
                '.##..##.',
                '........'
            ]
        },
        {
            id: 3, name: 'Reactor Bulkhead', wallsPerTurn: 3, parTurns: 5,
            grid: [
                '.........',
                '.#..#..#.',
                '.#.....#.',
                '...1.....',
                '....#....',
                '.....1...',
                '.#.....#.',
                '.#..#..#.',
                '.........'
            ]
        },
        {
            id: 4, name: 'Twin Breach Wing', wallsPerTurn: 3, parTurns: 3,
            grid: [
                '.........',
                '.##...##.',
                '.1.....1.',
                '....#....',
                '..#...#..',
                '....#....',
                '.........',
                '.##...##.',
                '.........'
            ]
        },
        {
            id: 5, name: 'Cargo Quarantine', wallsPerTurn: 3, parTurns: 3,
            grid: [
                '..........',
                '..#....#..',
                '..#....#..',
                '....11....',
                '..........',
                '.##....##.',
                '..........',
                '..#....#..',
                '..#....#..',
                '..........'
            ]
        },
        {
            id: 6, name: 'Command Deck', wallsPerTurn: 3, parTurns: 5,
            grid: [
                '..........',
                '.#..##..#.',
                '....1.....',
                '.#......#.',
                '...#..#...',
                '...#..#...',
                '.#......#.',
                '.....1....',
                '.#..##..#.',
                '..........'
            ]
        },
        {
            id: 7, name: 'Nexus Spire', wallsPerTurn: 3, parTurns: 5,
            grid: [
                '..........',
                '..##..##..',
                '.#......#.',
                '..1....1..',
                '....##....',
                '....##....',
                '..........',
                '.#......#.',
                '..##..##..',
                '..........'
            ]
        },
        {
            id: 8, name: 'Omega Containment', wallsPerTurn: 3, parTurns: 5,
            grid: [
                '..........',
                '.#.#..#.#.',
                '....1.....',
                '.#......#.',
                '..#.##.#..',
                '..........',
                '.#..1...#.',
                '..........',
                '.#.#..#.#.',
                '..........'
            ]
        }
    ];

    function createCellularState(levelIndex: number): CellularState {
        const idx = clampLevelIndex(levelIndex, CELLULAR_LEVELS.length);
        const def = CELLULAR_LEVELS[idx];
        const rows = def.grid.length;
        const cols = def.grid[0].length;
        const grid: CellularCell[][] = Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c): CellularCell => {
                const ch = def.grid[r][c];
                if (ch === '#') return 2;
                if (ch === '1') return 1;
                return 0;
            })
        );
        return {
            levelIndex: idx,
            name: def.name,
            rows,
            cols,
            wallsPerTurn: def.wallsPerTurn,
            parTurns: def.parTurns,
            turn: 1,
            wallsPlacedThisTurn: 0,
            grid,
            turnWallStack: []
        };
    }

    function placeCellularFirewall(state: CellularState, r: number, c: number): boolean {
        if (r < 0 || r >= state.rows || c < 0 || c >= state.cols) return false;
        // Toggle off a firewall placed during this same turn
        const existingIdx = state.turnWallStack.findIndex((p) => p.r === r && p.c === c);
        if (existingIdx >= 0) {
            state.turnWallStack.splice(existingIdx, 1);
            state.grid[r][c] = 0;
            state.wallsPlacedThisTurn = state.turnWallStack.length;
            return true;
        }
        if (state.wallsPlacedThisTurn >= state.wallsPerTurn) return false;
        if (state.grid[r][c] !== 0) return false;
        state.grid[r][c] = 3;
        state.turnWallStack.push({ r, c });
        state.wallsPlacedThisTurn = state.turnWallStack.length;
        return true;
    }

    function undoCellularFirewall(state: CellularState): boolean {
        const last = state.turnWallStack.pop();
        if (!last) return false;
        if (state.grid[last.r][last.c] === 3) {
            state.grid[last.r][last.c] = 0;
        }
        state.wallsPlacedThisTurn = state.turnWallStack.length;
        return true;
    }

    function computeCellularMetrics(state: CellularState): CellularMetrics {
        const R = state.rows;
        const C = state.cols;
        const visited = new Uint8Array(R * C);
        const queue: number[] = [];
        let infectedCount = 0;
        let walkableCount = 0;
        let firewallCount = 0;

        for (let r = 0; r < R; r++) {
            for (let c = 0; c < C; c++) {
                const v = state.grid[r][c];
                if (v !== 2) walkableCount++;
                if (v === 3) firewallCount++;
                if (v === 1) {
                    infectedCount++;
                    const idx = r * C + c;
                    visited[idx] = 1;
                    queue.push(idx);
                }
            }
        }

        let head = 0;
        let reachableEmpty = 0;
        while (head < queue.length) {
            const idx = queue[head++];
            const r = Math.floor(idx / C);
            const c = idx % C;
            const nbrs: number[] = [];
            if (r > 0) nbrs.push(idx - C);
            if (r + 1 < R) nbrs.push(idx + C);
            if (c > 0) nbrs.push(idx - 1);
            if (c + 1 < C) nbrs.push(idx + 1);
            for (const ni of nbrs) {
                if (visited[ni]) continue;
                const nr = Math.floor(ni / C);
                const nc = ni % C;
                const nv = state.grid[nr][nc];
                if (nv === 0 || nv === 1) {
                    visited[ni] = 1;
                    if (nv === 0) reachableEmpty++;
                    queue.push(ni);
                }
            }
        }

        const lossRatio = walkableCount > 0 ? infectedCount / walkableCount : 0;
        const lost = lossRatio >= 0.35;
        const won = !lost && reachableEmpty === 0;
        return { infectedCount, walkableCount, firewallCount, lossRatio, reachableEmpty, won, lost };
    }

    function stepCellularFallback(flatGrid: Uint8Array, rows: number, cols: number): Uint8Array {
        const next = new Uint8Array(flatGrid);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const i = r * cols + c;
                if (flatGrid[i] === 0) {
                    if (
                        (r > 0 && flatGrid[i - cols] === 1) ||
                        (r + 1 < rows && flatGrid[i + cols] === 1) ||
                        (c > 0 && flatGrid[i - 1] === 1) ||
                        (c + 1 < cols && flatGrid[i + 1] === 1)
                    ) {
                        next[i] = 1;
                    }
                }
            }
        }
        return next;
    }

    function applyCellularStepResult(state: CellularState, steppedFlat: Uint8Array): CellularMetrics {
        const R = state.rows;
        const C = state.cols;
        for (let r = 0; r < R; r++) {
            for (let c = 0; c < C; c++) {
                const cur = state.grid[r][c];
                // Preserve bulkheads (2) and cyan firewalls (3); update empty cells that became infected (1)
                if (cur === 0 && steppedFlat[r * C + c] === 1) {
                    state.grid[r][c] = 1;
                }
            }
        }
        state.turn++;
        state.turnWallStack = [];
        state.wallsPlacedThisTurn = 0;
        return computeCellularMetrics(state);
    }

    // ========================================================================
    // 12. ORBITAL SUDOKU MINI (6 Uniquely-Solvable 6x6 2x3-Box Hex Ciphers)
    // ========================================================================
    const SUDOKU_LEVELS: SudokuLevelDef[] = [
        {
            id: 1, name: 'Hex Cipher I', difficulty: 'Cadet',
            puzzle:   [2,0,5,6,3,1, 0,0,0,2,5,0, 4,1,0,3,0,5, 3,0,0,1,4,2, 0,3,1,0,2,6, 0,0,0,0,1,0],
            solution: [2,4,5,6,3,1, 1,6,3,2,5,4, 4,1,2,3,6,5, 3,5,6,1,4,2, 5,3,1,4,2,6, 6,2,4,5,1,3]
        },
        {
            id: 2, name: 'Hex Cipher II', difficulty: 'Pilot',
            puzzle:   [6,0,1,0,0,0, 0,0,2,0,5,6, 0,6,0,0,1,4, 0,2,4,0,6,5, 3,0,0,0,0,0, 2,0,6,5,0,3],
            solution: [6,5,1,4,3,2, 4,3,2,1,5,6, 5,6,3,2,1,4, 1,2,4,3,6,5, 3,4,5,6,2,1, 2,1,6,5,4,3]
        },
        {
            id: 3, name: 'Hex Cipher III', difficulty: 'Tactician',
            puzzle:   [6,0,0,0,1,0, 0,4,0,2,0,6, 5,1,0,0,0,0, 0,0,4,0,0,1, 0,0,1,0,0,3, 3,5,0,1,6,0],
            solution: [6,2,3,4,1,5, 1,4,5,2,3,6, 5,1,6,3,4,2, 2,3,4,6,5,1, 4,6,1,5,2,3, 3,5,2,1,6,4]
        },
        {
            id: 4, name: 'Hex Cipher IV', difficulty: 'Commander',
            puzzle:   [0,0,0,5,6,0, 0,0,0,0,0,2, 0,0,5,6,0,3, 0,2,6,0,5,0, 0,0,3,4,0,5, 0,0,0,0,3,0],
            solution: [4,3,2,5,6,1, 6,5,1,3,4,2, 1,4,5,6,2,3, 3,2,6,1,5,4, 2,6,3,4,1,5, 5,1,4,2,3,6]
        },
        {
            id: 5, name: 'Hex Cipher V', difficulty: 'Navigator',
            puzzle:   [6,0,5,3,0,1, 0,1,0,0,0,5, 4,3,1,0,0,0, 0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,2,0,5,4],
            solution: [6,4,5,3,2,1, 2,1,3,6,4,5, 4,3,1,5,6,2, 5,2,6,4,1,3, 1,5,4,2,3,6, 3,6,2,1,5,4]
        },
        {
            id: 6, name: 'Hex Cipher VI', difficulty: 'Grandmaster',
            puzzle:   [4,0,6,3,1,0, 0,2,0,0,0,0, 0,0,0,0,0,4, 3,1,0,2,0,0, 0,0,0,6,0,0, 0,0,0,0,5,0],
            solution: [4,5,6,3,1,2, 1,2,3,5,4,6, 2,6,5,1,3,4, 3,1,4,2,6,5, 5,4,1,6,2,3, 6,3,2,4,5,1]
        }
    ];

    function createSudokuState(levelIndex: number): SudokuState {
        const idx = clampLevelIndex(levelIndex, SUDOKU_LEVELS.length);
        const def = SUDOKU_LEVELS[idx];
        return {
            levelIndex: idx,
            name: def.name,
            difficulty: def.difficulty,
            given: def.puzzle.map((v) => v !== 0),
            board: def.puzzle.slice(),
            solution: def.solution.slice(),
            moves: 0,
            undoStack: []
        };
    }

    function setSudokuCell(state: SudokuState, r: number, c: number, val: number): boolean {
        if (r < 0 || r >= 6 || c < 0 || c >= 6) return false;
        const idx = r * 6 + c;
        if (state.given[idx]) return false;
        if (val < 0 || val > 6) return false;
        if (state.board[idx] === val) return false;
        state.undoStack.push({ idx, prev: state.board[idx], moves: state.moves });
        state.board[idx] = val;
        state.moves++;
        return true;
    }

    function undoSudoku(state: SudokuState): boolean {
        const last = state.undoStack.pop();
        if (!last) return false;
        state.board[last.idx] = last.prev;
        state.moves = last.moves;
        return true;
    }

    function getSudokuConflicts(board: number[]): boolean[] {
        const conflicts = new Array<boolean>(36).fill(false);
        for (let i = 0; i < 36; i++) {
            const v = board[i];
            if (v === 0) continue;
            const r = Math.floor(i / 6);
            const c = i % 6;
            const br = Math.floor(r / 2) * 2;
            const bc = Math.floor(c / 3) * 3;
            for (let k = 0; k < 6; k++) {
                if (k !== c && board[r * 6 + k] === v) {
                    conflicts[i] = true;
                    conflicts[r * 6 + k] = true;
                }
                if (k !== r && board[k * 6 + c] === v) {
                    conflicts[i] = true;
                    conflicts[k * 6 + c] = true;
                }
            }
            for (let dr = 0; dr < 2; dr++) {
                for (let dc = 0; dc < 3; dc++) {
                    const j = (br + dr) * 6 + (bc + dc);
                    if (j !== i && board[j] === v) {
                        conflicts[i] = true;
                        conflicts[j] = true;
                    }
                }
            }
        }
        return conflicts;
    }

    function isSudokuWon(state: SudokuState): boolean {
        for (let i = 0; i < 36; i++) {
            if (state.board[i] === 0) return false;
        }
        return getSudokuConflicts(state.board).every((x) => !x);
    }

    function getSudokuHint(state: SudokuState): { r: number; c: number; val: number } | null {
        for (let i = 0; i < 36; i++) {
            if (!state.given[i] && state.board[i] !== state.solution[i]) {
                return { r: Math.floor(i / 6), c: i % 6, val: state.solution[i] };
            }
        }
        return null;
    }

    function countSudokuSolutions(board: number[], limit = 2): number {
        const b = board.slice();
        function findEmpty(): { dead: boolean; idx: number; opts: number[] } {
            let bestIdx = -1;
            let bestOpts: number[] = [];
            for (let i = 0; i < 36; i++) {
                if (b[i] !== 0) continue;
                const r = Math.floor(i / 6);
                const c = i % 6;
                const br = Math.floor(r / 2) * 2;
                const bc = Math.floor(c / 3) * 3;
                const used = new Set<number>();
                for (let k = 0; k < 6; k++) {
                    used.add(b[r * 6 + k]);
                    used.add(b[k * 6 + c]);
                }
                for (let dr = 0; dr < 2; dr++) {
                    for (let dc = 0; dc < 3; dc++) {
                        used.add(b[(br + dr) * 6 + (bc + dc)]);
                    }
                }
                const opts: number[] = [];
                for (let v = 1; v <= 6; v++) if (!used.has(v)) opts.push(v);
                if (opts.length === 0) return { dead: true, idx: -1, opts: [] };
                if (bestIdx < 0 || opts.length < bestOpts.length) {
                    bestIdx = i;
                    bestOpts = opts;
                    if (opts.length === 1) break;
                }
            }
            return { dead: false, idx: bestIdx, opts: bestOpts };
        }
        let count = 0;
        function dfs(): void {
            if (count >= limit) return;
            const step = findEmpty();
            if (step.dead) return;
            if (step.idx < 0) {
                count++;
                return;
            }
            for (const v of step.opts) {
                b[step.idx] = v;
                dfs();
                b[step.idx] = 0;
                if (count >= limit) return;
            }
        }
        dfs();
        return count;
    }

    const CosmicPuzzleCore: CosmicPuzzleCoreAPI = {
        version: '11.0.0',
        computeStars,
        // 1. Sokoban
        SOKOBAN_LEVELS,
        createSokobanState,
        stepSokoban,
        undoSokoban,
        isSokobanWon,
        detectSokobanDeadlock,
        solveSokobanHint,
        verifySokobanLevel,
        // 2. Laser Mirror Grid
        LASER_LEVELS,
        createLaserState,
        toggleLaserCell,
        undoLaser,
        traceLasers,
        getLaserHint,
        // 3. Circuit Pipe Link
        PIPE_LEVELS,
        getPipePorts,
        createPipeState,
        rotatePipeCell,
        undoPipe,
        evalPipeFlow,
        getPipeHint,
        // 4. Quantum 2048
        ELEMENTS_2048,
        create2048State,
        slide2048,
        undo2048,
        has2048Moves,
        // 5. Nebula Minesweeper
        MINE_LEVELS,
        createMinesweeperState,
        revealMineCell,
        toggleMineFlag,
        chordMineCell,
        getMineHint,
        // 6. Match-3 Isotope Core
        MATCH3_LEVELS,
        MATCH3_SPRITE_KEYS,
        createMatch3State,
        findValidMatch3Move,
        tryMatch3Swap,
        resolveMatch3CascadeStep,
        shuffleMatch3Board,
        // 7. Lights Out Array
        LIGHTS_OUT_LEVELS,
        createLightsOutState,
        toggleLightsOut,
        undoLightsOut,
        isLightsOutSolved,
        solveLightsOutGF2,
        // 8. Memory Star Matrix
        MEMORY_LEVELS,
        MEMORY_SPRITE_KEYS,
        createMemoryState,
        pickMemoryCard,
        resolveMemoryMismatch,
        // 9. Nonogram Star Map
        NONOGRAM_LEVELS,
        computeLineClues,
        createNonogramState,
        setNonogramCell,
        undoNonogram,
        getNonogramClueStatus,
        isNonogramSolved,
        getNonogramHint,
        verifyNonogramUnique,
        // 10. Hanoi Warp Cores
        HANOI_LEVELS,
        createHanoiState,
        moveHanoiDisk,
        undoHanoi,
        isHanoiWon,
        getHanoiOptimalHint,
        // 11. WASM Cellular Containment
        CELLULAR_LEVELS,
        createCellularState,
        placeCellularFirewall,
        undoCellularFirewall,
        computeCellularMetrics,
        stepCellularFallback,
        applyCellularStepResult,
        // 12. Orbital Sudoku Mini
        SUDOKU_LEVELS,
        createSudokuState,
        setSudokuCell,
        undoSudoku,
        getSudokuConflicts,
        isSudokuWon,
        getSudokuHint,
        countSudokuSolutions
    };

    (root as unknown as { CosmicPuzzleCore: CosmicPuzzleCoreAPI }).CosmicPuzzleCore = CosmicPuzzleCore;
    if (typeof window !== 'undefined') {
        window.CosmicPuzzleCore = CosmicPuzzleCore;
    }
    if (typeof module !== 'undefined' && module && module.exports) {
        module.exports = CosmicPuzzleCore;
    }
})(typeof window !== 'undefined' ? window : globalThis);
