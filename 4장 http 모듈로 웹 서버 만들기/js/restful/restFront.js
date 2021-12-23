function createUser(name) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        console.log(xhr.responseText);
        getUser();
      } else {
        console.error(xhr.responseText);
      }
    }
  };
  xhr.open("POST", "/users");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({ name: name }));
}

function getUser() {
  var xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) {
      var users = JSON.parse(xhr.responseText);

      render(users);
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open("GET", "/users");
  xhr.send();
}

const modifyUser = (key) => {
  return (name) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log(xhr.responseText);
        getUser();
      } else {
        console.error(xhr.responseText);
      }
    };
    xhr.open("PUT", "/users/" + key);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ name: name }));
  };
};

const removeUser = (key) => {
  return () => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log(xhr.responseText);
        getUser();
      } else {
        console.error(xhr.responseText);
      }
    };
    xhr.open("DELETE", "/users/" + key);
    xhr.send();
  };
};

function render(users) {
  var list = document.getElementById("list");
  list.innerHTML = "";

  const fragment = document.createDocumentFragment();
  Object.keys(users).map((key) => {
    const userDiv = document.createElement("div");
    const span = document.createElement("span");
    span.textContent = users[key];

    const edit = document.createElement("button");
    edit.textContent = "수정";
    edit.addEventListener("click", function () {
      let name = prompt("바꿀 이름을 입력하세요");
      if (!name) {
        return alert("이름을 반드시 입력하여야 합니다.");
      }
      modifyUser(key)(name);
    });

    const remove = document.createElement("button");
    remove.textContent = "삭제";
    remove.addEventListener("click", removeUser(key));

    userDiv.appendChild(span);
    userDiv.appendChild(edit);
    userDiv.appendChild(remove);

    fragment.appendChild(userDiv);
  });

  list.appendChild(fragment);
}

window.onload = getUser; //로딩 시 getUser 호출

//폼 제출
document.getElementById("form").addEventListener("submit", (evt) => {
  evt.preventDefault();
  var name = evt.target.username.value;
  if (!name) {
    return alert("이름을 입력하세요");
  }
  createUser(name);
  evt.target.username.value = "";
});
