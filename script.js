var articles;
var articleNum = -2;
function getFirstFullStop(str, start, sentences) { // get nth full stop out of brackets
    var count = 0;
    while (true) {
        var index = str.indexOf(".", start);
        if (index === -1) {
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

function remove(id) {
    var elem = document.getElementById(id);
    if (elem == null) return null;
    return elem.parentNode.removeChild(elem);
}

function pingApi(search, callback) {
  $.ajax({
    url: "https://en.wikipedia.org/w/api.php",
    data: {
      "action": "query",
      "format": "json",
      "generator": "search",
      "gsrlimit": 20,
      "prop": "info|pageimages|extracts",
      "exintro": 1,
      "explaintext": 1,
      "exsentences": 1,
      "exlimit": "max",
      "pilimit": "max",
      "inprop": "url",
      "redirects": 1,
      "gsrsearch": search
    },
    dataType: 'jsonp',
    type: 'POST',
    async: false,
    headers: {
      'Api-User-Agent': 'Example/1.0'
    },
    success: function(data) {
      callback(data);
    },
    error: function(err) {
      alert(err);
    }
  });
}

function asyncGet(url, callback) {
    $.ajax({
        type: 'GET',
        url: url,
        dataType: "json",
        dataType: "jsonp",
        success: function(data) {
            callback(data);
        }
    });
}

function stripTags(str) {
    str = str.replace("\\<.*?\\> ?", "");
    var x = str.lastIndexOf(".");
    if (x === -1) return str;
    return str.substring(0, x+1);
}

function loadMore(x, container) {
    var m = 0;
    var query = "https://en.wikipedia.org/w/api.php?format=json&action=query&srlimit=50&prop=extracts&explaintext=1&exintro=1&titles=";
    for (var article in articles) {
        if (m++ <= articleNum) continue;
        if (m == x + articleNum+2) break;
        article = articles[article];
        query += article.title.split(" ").join("_");
        if (m != articles.length-1) query += "|";
        container.innerHTML +=
        '<a target="_blank" class="link" href="https://en.wikipedia.org/?curid=' + article.pageid + '"><div class="article"><h3 class="title">' + article.title + '</h3><div class="summary" id="' + article.title + '"></div></div></a>';
    }
    if (m < x + articleNum + 2) { // the loop did not run fully ie. we ran out of articles
        var load = document.getElementById("loadMore");
        makeLoadButtonDisabled(load);
    }
    asyncGet(query, function(reply) {
        var pages = reply.query.pages;
        for (var i in pages) {
            try {
                var page = (pages[i]);
                document.getElementById(page.title).innerHTML = getFirstFullStop(page.extract, 0, 2);
            } catch (e) {}
        }
        articleNum += x;
    });
}

function fetchArticles(input) {
    pingApi(input, function(response) {
        articles = response.query.pages;
        const container = document.getElementsByClassName("articleContainer")[0];
        container.innerHTML = "";  
        articleNum = 0;
        loadMore(10, container);
        document.getElementById("loadMore").style.display = "block";
    }); 
}

function makeLoadButtonDisabled(load) {
    load.onclick = "";
    $(load).css("background-color", "#C0C0C0");
    $(load).css("color", "#F5F5F5");
}

function makeLoadButtonEnabled(load) {
    load.onclick = function() {
        loadMore(4, document.getElementsByClassName("articleContainer")[0]);
    }
    $(load).css("background-color", "#33739E");
    $(load).css("color", "fff");
}

function handleClick() {
    remove("padder");
    makeLoadButtonEnabled(document.getElementById("loadMore"));
    var input = document.getElementById("search").value,
        url = "https://en.wikipedia.org/w/api.php?action=query&srlimit=50&format=json&list=search&srsearch=" + input;
    fetchArticles(input);
}

window.onload = function () {
    var load = document.getElementById("loadMore");
    load.style.display = "none";
    makeLoadButtonEnabled(load);    
    document.getElementById("search").addEventListener("keyup", function(e) {
        e.preventDefault();
        if (e.keyCode === 13) {
            handleClick();
        }
    });
    
}