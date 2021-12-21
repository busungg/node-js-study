const fs = require("fs");

const readStream = fs.createReadStream("./readme-stream.txt", {
  highWaterMark: 16,
});
const data = [];

readStream.on("data", (chunk) => {
  data.push(chunk);
  console.log("data : ", chunk, chunk.length);
});

readStream.on("end", () => {
  console.log("end :", Buffer.concat(data).toString());
});

readStream.on("error", (err) => {
  console.log("error", err);
});

//파일 스트림 쓰기
const writeStream = fs.createWriteStream("./writeFile-stream.txt");
writeStream.on("finish", () => {
  console.log("파일 쓰기 완료");
});

writeStream.write("이 글을 씁니다.\n");
writeStream.write("한 번 더 씁니다.");
writeStream.end();

//파이프
const readStreamPipe = fs.createReadStream("./readme-stream.txt");
const writeStreamPipe = fs.createWriteStream("./writeFile-pipe-stream.txt");
readStreamPipe.pipe(writeStreamPipe);

//gzip
const zlib = require("zlib");
const readStreamGZip = fs.createReadStream("./readme-stream.txt");
const zlibStream = zlib.createGzip();
const writeStreamGZip = fs.createWriteStream("./writeFile-gzip-stream.txt.gz");
readStreamGZip.pipe(zlibStream).pipe(writeStreamGZip);
