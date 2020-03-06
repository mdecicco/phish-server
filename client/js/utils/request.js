export function request(data) {
    try {
        var params = null;
        var xhr = new XMLHttpRequest();
        xhr.open(data.method, data.url, true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                var response = null;
                try {
                    response = data.parse ? JSON.parse(xhr.responseText) : xhr.responseText;
                    data.success(response);
                } catch (exception) {
                    data.error(`Failed to parse response\n\n${data.responseText}`);
                }
            } else data.error(xhr.status);
        };
        
        xhr.send(params);
        //send_progress(`Requesting '${data.url}'`);
    } catch (exception) {
        data.error(exception);
    }
}

export function get(url) {
    return new Promise((resolve, reject) => {
        request({
            method: 'GET',
            url,
            success: resolve,
            error: reject,
            parse: true
        });
    });
}
