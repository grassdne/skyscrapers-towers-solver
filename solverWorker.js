let north;
let east;
let south;
let west;

let startingTowers;

let size;

let solution;


class Skyscraper {
    constructor(possibilities) {
        this.height = 0;
        this.possibilities = possibilities ?? rangeSet(1, size+1);
    }
}


onmessage = function (e) {
    const data = e.data;
    north = data.north;
    east = data.east;
    south = data.south;
    west = data.west;
    startingTowers = data.startingTowers

    size = north.length;

    startSolving();
}

function startSolving() {
    initializeSolution()
    mitigateImpossibilities()

    postMessage({
        type: "NEW",
        solution: solution,
    })

    solve()

    postMessage({
        type: "DONE",
    })
}



function rangeSet(a, b) {
    const set = []
    for (; a < b; ++a) {
        set[a] = true;
    }
    return set;
}

function singleSet(x) {
    const set = []
    set[x] = 1;
    return set;
}


function mitigateImpossibilities() {
    for (let i = 0; i < size; ++i) {
        AtSightlineRemoveImpossibilities(north[i], walkNorthSightline(i))
        AtSightlineRemoveImpossibilities(east[i], walkEastSightline(i))
        AtSightlineRemoveImpossibilities(south[i], walkSouthSightline(i))
        AtSightlineRemoveImpossibilities(west[i], walkWestSightline(i))
    }

    while (removeBadPossiblities());
}

function countTrueElems(possibilities) {
    let n = 0
    for (let i = 1; i <= size; ++i) {
        if (possibilities[i] > 0) {
            ++n;
        }
    }
    return n;
}


function removeBadPossiblities() {
    let useful = false;
    
    for (let i = 0; i < size; ++i) {
        for (let j = 0; j < size; ++j) {
            const skyscraper = solution[i][j];
            if (countTrueElems(skyscraper.possibilities) == 1 && !skyscraper.height) {
                useful = true;

                const height = skyscraper.possibilities.findIndex((x) => x > 0)

                skyscraper.height = height;
                removePossibilityInRowColumn(height, i, j);
                skyscraper.possibilities[height] = 1;
            }
        } 
    }

    return useful;
}

function removePossibilityInRowColumn(num, row, col) {
    for (let i = 0; i < size; ++i) {
        --solution[row][i].possibilities[num]
        --solution[i][col].possibilities[num]
    }
}

function addPossibilitiyInRowColumn(num, row, col) {
    for (let i = 0; i < size; ++i) {
        ++solution[row][i].possibilities[num]
        ++solution[i][col].possibilities[num]
    }
}

function AtSightlineRemoveImpossibilities(numVisible, sightline) {
    if (!numVisible) return;

    if (numVisible == 1) {
        const skyscraper = sightline.next().value;
        skyscraper.possibilities = [];
        skyscraper.possibilities[size] = 1;
        return;
    }

    for (let j = 0; j < size; ++j) {
        const skyscraper = sightline.next().value;
        for (let n = size - numVisible + j + 2; n <= size; ++n) {
            skyscraper.possibilities[n] = 0;
        }
    }
}

let lastUpdateTime = 0

function solve(rowStart = 0) {
    for (let i = rowStart; i < size; ++i) {
        for (let j = 0; j < size; ++j) {
            const tile = solution[i][j];
            if (tile.height) continue;

            for (let n = 1; n <= size; ++n) {
                if (tile.possibilities[n] > 0 && tryPlaceSkyscraper(i, j, n)) {
                    solve(i)

                    addPossibilitiyInRowColumn(n, i, j);
                    tile.height = 0;
                }
            }
            // console.log("test1")
            if (Date.now() - lastUpdateTime > 100) {
                lastUpdateTime = Date.now()
                postMessage({
                    type: "UPDATE",
                    solution: solution,
                })
            }
        
            return;
        }
    }

    postMessage({
        type: "UPDATE",
        solution: solution,
    })

    postMessage({
        type: "NEW",
        solution: solution,
    })

}

function initializeSolution() {
    solution = [];
    for (let i = 0; i < size; ++i) {
        solution[i] = [];
        for (let j = 0; j < size; ++j) {
            const startingVal = startingTowers[i*size+j]
            solution[i][j] = new Skyscraper(startingVal ? singleSet(startingVal) : rangeSet(1, size+1))
        }
    }
}


function tryPlaceSkyscraper(row, col, val) {

    solution[row][col].height = val;
    removePossibilityInRowColumn(val, row, col)
    

    if (northViewValid(col) 
        && eastViewValid(row) 
        && southViewValid(col) 
        && westViewValid(row)) {
            return true;
     }

     solution[row][col].height = 0;
     addPossibilitiyInRowColumn(val, row, col)
     return false;  
}

function northViewValid(col) {
    return isValidSightline(north[col], walkNorthSightline(col));
}

function southViewValid(col) {
    return isValidSightline(south[col], walkSouthSightline(col));
}

function westViewValid(row) {
    return isValidSightline(west[row], walkWestSightline(row));
}

function eastViewValid(row) {
    return isValidSightline(east[row], walkEastSightline(row));
}

function *walkSouthSightline(col) {
    for (let i = size-1; i >= 0; --i) {
        yield solution[i][col];
    }
}

function *walkNorthSightline(col) {
    for (let i = 0; i < size; ++i) {
        yield solution[i][col];
    }
}

function *walkEastSightline(row) {
    for (let i = size-1; i >= 0; --i) {
        yield solution[row][i];
    }
}

function *walkWestSightline(row) {
    for (let i = 0; i < size; ++i) {
        yield solution[row][i];
    }
}

function isValidSightline(visibleGoal, sightline) {
    if (!visibleGoal) return true;

    let seen = 0;
    let tallest = 0

    for (let tile of sightline) {
        if (!tile.height) return true;

        if (tile.height > tallest) {
            ++seen;
            if (seen > visibleGoal) {
                return false
            }
            tallest = tile.height;
        }

        if (tile.height == size) break;
    }

    return seen == visibleGoal;
}




