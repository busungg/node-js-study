const url = require("url");

const URL = url.URL;
const myURL = new URL(
  "http://www.gilbut.co.kr/book/bookList.aspx?page=3&limit=10&category=nodejs&category=javascript&sercate1=001001000#anchor"
);

console.log("new URL()", myURL);
console.log("url.format()", url.format(myURL));
console.log("-----------------------------------");
const parsedUrl = url.parse(
  "http://www.gilbut.co.kr/book/bookList.aspx?page=3&limit=10&category=nodejs&category=javascript&sercate1=001001000#anchor"
);
console.log("url.parse()", parsedUrl);
console.log("url.format()", url.format(parsedUrl));

console.log(
  "================================================================="
);
console.log("searchParams");
console.log(
  "================================================================="
);

console.log("searchParams", myURL.searchParams);
console.log("searchParams.getAll()", myURL.searchParams.getAll("category"));
console.log("searchParams.get()", myURL.searchParams.get("limit"));
console.log("searchParams.has()", myURL.searchParams.has("page"));

console.log("searchParams.keys()", myURL.searchParams.keys());
console.log("searchParams.values()", myURL.searchParams.values());

myURL.searchParams.append("filter", "es3");
myURL.searchParams.append("filter", "es5");
console.log(myURL.searchParams.getAll("filter"));

myURL.searchParams.set("filter", "es6");
console.log(myURL.searchParams.getAll("filter"));

myURL.searchParams.delete("filter");
console.log(myURL.searchParams.getAll("filter"));

myURL.searchParams.delete("category");

console.log("searchParams.toString()", myURL.searchParams.toString());
console.log("origin myURL", myURL);

myURL.search = myURL.searchParams.toString();

console.log(
  "================================================================="
);
console.log("queryString");
console.log(
  "================================================================="
);

const querystring = require('querystring');
const query = querystring.parse(parsedUrl.query);
console.log('querystring.parse()', query);
console.log('querystring.stringify()', querystring.stringify(query));