import socketConnWaitRetryPeriodMs from '../constants/socketConnWaitRetryPeriod.js';

export default function waitForSocketConnection(socket, callback) {
    setTimeout(() => {
        if (socket.readyState === 1) {
            if (callback != null) {
                callback();
            }
        } else {
            waitForSocketConnection(socket, callback);
        }
    }, socketConnWaitRetryPeriodMs);
}
