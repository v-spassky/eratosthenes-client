export default async function userIsHost(room_id) {
    const username = localStorage.getItem("username");
    return await fetch(`${process.env.REACT_APP_SERVER_ORIGIN}/is-host/${room_id}?username=${username}`)
        .then(response => response.json())
        .then(data => data.isHost);
}
