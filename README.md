# gw2_beetlerace_overlay

Overlays to use with [gw2_speedometer](https://github.com/killer415tv/gw2_speedometer) and [gw2_beetlerace_server](https://github.com/Spruudel/gw2_beetlerace_server).

-   `beetle_map`: transparent live map
-   `leaderboard`: live leaderboard with ability to start a countdown for all connected clients

## Usage

### `beetle_map`

| Parameter       |            | Description                                                                                                            | Example                |
| --------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| hostname        | _required_ | Hostname of the websocket server                                                                                       | localhost              |
| port            | _required_ | Port of the websocket server                                                                                           | 1234                   |
| room            | _required_ | Room ID to join                                                                                                        | test                   |
| mapName         | _required_ | Name of the .csv map log file in `/logs`                                                                               | DRFT-12 Celedon Circle |
| drawCheckpoints | _optional_ | Whether the maps checkpoints are drawn. Reads data from `/maps/mapName.csv`. `1` => enabled, anything else => disabled | 1                      |

### `leaderboard`

| Parameter |            | Description                                 | Example                |
| --------- | ---------- | ------------------------------------------- | ---------------------- |
| hostname  | _required_ | Hostname of the websocket server            | localhost              |
| port      | _required_ | Port of the websocket server                | 1234                   |
| room      | _required_ | Room ID to join                             | test                   |
| mapName   | _required_ | File name of map checkpoint file in `/maps` | DRFT-12 Celedon Circle |
