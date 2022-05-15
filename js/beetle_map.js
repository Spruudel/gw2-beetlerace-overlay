const INTERVAL_PURGE_OLD_USERS = 2 * 1000;
const TIMESPAN_RETAIN_OLD_USERS = 10 * 1000;
const MAP_TRACK_ALPHA = 0.6;

// contains the positions of all current racers
let current_users = {};

const params = new URLSearchParams(window.location.search);
const hostname = params.get("host") ? params.get("host") : "beetlerank.com";
const port = params.get("port") ? params.get("port") : "1234";
const room = params.get("room");
const mapName = params.get("map");

function throwError(msg) {
    document.getElementById("message").innerText = msg;
    throw new Error(msg);
}

if (!room) throwError("Room not specified");
if (!mapName) throwError("Map not specified");

console.info(hostname);
console.info(port);
console.info(room);
console.info(mapName);

const socket = createMapWebocket(hostname, port, (event) =>
    updatePosition(event.user, event.x, event.y, event.z, event.angle)
);

function updatePosition(user, x, y, z, angle) {
    if (!current_users[user]) {
        // user is new
        current_users[user] = {};

        let color_id;
        if (free_color_ids.length > 0) {
            color_id = free_color_ids.shift();
        } else {
            color_id = current_color_id;
            current_color_id++;
        }
        current_users[user].color_id = color_id;
        current_users[user].color = get_distinct_color(color_id);

        current_users[user].graphics = getPlayerGraphics(user, current_users[user].color);
    }

    let [triangle, text] = current_users[user].graphics;
    triangle.x = x - map_minmax.min.x;
    triangle.y = y - map_minmax.min.y;
    triangle.rotation = deg_to_rad(angle);

    text.x = triangle.x + 20;
    text.y = triangle.y;

    current_users[user].timestamp = Date.now();
}

function purgeOldUsers() {
    for (const [user, data] of Object.entries(current_users)) {
        if (Date.now() - data.timestamp > TIMESPAN_RETAIN_OLD_USERS) {
            current_users[user].graphics.forEach((g) => app.stage.removeChild(g));
            free_color_ids.push(current_users[user].color_id);
            delete current_users[user];
        }
    }
}

//// PIXI 2D part

let player_graphics = {};
let map_minmax;

let current_color_id = 0;
let free_color_ids = [];

const Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    resources = PIXI.Loader.shared.resources,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics,
    Text = PIXI.Text,
    filters = PIXI.filters,
    Container = PIXI.Container;

const app = new Application({
    transparent: true,
    antialias: true,
});

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoDensity = true;
app.resizeTo = window;

app.stage.sortableChildren = true;
app.stage.position.set(20, 30);
app.stage.scale.set(1.5);

const mapContainer = new Container();
mapContainer.sortableChildren = true;

const colorMatrix = new filters.AlphaFilter();
colorMatrix.alpha = MAP_TRACK_ALPHA;
mapContainer.filters = [colorMatrix];

app.stage.addChild(mapContainer);

document.body.appendChild(app.view);

const nameplate_style = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 14,
    fill: "white",
    stroke: "#000000",
    strokeThickness: 3,
});

loader.add("assets/checkered-flag.svg").load(setup);
function setup() {
    drawMap();
    setInterval(purgeOldUsers, INTERVAL_PURGE_OLD_USERS);
}

function drawMap() {
    Plotly.d3.csv(`logs/${mapName}.csv`, (rows) => {
        // in data: y = height
        let x = [];
        let y = [];
        let z = [];

        rows.forEach((row) => {
            x.push(parseFloat(row.X));
            y.push(parseFloat(row.Z));
            z.push(parseFloat(row.Y));
        });

        let points = [];
        for (let i = 0; i < x.length; ++i) {
            points.push({
                x: x[i],
                y: y[i],
                z: z[i],
            });
        }

        data = {
            points: points,
            max: {
                x: Math.max(...x),
                y: Math.max(...y),
                z: Math.max(...z),
            },
            min: {
                x: Math.min(...x),
                y: Math.min(...y),
                z: Math.min(...z),
            },
        };

        map_minmax = {
            max: data.max,
            min: data.min,
        };

        console.log(data);
        _drawMap(data);
    });
}

function _drawMap(data) {
    // transform points => [0, ...]
    const points = data.points.map((p) => ({
        x: p.x - data.min.x,
        y: p.y - data.min.y,
    }));

    const lineWidth = 30;

    const line = new Graphics();
    line.lineStyle({ width: lineWidth, color: 0x999999, alpha: 1 });

    const outline = new Graphics();
    outline.lineStyle({ width: lineWidth + 4, color: 0x333333, alpha: 1 });

    line.moveTo(points[0].x, points[0].y);
    outline.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; ++i) {
        line.lineTo(points[i].x, points[i].y);
        outline.lineTo(points[i].x, points[i].y);
    }

    line.zIndex = 1;
    outline.zIndex = 0;
    mapContainer.addChild(line);
    mapContainer.addChild(outline);

    flag = new Sprite(resources["assets/checkered-flag.svg"].texture);
    flag.scale.set(0.2, 0.2);
    flag.anchor.set(0, 0.8);
    flag.x = points[points.length - 1].x;
    flag.y = points[points.length - 1].y;
    app.stage.addChild(flag);
}

function createTriangle(color) {
    let triangle = new PIXI.Graphics();

    // draw triangle
    triangle.beginFill(color);
    triangle.lineStyle({ width: 3, color: 0x333333, alpha: 1 });
    triangle.drawPolygon([
        -16,
        16, //First point
        16,
        16, //Second point
        0,
        -16, //Third point
    ]);
    triangle.endFill();

    triangle.scale.set(0.6);
    triangle.zIndex = 5;

    return triangle;
}

function getPlayerGraphics(name, color) {
    let triangle = createTriangle(color);
    let text = new Text(name, nameplate_style);
    text.zIndex = 5;
    text.anchor.set(0, 0.5);

    app.stage.addChild(triangle);
    app.stage.addChild(text);
    return [triangle, text];
}

//// UTIL

const deg_to_rad = (deg) => (deg * Math.PI) / 180.0;

// input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
function hsv_to_rgb(h, s, v) {
    let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
}

function rgb_to_hex(rgb) {
    const [r, g, b] = rgb;
    const hex = Math.floor(r * 255).toString(16) + Math.floor(g * 255).toString(16) + Math.floor(b * 255).toString(16);
    return parseInt(hex, 16);
}

const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;
const COLOR_BASE_VAL = Math.random();
function get_distinct_color(n) {
    let hue = (COLOR_BASE_VAL + n * GOLDEN_RATIO_CONJUGATE) % 1;
    return rgb_to_hex(hsv_to_rgb(hue * 360, 0.65, 0.85));
}
