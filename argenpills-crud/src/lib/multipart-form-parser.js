const fs = require('fs');

function getValueIgnoringKeyCase(object, key) {
    const foundKey = Object
        .keys(object)
        .find(currentKey => currentKey.toLocaleLowerCase() === key.toLowerCase());
    return object[foundKey];
}

function getBoundary(event) {
    return getValueIgnoringKeyCase(event.headers, 'Content-Type').split('=')[1];
}

function getFilePath(event, fileName) {
    return `/tmp/${Date.now()}-${fileName}`;
}

function saveFile(buffer, filePath) {
    fs.writeFileSync(filePath, buffer);
}

function multiPartParser(event) {
    const boundary = getBoundary(event);
    const result = {};
    event.body
        .split(boundary)
        .forEach(item => {
            if (/filename=".+"/g.test(item)) {

                let fileContents = item.slice(item.search(/Content-Type:\s.+/g) + item.match(/Content-Type:\s.+/g)[0].length + 4, -4);
                let fileBuffer = Buffer.from(fileContents, 'binary');

                let fileName = item.match(/filename=".+"/g)[0].slice(10, -1);
                let filePath = getFilePath(event, fileName);
                saveFile(fileBuffer, filePath);

                result[item.match(/name=".+";/g)[0].slice(6, -2)] = {
                    filename: fileName,
                    contentType: item.match(/Content-Type:\s.+/g)[0].slice(14),
                    path: filePath
                }

            } else if (/name=".+"/g.test(item)) {
                result[item.match(/name=".+"/g)[0].slice(6, -1)] = item.slice(item.search(/name=".+"/g) + item.match(/name=".+"/g)[0].length + 4, -4);
            }
        });
    return result;
};

module.exports.parse = (event) => {

    let clonedEvent = Object.assign({}, event);

    if (event.isBase64Encoded) {
        let body = clonedEvent.body;
        let decodedFromBase64 = Buffer.from(body, 'base64');
        clonedEvent.body = decodedFromBase64.toString('latin1');
    }
    let result = multiPartParser(clonedEvent);

    return result;
}