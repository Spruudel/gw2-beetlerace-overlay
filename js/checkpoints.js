const DEFAULT_CHECKPOINT_RADIUS = 15;

function loadCheckpoints(mapName, cb) {
    Plotly.d3.csv(`maps/${mapName}.csv`, (rows) => {
        // in data: y = height

        checkpoints = rows.map((row) => {
            let point = {
                x: parseFloat(row.X),
                y: parseFloat(row.Z),
                z: parseFloat(row.Y),
                id: parseInt(row.STEP),
                name: row.STEPNAME,
            };
            if (row.RADIUS) point.radius = parseFloat(row.RADIUS);
            return point;
        });

        cb(checkpoints);
    });
}

function isInCheckpoint(x, y, z, cp) {
    const radius = cp.radius ? cp.radius : DEFAULT_CHECKPOINT_RADIUS;
    return distance_3d([x, y, z], [cp.x, cp.y, cp.z]) <= radius;
}
