let north   = [0, 0, 0, 0, 0]
let east    = [0, 0, 0, 0, 0]
let south   = [0, 0, 0, 0, 0]
let west    = [0, 0, 0, 0, 0]

let size = 5;
let oldsize;

const divSolutions = document.getElementById("solutions");


let htmlSolution;

const outline = document.getElementById("outline");

let numSolutions;

let outlineSights;
let towerInputs;

generateOutline();

setupOutline()


function appendNewSolutionHtml(solution) {
    const table = document.createElement("table");
    table.className = 'board';

    table.innerHTML = solutionHtmlString(solution);
    console.log(table.innerHTML);

    divSolutions.appendChild(table);
}

function solutionHtmlString(solution) {

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
    disableSolveButton();
    solutionsFoundText.hidden = true;
    numSolutions = 0;
    divSolutions.innerHTML = '';

    console.time("Solving")

    let solverWorker = new Worker("solverWorker.js")
    solverWorker.postMessage({
        north: north,
        east: east,
        south: south,
        west: west,
        startingTowers: Array.from(towerInputs, elem => parseInt(elem.innerText) || 0)
    })

    solverWorker.onmessage = (e) => {
        const data = e.data;
        switch (data.type) {
            case "UPDATE": 
                // console.log("updating solution");
                const tbls = divSolutions.children;
                tbls[tbls.length-1].innerHTML = solutionHtmlString(data.solution)
                break;

            case "NEW":
                console.log("new solution");
                appendNewSolutionHtml(data.solution)  
                numSolutions++;
                break;

            case "DONE":
                console.log("SOLVING COMPLETED")
                console.timeEnd("Solving")
                enableSolveButton();
                updateSolutionsFound()
                solverWorker.terminate();
                break;
        }
    }
}

function disableSolveButton() {
    solveButton.disabled = true;
    solveButton.innerText = "solving..."
}

function enableSolveButton() {
    solveButton.disabled = false;
    solveButton.innerText = "Solve!";
}

function updateSolutionsFound() {
    divSolutions.children[divSolutions.children.length-1].remove()
    --numSolutions;
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
    oldsize = size;
    size = newLen;
    generateOutline();
    setupOutline();
}


function setupOutline() {
    outlineSights = outline.getElementsByClassName("sight")
    towerInputs = outline.getElementsByClassName("towerInput")

    setupTowerInputs(outlineSights)
    setupTowerInputs(towerInputs)

    tabIndexTowerInputs()
}

function setupTowerInputs(inputs) {
    for (let i = 0; i < inputs.length; ++i) {
        let elem = inputs[i];
        elem.contentEditable = true;
        elem.inputMode = "numeric";
        elem.addEventListener("beforeinput", e => {
            e.preventDefault();
        })

        elem.addEventListener("keydown", (e) => {

            const rowIndex = elem.parentElement.rowIndex

            switch (e.key) {
                case "Backspace":
                    elem.innerText = '';
                    break;
                case "ArrowUp":
                    outline.rows[rowIndex - 1]?.cells[elem.cellIndex]?.focus()
                    return;
                case "ArrowRight":
                    outline.rows[rowIndex]?.cells[elem.cellIndex + 1]?.focus()
                    return;
                case "ArrowDown":
                    outline.rows[rowIndex + 1]?.cells[elem.cellIndex]?.focus()
                    return;
                case "ArrowLeft":
                    outline.rows[rowIndex]?.cells[elem.cellIndex - 1]?.focus()
                    return;
            }

            const num = parseInt(e.key);

            if (!isNaN(num) && num && num <= size) {
                elem.innerText = num;
                
                focusNextTabIndex(inputs, i) || solveButton.focus()
            }
        }, true);
    }
}

function focusNextTabIndex(elems, curr) {
    const currIndex = elems[curr].tabIndex
    for (let i = curr+1; i < elems.length; ++i) {
        if (elems[i].tabIndex == currIndex) {
            elems[i].focus()
            return true
        }
    }
    for (const e of elems) {
        if (e.tabIndex == currIndex + 1) {
            e.focus()
            return true
        }
    }
    return false
}

function tabIndexTowerInputs() {
    
    for (let i = 0; i < size; ++i) {
        outlineSights[i].tabIndex = 1
    }
    for (let i = size; i < size * 3; i+=2) {
        outlineSights[i].tabIndex = 2
    }
    for (let i = size + 1; i < size * 3; i+=2) {
        outlineSights[i].tabIndex = 3
    }
    for (let i = size * 3; i < size * 4; ++i) {
        outlineSights[i].tabIndex = 4
    }
    for (const tower of towerInputs) {
        tower.tabIndex = 100
    }
}

function setupTowerInput(elem) {
    elem.contentEditable = true;
    elem.inputMode = "numeric";
    // elem.tabIndex = 1;
    elem.addEventListener("beforeinput", e => {
        e.preventDefault();
    })

    elem.addEventListener("keydown", (e) => {
        if (e.key == "Backspace") {
            elem.innerText = '';
        }
        const num = parseInt(e.key);

        if (!isNaN(num) && num && num <= size) {
            elem.innerText = num;
            (outlineSights[i+1] ?? solveButton).focus()
        }
    }, true);
}

function setSight(direction, index, value) {
    direction[index] = parseInt(value) || 0;
}

function clear() {
    for (elem of outlineSights) {
        elem.dispatchEvent(new KeyboardEvent('keydown',{'key':'Backspace'}));
    }
    for (elem of towerInputs) {
            elem.dispatchEvent(new KeyboardEvent('keydown',{'key':'Backspace'}));
        }
}

function prevTowerInputValue(i, j) {
    if (typeof towerInputs === "undefined") {
        return '';
    }
    if (j >= oldsize) return '';
    return towerInputs[i*oldsize+j]?.innerText || ''
}

document.getElementById("clear-button").onclick = clear;

function generateOutline() {
    let s = '';

    s += `<tbody>`

    /*****************************************************/

      +  `  <tr>
            <td class="noborder"></td>`

    for (let i = 0; i < size; ++i) {
        s += `<td class="sight"
                  style="top"
                  onkeydown="setSight(north, ${i}, this.innerText);">${north[i] || ''}
              </td>`
    }
    s += `    <td class="noborder"></td>
            </tr>`

    /*****************************************************/

    for (let i = 0; i < size; ++i) {
        s += `<tr>
                <td class="sight" onkeydown="setSight(west, ${i}, this.innerText)">${west[i] || ''}</td>
                `
        for (let j = 0; j < size; ++j) {
            s+=`<td class="towerInput">${prevTowerInputValue(i, j)}</td>`
        }
        s +=   `<td class="sight" onkeydown="setSight(east, ${i}, this.innerText)">${east[i] || ''}</td>
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