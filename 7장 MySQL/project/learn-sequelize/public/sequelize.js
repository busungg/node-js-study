//-----------------------------------------------------------------
//  API
//-----------------------------------------------------------------
const getUser = () => {
  const promise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) {
        const users = JSON.parse(xhr.responseText);
        console.log(users);
        resolve(users);
      } else {
        reject(xhr.responseText);
      }
    };
    xhr.open("GET", "/users");
    xhr.send();
  });

  promise
    .then((users) => {
      renderUsers(users);
    })
    .catch((error) => {
      console.error(error);
    });
};

const getComment = (id) => {
  const promise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) {
        const comments = JSON.parse(xhr.responseText);
        resolve(comments);
      } else {
        reject(xhr.responseText);
      }
    };
    xhr.open("GET", `/comments/${id}`);
    xhr.send();
  });

  promise
    .then((comments) => {
      renderComments(comments);
    })
    .catch((error) => {
      console.error(error);
    });
};

const editComment = (id, newComment) => {
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) {
      console.log(xhr.responseText);
      getComment(id);
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open("PATCH", `/comments/${id}`);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({ comment: newComment }));
};

const removeComment = (id) => {
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) {
      console.log(xhr.responseText);
      getComment(id);
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open("DELETE", `/comments/${id}`);
  xhr.send();
};

const createUser = (user) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 201) {
        console.log(xhr.responseText);
        getUser();
      } else {
        console.error(xhr.responseText);
      }
    }
  };

  xhr.open("POST", "/users");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(user));
};

const createComment = (comment) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 201) {
        console.log(xhr.responseText);
        getComment(comment.id);
      } else {
        console.error(xhr.responseText);
      }
    }
  };

  xhr.open("POST", "/comments");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(comment));
};

//-----------------------------------------------------------------
//  Event
//-----------------------------------------------------------------

//사용자 이름 눌렀을 때 댓글 로딩
document.querySelectorAll("#user-list tr").forEach((el) => {
  el.addEventListener("click", () => {
    const id = el.querySelector("td").textContent;
    getComment(id);
  });
});

document.getElementById("user-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = e.target.username.value;
  const age = e.target.age.value;
  const married = e.target.married.checked;
  if (!name) {
    return alert("이름을 입력하세요");
  }

  if (!age) {
    return alert("나이를 입력하세요");
  }

  createUser({ name, age, married });
  e.target.username.value = "";
  e.target.age.value = "";
  e.target.married.checked = false;
});

document.getElementById("comment-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = e.target.userid.value;
  const comment = e.target.comment.value;
  if (!id) {
    return alert("아이디를 입력하세요");
  }

  if (!comment) {
    return alert("댓글을 입력하세요");
  }

  createComment({ id, comment });
  e.target.userid.value = "";
  e.target.comment.value = "";
});

//-----------------------------------------------------------------
//  Render
//-----------------------------------------------------------------
const renderUsers = (users) => {
  const tbody = document.querySelector("#user-list tbody");
  tbody.innerHTML = "";
  users.map((user) => {
    const row = document.createElement("tr");
    row.addEventListener("click", () => {
      getComment(user.id);
    });

    let td = document.createElement("td");
    td.textContent = user.id;
    row.appendChild(td);

    td = document.createElement("td");
    td.textContent = user.name;
    row.appendChild(td);

    td = document.createElement("td");
    td.textContent = user.age;
    row.appendChild(td);

    td = document.createElement("td");
    td.textContent = user.married ? "기혼" : "미혼";
    row.appendChild(td);

    tbody.appendChild(row);
  });
};

const renderComments = (comments) => {
  const tbody = document.querySelector("#comment-list tbody");
  tbody.innerHTML = "";

  comments.map((comment) => {
    const row = document.createElement("tr");

    let td = document.createElement("td");
    td.textContent = comment.id;
    row.appendChild(td);

    td = document.createElement("td");
    td.textContent = comment.commenter["user.name"];
    row.appendChild(td);

    td = document.createElement("td");
    td.textContent = comment.comment;
    row.appendChild(td);

    td = document.createElement("td");
    const edit = document.createElement("button");
    edit.textContent = "수정";
    edit.addEventListener("click", () => {
      const newComment = prompt("바꿀 내용을 입력하세요");
      if (!newComment) {
        return alert("내용을 반드시 입력하셔야 합니다.");
      }

      editComment(id, newComment);
    });
    td.appendChild(edit);
    row.appendChild(td);

    td = document.createElement("td");
    const remove = document.createElement("button");
    remove.textContent = "삭제";
    remove.addEventListener("click", () => {
      removeComment(id);
    });
    td.appendChild(remove);
    row.appendChild(td);

    tbody.appendChild(row);
  });
};
