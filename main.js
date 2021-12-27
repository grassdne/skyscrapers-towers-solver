let north   = [0, 0, 0, 0]
let east    = [0, 0, 0, 0]
let south   = [0, 0, 0, 0]
let west    = [0, 0, 0, 0]

let size = 4;


let solution = [];


const strSolutions = []

const divSolutions = document.getElementById("solutions");


let htmlSolution;
let numSolutions;

const outline = document.getElementById("outline");

let outlineSights;

generateOutline();

setupOutlineSights();

function rangeSet(a, b) {
    const set = new Set();
    for (let i = a; i < b; ++i) {
        set.add(i);
    }
    return set;
}


function intersectionSet(a, b) {
    const _intersection = new Set()
    for (let elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem)
        }
    }
    return _intersection
}


class Skyscraper {
    constructor(value = 0) {
        this.height = value;
        this.possibilities = rangeSet(1, size+1);
    }
}

function eliminateImpossibilities() {
    for (let i = 0; i < size; ++i) {
        AtSightlineRemoveImpossibilities(north[i], walkNorthSightline(i))
        AtSightlineRemoveImpossibilities(east[i], walkEastSightline(i))
        AtSightlineRemoveImpossibilities(south[i], walkSouthSightline(i))
        AtSightlineRemoveImpossibilities(west[i], walkWestSightline(i))
    }

    while (removeBadPossiblities());
}

function removeBadPossiblities() {
    let useful = false;
    
    for (let i = 0; i < size; ++i) {
        for (let j = 0; j < size; ++j) {
            const skyscraper = solution[i][j];
            if (skyscraper.possibilities.size == 1 && !skyscraper.height) {
                useful = true;

                const height = skyscraper.possibilities.values().next().value;

                skyscraper.height = height;
                removePossibilityInRowColumn(height, i, j);
                skyscraper.possibilities = new Set([height]);
            }
        } 
    }

    return useful;
}

function removePossibilityInRowColumn(num, row, col) {
    for (let i = 0; i < size; ++i) {
        solution[row][i].possibilities.delete(num) 
        solution[i][col].possibilities.delete(num)
    }
}

function AtSightlineRemoveImpossibilities(numVisible, sightline) {
    if (!numVisible) return;

    if (numVisible == 1) {
        const skyscraper = sightline.next().value;
        skyscraper.possibilities = new Set([size]);
        // skyscraper.height = size;
        return;
    }

    for (let j = 0; j < size; ++j) {
        const skyscraper = sightline.next().value;
        for (let n = size - numVisible + j + 2; n <= size; ++n) {
            skyscraper.possibilities.delete(n);
        }
    }
}

function solve(rowStart = 0) {
    for (let i = rowStart; i < size; ++i) {
        for (let j = 0; j < size; ++j) {
            const tile = solution[i][j];
            if (tile.height) continue;

            for (let n of tile.possibilities) {
                if (tryPlaceSkyscraper(i, j, n)) {
                    solve(i)
                    tile.height = 0;
                }
            }
            return;
        }
    }
    htmlSolution.innerHTML = solutionHtmlString();
    
    console.log("solution found");
    numSolutions++;

    htmlSolution = document.createElement("table");
    htmlSolution.className = "board";

    divSolutions.appendChild(htmlSolution);

}

function initializeSolution() {
    solution = [];
    for (let i = 0; i < size; ++i) {
        solution[i] = [];
        for (let j = 0; j < size; ++j) {
            solution[i][j] = new Skyscraper();
        }
    }
}


function tryPlaceSkyscraper(row, col, val) {
    if (solution[row][col].height) return false;

    for (tile of solution[row]) {
        if (tile.height == val) {
            return false;
        }
    }
    if (Array.from(solution, x => x[col].height).includes(val)) {
        return false;
    }

    solution[row][col].height = val;
    

    if (northViewValid(col) 
        && eastViewValid(row) 
        && southViewValid(col) 
        && westViewValid(row)) {
            return true;
     }

     solution[row][col].height = 0;
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
    let tallest = 0;

    for (let tile of sightline) {
        if (!tile.height) return true;
        if (tile.height > tallest) {
            ++seen;
            tallest = tile.height;

        }
    }

    return seen == visibleGoal
}


function solutionHtmlTable() {
    const table = document.createElement("table");
    table.className = 'board';

    table.innerHTML = solutionHtmlString();
    return table;
}

function solutionHtmlString() {

    let s = '';
    for (let row of solution) {
        s += "<tr>";
        for (let tile of row) {
            s += "<td>"
            s += tile.height || '&nbsp;';
            s += '</td>'
        }
        s += '</tr>';
    }
    return s;
}

const solutionsFoundText = document.getElementById("solutions-found-text")

const solveButton = document.getElementById("solve-button")
solveButton.onclick = startSolving;


function startSolving() {
    enableSolveButton();
    solutionsFoundText.hidden = true;
    numSolutions = 0;

    console.time("Solving")
    initializeSolution();
    eliminateImpossibilities();

    htmlSolution = solutionHtmlTable();
    divSolutions.innerHTML = '';
    divSolutions.appendChild(htmlSolution);

    setTimeout(() => {
        solve()

        console.log("SOLVING COMPLETED")
        console.timeEnd("Solving")

        updateSolutionsFound()
        disableSolveButton();
    }, 0); 
}

function enableSolveButton() {
    solveButton.disabled = true;
    solveButton.innerText = "solving..."
}

function disableSolveButton() {
    solveButton.disabled = false;
    solveButton.innerText = "Solve!";
}

function updateSolutionsFound() {
    solutionsFoundText.innerHTML = `<b>${numSolutions}</b> complete solution${numSolutions == 1 ? '' : 's'} found.`;
    solutionsFoundText.hidden = false;
}


function setLength(newLen) {
    for (let i = size; i < newLen; ++i) {
        north[i] = 0;
        south[i] = 0;
        east[i] = 0;
        west[i] = 0;
    }
    for (let i = newLen; i < size; ++i) {
        north.pop();
        south.pop();
        east.pop();
        west.pop();
    }
    size = newLen;
    generateOutline();
    setupOutlineSights();
}

function setupOutlineSights() {
    outlineSights = outline.getElementsByClassName("sight");
    for (let i = 0; i < outlineSights.length; ++i) {
        let sight = outlineSights[i];
        sight.contentEditable = true;
        // sight.tabIndex = 1;
        sight.addEventListener("beforeinput", e => {
            e.preventDefault();
        })

        sight.addEventListener("keydown", (e) => {
            if (e.key == "Backspace") {
                sight.innerText = '';
            }
            const num = parseInt(e.key);

            if (!isNaN(num) && num && num <= size) {
                sight.innerText = num;
                (outlineSights[i+1] ?? solveButton).focus()
            }
        }, true);
    }
}

function setSight(direction, index, value) {
    direction[index] = parseInt(value) || 0;
}

function generateOutline() {
    let s = '';

    s += `<tbody>`

    /*****************************************************/

      +  `  <tr>
            <td class="noborder"></td>`

    for (let i = 0; i < size; ++i) {
        s += `<td class="sight" onkeydown="setSight(north, ${i}, this.innerText);">${north[i] || ''}</td>`
    }
    s += `    <td class="noborder"></td>
            </tr>`

    /*****************************************************/

    for (let i = 0; i < size; ++i) {
        s += `<tr>
                <td class="sight" onkeydown="setSight(west, ${i}, this.innerText)">${west[i] || ''}</td>
                <td colspan="${size}" class="noborder"></td>
                <td class="sight" onkeydown="setSight(east, ${i}, this.innerText)">${east[i] || ''}</td>
              </tr>`
    }

    /*****************************************************/

    s += `  <tr>
              <td class="noborder"></td>`

    for (let i = 0; i < size; ++i) {
        s += `<td class="sight" onkeydown="setSight(south, ${i}, this.innerText)">${south[i] || ''}</td>`
    }
    s += `    <td class="noborder"></td>
            </tr>`
    
    /*****************************************************/

      +  `</tbody>`

    outline.innerHTML = s;
}