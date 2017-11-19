function getFirstFullStop(str, start, sentences) { // get first full stop out of brackets
    var count = 0;
    while (true) {
        var index = str.indexOf(".", start);
        if (index == -1) {
            return str;
        }
        var straight1 = str.indexOf("["), straight2= str.indexOf("]"),
            other1 = str.indexOf("("), other2 = str.indexOf(")");
        if ((index > straight1 && index < straight2) || (index > other1 && index < other2)) { // the full stop comes before a bracket
            start = index+1;
        } else {
            count++
            if (count == sentences) return str.substring(0, index+1);
            start = index+1;
        }         
    }
}

function asyncGet(url, callback) {
    var xml = new XMLHttpRequest();
    xml.onreadystatechange = function () {
        if (xml.readyState === 4 && xml.status === 200) {
            callback(xml.responseText);
        }
    }
    xml.open("GET", url, true);
    xml.send(null);
}

function stripTags(str) {
    str = str.replace("\\<.*?\\> ?", "");
    var x = str.lastIndexOf(".");
    if (x === -1) return str;
    return str.substring(0, x+1);
}

function handleClick() {
    var input = document.getElementById("search").value,
        url = "https://cors.io/?https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=" + input;
    asyncGet(url, function(response) {
        response = JSON.parse(response);
        var articles = response.query.search;
        const container = document.getElementsByClassName("articleContainer")[0];
        container.innerHTML = "";
        var query = "https://cors.io/?https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&explaintext=1&exintro=1&titles=";
        for (var i = 0; i < articles.length; i++) {
            var article = articles[i];
            query += article.title;
            if (i != articles.length-1) query += "|";
            container.innerHTML +=
                '<a target="_blank" href="https://en.wikipedia.org/?curid=' + article.pageid + '"><div class="article"><h3 class="title">' + article.title + '</h3><div class="summary" id="' + article.title + '"></div></div></a>';
        }
        asyncGet(query, function(reply) {
            reply = JSON.parse(reply);
            var pages = reply.query.pages,
                 keys = Object.keys(pages),
                 len = keys.length;
            for (var i = 0; i < len; i++) {
                var page = (pages[keys[i]]),
                    summary
                    parts = page.extract.split(".");
                for (var j = 0; j < 2 && j < parts.length; j++) {
                    summary += parts[j] + ".";
                }
                document.getElementById(page.title).innerHTML = getFirstFullStop(page.extract, 0, 2);
            }
        });
    }); 
}

window.onload = function () {
    document.getElementById("search").addEventListener("keyup", function(e) {
        e.preventDefault();
        if (e.keyCode === 13) {
            handleClick();
        }
    })
}