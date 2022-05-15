function loadCheckpoints(mapName, cb) {
    Plotly.d3.csv(`maps/${mapName}.csv`, (rows) => {
        // in data: y = height

        checkpoints = rows.map((row) => ({
            x: parseFloat(row.X),
            y: parseFloat(row.Z),
            z: parseFloat(row.Y),
            id: parseInt(row.STEP),
            name: row.STEPNAME,
        }));

        cb(checkpoints);
    });
}
