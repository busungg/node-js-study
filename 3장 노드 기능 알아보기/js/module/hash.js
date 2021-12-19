const crypto = require('crypto');

console.log('base64', crypto.createHash('sha512').update('비밀번호').digest('base64'));
console.log('base64', crypto.createHash('sha512').update('비밀번호').digest('hex'));
console.log('base64', crypto.createHash('sha512').update('다른 비밀번호').digest('base64'));

//pbkdf2
crypto.randomBytes(64, (err, buf) => {
    //randomBytes() 메서드로 64바이트 길이의 문자열을 만들어줍니다.
    //이것이 salt가 됩니다.
    
    const salt = buf.toString('base64');
    console.log('salt', salt);

    //순서대로, 비밀번호, salt, 반복 횟수, 출력 바이트, 해시 알고리즘을 인자로 넣어 줍니다.
    //10만 번 반복해서 적용된다고 했습니다. 즉, sha512로 변환된 결괏값을 다시 sha512로 변환하는 과정을 10만번 반복하는 겁니다.
    crypto.pbkdf2('비밀번호', salt, 100000, 64, 'sha512',
        (err, key) => {
            console.log('password:', key.toString('base64'));
        });
    //컴퓨터의 성능에 좌우되므로 조금 느리다 싶으면 반복 횟수를 낮추고, 
    //너무 빠르다 싶으면 1초 정도가 될때까지 반복횟수를 늘립니다.
});