const send = (res, data) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
}

module.exports = send