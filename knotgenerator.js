const PATH_SPEED = 0 //ms
const TURN_RADIUS = 7
const CROSS_COLOR = true
const PATH_WIDTH = 5
const KNOT_X = 50 //knot starting pos
const KNOT_Y = 80
const KNOT_TRIAL_LENGTH = 10

//board matrix
var matrix = [];
for (var i = 0; i < canvas.width / PATH_WIDTH; i++) {
    matrix[i] = [];
    for (var j = 0; j < canvas.height / PATH_WIDTH; j++) {
        matrix[i][j] = 0;
    }
}


function occupied(i, j) {
    return !(matrix[i][j] == 0)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearMatrix() {
    for (var i = 0; i < canvas.width / PATH_WIDTH; i++) {
        for (var j = 0; j < canvas.height / PATH_WIDTH; j++) {
            matrix[i][j] = 0;
        }
    }
}

//finds cartesian difference between two points
function dist(x1, x2, y1, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

//Draws a pixel at the xth row and yth column
function drawPixel(x, y, color) {
    const canvas = document.querySelector('#canvas');

    if (!canvas.getContext) {
        return;
    }
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(x * PATH_WIDTH, y * PATH_WIDTH, PATH_WIDTH, PATH_WIDTH);

}

//updates board to set value at matrix[x][y]
//returns color if nothing there already, red if so
function updateBoard(x, y, color) {
    m = matrix[x][y];
    if (m > 0 && CROSS_COLOR) {
        color = 'rgb(' + (m * 60 + 100) + ',0,70,1)';
    }
    matrix[x][y] += 1;
    return color;

}

//Randomly picks direction to go
//takes in direction of path: 0 is up, 1 is right, 2 is down, 3 is left
//x, y are the starting points
function pickDirection(direction, curX, curY, x, y, lastTurn) {
    var newDir = direction;
    const r = Math.floor(Math.random() * 10);
    if (r == 0) {
        newDir = (direction + 3) % 4;
    } else if (r == 1) {
        newDir = (direction + 1) % 4;
    }

    //if hitting the edge, turn towards starting point
    if (curX == 1) { //hitting left wall
        if (direction == 3) {
            if (curY - y > 0) {
                return 0;
            } else {
                return 2;
            }
        } else {
            if (newDir == 3) {
                newDir = 1;
            }
        }
    }
    if (curX == canvas.width / PATH_WIDTH - 1) { //hitting right wall
        if (direction == 1) {
            if (curY - y > 0) {
                return 0;
            } else {
                return 2;
            }
        } else {
            if (newDir == 1) {
                newDir = 3;
            }
        }
    }
    if (curY == 1) { //hitting top wall
        if (direction == 0) {
            if (curX - x > 0) {
                return 3;
            } else {
                return 1;
            }
        } else {
            if (newDir == 0) {
                newDir = 2;
            }
        }
    }
    if (curY == canvas.height / PATH_WIDTH - 1) { //hitting bottom wall
        if (direction == 2) {
            if (curX - x > 0) {
                return 3;
            } else {
                return 1;
            }
        } else {
            if (newDir == 2) {
                newDir = 0;
            }
        }
    }

    if (lastTurn < TURN_RADIUS + 1) { //don't turn quicker than three moves
        return direction
    }
    return newDir
}

//main function to make a path; takes in a starting x and y, how many iterations, and
//a starting direction; returns ending x and y, list of moves it made, and direction
async function makePath(x, y, iters, startingDir) {
    var curX = x;
    var curY = y;
    var dir = startingDir;
    var r = 238;
    var lastMove = 0;
    var moveList = [[x, y]];
    color = updateBoard(curX, curY, 'rgb(' + r + ',0,255,1)');
    drawPixel(curX, curY, color);

    for (i = 0; i < iters; i++) {
        await sleep(PATH_SPEED)

        newDir = pickDirection(dir, curX, curY, x, y, lastMove);
        if (dir == newDir) {
            lastMove += 1;
        } else { lastMove = 0 }
        dir = newDir;
        switch (dir) {
            case 0: //up
                curY = curY - 1;
                break;
            case 1: //right
                curX = curX + 1;
                break;
            case 2: //down
                curY = curY + 1;
                break;
            case 3: //left
                curX = curX - 1
                break;
            default:
                console.log(":(")
        }
        r = r - 1
        color = updateBoard(curX, curY, 'rgb(' + r + ',0,255,1)')
        drawPixel(curX, curY, color);
        moveList.push([curX, curY])
    }
    return [curX, curY, moveList, dir]
}

//clears the canvas and the matrix
function clearCanvas() {
    const context = canvas.getContext('2d');
    clearMatrix()
    context.clearRect(0, 0, canvas.width, canvas.height);
}

//returns true if no adjacent crossings, false otherwise
//also check for paths too close and also too close to the
//border and too close to knot origin. 
//this is very inefficient but i'm cool so it's ok
//also redudant boolean logic go brrrr
//basically i'm sorry for this function
function checkCrossings(avoidKnotXY) {
    for (var i = 0; i < canvas.width / PATH_WIDTH - 1; i++) {
        for (var j = 0; j < canvas.height / PATH_WIDTH - 1; j++) {
            if (matrix[i][j] > 1 && matrix[i][j + 1] > 1) {
                return false
            }
            if (matrix[i][j] > 1 && matrix[i + 1][j] > 1) {
                return false
            }
            if (matrix[i][j] > 0 && matrix[i][j + 1] > 0
                && matrix[i + 1][j + 1] && matrix[i + 1][j]) {
                return false
            }
            if (matrix[1][j] > 0 || matrix[canvas.width / PATH_WIDTH - 1][j] > 0
                || matrix[i][1] > 0 || matrix[i][canvas.width / PATH_WIDTH - 1] > 0) {
                return false
            }
            if (matrix[1][j] > 0 || matrix[canvas.height / PATH_WIDTH - 1][j] > 0
                || matrix[i][1] > 0 || matrix[i][canvas.height / PATH_WIDTH - 1] > 0) {
                return false
            }
            if (avoidKnotXY && matrix[i][j] > 0 && dist(i, j, KNOT_X, KNOT_Y) < 5) {
                return false;
            }
        }
    }
    return true
}

//undoes the list of moves given
async function backItUp(moveList) {
    len = moveList.length
    for (j = len - 1; j >= 0; j--) {
        coords = moveList[j];
        curX = coords[0];
        curY = coords[1];
        await sleep(PATH_SPEED);
        m = matrix[curX][curY];
        if (m > 1) {
            drawPixel(curX, curY, 'rgb(254,0,255,1)')
        }
        else { drawPixel(curX, curY, 'white'); }

        matrix[curX][curY] -= 1;
    }
}



//finds random path that strictly decreases distance from cur to home
//while also adhearing to checkCrossings
//need to optimize this :D
async function returnHome(curX, curY, homeX, homeY, retsHistory) {
    console.log("Goin' home!")
    console.log(retsHistory)
    dir = 1
    tries = 0;
    while (Math.abs(homeX - curX) > 1 || Math.abs(homeY - curY) > 1) {
        if (tries < 5) {
            distX = Math.abs(homeX - curX);
            distY = Math.abs(homeY - curY);
            cartDist = dist(curX, homeX, curY, homeY)
            rets = await makePath(curX, curY, Math.max(distX, distY) / 2 + 1, pickDirection(dir));

            if (!checkCrossings(false) || cartDist < dist(rets[0], homeX, rets[1], homeY)) {
                await backItUp(rets[2]);
                tries += 1;
            } else {
                curX = rets[0];
                curY = rets[1];
                dir = rets[3];
                tries = 0;
                retsHistory.push(rets);
            }
        } else {
            await backItUp(retsHistory.pop()[2]);
            rets = retsHistory[retsHistory.length - 1];
            tries = 0;
            curX = rets[0];
            curY = rets[1];
            dir = rets[3];
            tries = 0;
        }
    }
}

async function listCrossings() {
    var listOfCrossings = []; //list of list of i, j coords
    for (var i = 1; i < canvas.width / PATH_WIDTH - 1; i++) {
        for (var j = 1; j < canvas.height / PATH_WIDTH - 1; j++) {
            if (occupied(i, j) && occupied(i - 1, j) && occupied(i + 1, j)
                && occupied(i, j - 1) && occupied(i, j + 1)) { //if crossing centered at i,j
                    listOfCrossings.push([i, j]);
            }
        }
    }
    return listOfCrossings;
}

async function alternateCrossings(listOfCrossings) {
    for (var i = 0; i < listOfCrossings.length; i++) {
        if (i % 2 == 0) {
            drawPixel(listOfCrossings[i][0] + 1, listOfCrossings[i][1], 'blue');
            drawPixel(listOfCrossings[i][0] - 1, listOfCrossings[i][1], 'blue');
            await sleep(100)
        } else {
            drawPixel(listOfCrossings[i][0], listOfCrossings[i][1] + 1, 'blue');
            drawPixel(listOfCrossings[i][0], listOfCrossings[i][1] - 1, 'blue');
            await sleep(100)
        }
    }
}

async function fadeAlternateCrossings(listOfCrossings) {
    for (var i = 0; i < listOfCrossings.length; i++) {
            var b = 250
        if (i % 2 == 0) {
            drawPixel(listOfCrossings[i][0] + 1, listOfCrossings[i][1], 'white');
            drawPixel(listOfCrossings[i][0] - 1, listOfCrossings[i][1], 'white');
            for (var j = 0; j < 10; j++) {
                drawPixel(listOfCrossings[i][0] + 1, listOfCrossings[i][1], 'rgb('+b+','+b+',255,1)');
                drawPixel(listOfCrossings[i][0] - 1, listOfCrossings[i][1], 'rgb('+b+','+b+',255,1)');
                b += 25
            }
        } else {
            drawPixel(listOfCrossings[i][0], listOfCrossings[i][1] + 1, 'white');
            drawPixel(listOfCrossings[i][0], listOfCrossings[i][1] - 1, 'white');
            for (var j = 0; j < 10; j++) {
                drawPixel(listOfCrossings[i][0], listOfCrossings[i][1] + 1, 'rgb('+b+','+b+',255,1)');
                drawPixel(listOfCrossings[i][0], listOfCrossings[i][1] - 1, 'rgb('+b+','+b+',255,1)');
                b += 25;
            }
        }
    }
}

async function makeKnot(iters) {
    clearCanvas();
    var rets = await makePath(KNOT_X, KNOT_Y, KNOT_TRIAL_LENGTH, 1);
    var retsHistory = [rets]
    var tries = 0;
    while (iters > 1) {
        console.log(tries)
        if (tries < 7) { //path gets 6 tries before backing up further
            curX = rets[0];
            curY = rets[1];
            moveList = rets[2];
            dir = rets[3];
            // await sleep(200);
            var newRets = await makePath(curX, curY, TURN_RADIUS * 5, pickDirection(dir));
            if (!checkCrossings(true)) {
                await backItUp(newRets[2]);
                tries += 1
            } else {
                rets = newRets;
                retsHistory.push(rets)
                iters -= 1
                tries = 0
            }
        } else { //if path fails to move forward after 6 tries, back up in history
            console.log(retsHistory)
            badPathRets = retsHistory.pop()
            console.log(retsHistory)
            await backItUp(badPathRets[2])
            rets = retsHistory[retsHistory.length - 1]
            console.log("Backing up beep beep")
            console.log(rets)
            tries = 0;
        }
    }
    await returnHome(rets[0], rets[1], KNOT_X, KNOT_Y, retsHistory);
    console.log("Path complete. Finding crossings...")
    listOfCrossings = await listCrossings();
    await alternateCrossings(listOfCrossings); //turn where crossings will be deleted blue
    await sleep(1000)
    await fadeAlternateCrossings(listOfCrossings);//fade those blue crossings away one by one
}