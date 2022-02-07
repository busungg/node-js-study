#! /usr/bin/env node
//Express-generator로 프로젝트를 생성했을 때 bin/www의 첫 번째 줄과 동일합니다.
//리눅스나 맥 같은 유닉스 기반 운영체제에서는 의마가 있는데 /usr/bin/env로 등록된 node 명령어로 이 파일을 실행하라는 뜻입니다.
//윈도 운영체제에서는 단순한 주석으로 취급합니다.

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.clear(); //기존 콘솔 내용을 모두 지우는 역할

rl.question("예제가 재미있습니까? (y/n)", (answer) => {
  if (answer === "y") {
    console.log("good");
  } else if (answer === "n") {
    console.log("not good");
  } else {
    console.log("don't understand");
  }
});

//console.log("Hello CLI", process.argv);
