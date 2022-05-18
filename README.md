# Usage

## `beetle_map`

| Parameter       |            | Description                                                                                                | Example                |
| --------------- | ---------- | ---------------------------------------------------------------------------------------------------------- | ---------------------- |
| hostname        | _required_ | Hostname of the websocket server                                                                           | localhost              |
| port            | _required_ | Port of the websocket server                                                                               | 1234                   |
| room            | _required_ | Room ID to join                                                                                            | test                   |
| mapName         | _required_ | File name of map log file in `/logs`                                                                       | DRFT-12 Celedon Circle |
| drawCheckpoints | _optional_ | Whether the maps checkpoints are drawn. Reads data from `/maps`. `1` => enabled, anything else => disabled | 1                      |

## `leaderboard`

| Parameter |            | Description                                 | Example                |
| --------- | ---------- | ------------------------------------------- | ---------------------- |
| hostname  | _required_ | Hostname of the websocket server            | localhost              |
| port      | _required_ | Port of the websocket server                | 1234                   |
| room      | _required_ | Room ID to join                             | test                   |
| mapName   | _required_ | File name of map checkpoint file in `/maps` | DRFT-12 Celedon Circle |
