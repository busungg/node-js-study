//todo list

//모든 함수는 랜덤하게 0~2초 사이로 처리된다.
// 1. addTask
//  - 이름을 받아서 taskList에 넣는다.
// 2. modifyTask
// 3. removeTask
// 4. addTwoTask
//  - 이름 Array를 받아 taskList에 넣는다.
//  - 여러 Promise를 처리하는것에 익숙해진다.

(function (global) {
  const taskList = [];

  const addTask = (name) => {
    const addPromise = new Promise((resolve, reject) => {
      const sec = Math.random() * 3000;
      setTimeout(() => {
        if (sec < 2000) {
          resolve(name);
        } else {
          reject({ sec, name });
        }
      }, sec);
    });

    addPromise
      .then((name) => {
        taskList.push({ name });
        console.log(taskList);
      })
      .catch((error) => {
        console.error(
          `${error.name} to do는 ${error.sec} sec이라 timeout 되었습니다.`
        );
      });
  };

  global.TodoList = {
    addTask,
  };
})(global);

TodoList.addTask("1");
TodoList.addTask("2");
TodoList.addTask("3");
TodoList.addTask("4");
TodoList.addTask("5");
TodoList.addTask("6");
