const params = new URLSearchParams(window.location.search);
const hostname = params.get("hostname");
const port = params.get("port");
const room = params.get("room");
const mapName = params.get("map");

function throwError(msg) {
    document.getElementById("message").innerText = msg;
    throw new Error(msg);
}

if (!hostname) throwError("Hostname not specified");
if (!port) throwError("Port not specified");
if (!room) throwError("Room not specified");
if (!mapName) throwError("Map not specified");

let current_positions = {};
let socket;
let countdown_interval_id;
let countdown_timeout_id;

loadCheckpoints(mapName, (checkpoints) => {
    checkpoints = checkpoints.filter((cp) => cp.name != "reset").sort((a, b) => a.id - b.id);
    console.info(checkpoints);
    const bound_updatePosition = updatePosition.bind(null, checkpoints);

    socket = createMapWebsocket(hostname, port, (event) => {
        bound_updatePosition(event.user, event.x, event.y, event.z);
    });

    const countdown_btn = document.getElementById("start_race");
    countdown_btn.addEventListener("click", startCountdown);
});

function updatePosition(checkpoints, user, x, y, z) {
    if (!current_positions[user]) {
        setCheckpoint(user, -1);
    }

    if (current_positions[user].finished) return;

    let curCPID = current_positions[user].cp;
    let nextCP = checkpoints.find((cp) => cp.id > curCPID);

    if (!nextCP) {
        console.info("why are you here");
        console.info(curCPID);
    } else {
        if (isInCheckpoint(x, y, z, nextCP)) {
            setCheckpoint(user, nextCP.id);
            console.info(`${user} reached ${nextCP.id}`);

            nextCP = checkpoints.find((cp) => cp.id > nextCP.id);
            if (!nextCP) {
                // reached finish
                current_positions[user].finished = true;
                current_positions[user].timestamp = Date.now();
            }
        }
    }

    // console.info(checkpoints);
    printCurrentPositions();
}

function setCheckpoint(user, id) {
    current_positions[user] = {
        cp: id,
        timestamp: Date.now(),
        finished: false,
    };
}

function printCurrentPositions() {
    let lbDiv = document.getElementById("leaderboard");

    cur_pos_arr = Object.keys(current_positions).map(function (user) {
        let obj = current_positions[user];
        obj.user = user;
        return obj;
    });

    sorted_positions = cur_pos_arr.sort((a, b) => {
        const cp_diff = b.cp - a.cp;
        if (cp_diff != 0) return cp_diff;
        return a.timestamp - b.timestamp;
    });
    console.info(sorted_positions);

    let cur_competing = "";
    let not_competing = "";

    let position = 1;
    for (const data of sorted_positions) {
        if (data.cp != -1) {
            cur_competing += `[${position}] ${data.user}: ${data.cp} ${data.timestamp} [${data.finished}]\n`;
            position++;
        } else {
            not_competing += `${data.user}\n`;
        }
    }

    const lbStr = `${cur_competing}
    
    Not started:

    ${not_competing}`;
    lbDiv.innerText = lbStr;
}

function startCountdown() {
    const countdown_input = document.getElementById("countdown_length");
    let countdown_length = countdown_input.value;
    let ends_on = Date.now() + countdown_length * 1000;

    event = {
        type: "countdown_start",
        ends_on: ends_on,
    };
    socket.send(JSON.stringify(event));

    if (countdown_interval_id) clearInterval(countdown_interval_id);
    if (countdown_timeout_id) clearTimeout(countdown_timeout_id);

    countdown_interval_id = setInterval(() => {
        let seconds_left = (ends_on - Date.now()) / 1000;
        let msg = seconds_left > 0 ? seconds_left.toFixed(2) : "GO!";
        printCountdown(msg);
    }, 50);

    countdown_timeout_id = setTimeout(() => {
        clearInterval(countdown_interval_id);
        current_positions = {};
        printCountdown("GO!");
    }, countdown_length * 1000 + 2000);
}

function printCountdown(msg) {
    const countdown_p = document.getElementById("countdown");
    countdown_p.innerText = msg;
}
