const test = 5;

function createMapWebsocket(hostname, port, consumer) {
    let socket = new WebSocket(`ws://${hostname}:${port}`);

    socket.onopen = (e) => {
        // send initial packet to be registered as consumer
        const initEvent = {
            type: "init",
            client: "map",
            room: room,
        };
        socket.send(JSON.stringify(initEvent));
    };

    socket.onmessage = ({ data }) => {
        const event = JSON.parse(data);
        switch (event.type) {
            case "position":
                consumer(event);
                // console.info(event);
                break;
            default:
                throw new Error(`Unsupported event type: ${event.type}.`);
        }
    };

    socket.onerror = function (error) {
        console.error(`[WebSocket] ${error.message}`);
    };

    return socket;
}
