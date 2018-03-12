let fetch = require('node-fetch');


fetchData(url,method,data)
{
    console.log("inside-Fetchdata" + data);
    fetch(url, {
        method: method,
        headers: {'Content-Type': 'application/json'},
        body: data
    }).then(response => {
        return response.json();
    }).catch(err => {
        console.log(err);
    });
}