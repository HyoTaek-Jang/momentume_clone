const UserStorage = require("./UserStorage");

class User {
  constructor(data) {
    this.body = data;
  }

  async login() {
    try {
      const userInfo = await UserStorage.getInfo(this.body.body.id);
      // 아이디 비번 비교처리

      const hashPsw = await UserStorage.hashPsw(
        this.body.body.password,
        userInfo.user_salt
      );
      if (hashPsw.hashPsw != userInfo.user_password) {
        return { result: false, msg: "비밀번호가 다름" };
      }

      // 'auto-login' == 'on' 이면 자동로그인되게
      if (this.body.body["auto-login"] == "true") {
        console.log("auto login");
      }

      this.body.session.authenticate = true;
      this.body.session.userName = userInfo.user_name;
      this.body.session.userId = userInfo.user_id;
      // this.body.session.cookie.maxAge = 30;

      // 정상처리 객체
      return {
        result: true,
        msg: userInfo.user_name,
      };
    } catch (error) {
      console.log(error);
      return { result: false, msg: "아이디가 존재하지 않음" };
    }
  }

  logout() {
    return new Promise((resolve, reject) => {
      this.body.session.destroy(() => {
        this.body.session;
      });
      resolve("good");
    });
  }

  async register() {
    // 일단 아이디가 존재하는지 체크
    // 비번 같나 체크
    // 통과하면 디비에 셋
    const data = this.body;
    try {
      const info = await UserStorage.getInfo(data.id);
      return { result: false, msg: "아이디가 이미 존재함" };
    } catch (error) {
      if (data.password != data["confirm-password"])
        return { result: false, msg: "비밀번호가 다름" };

      const hashPsw = await UserStorage.hashPsw(data.password);
      data["hashPsw"] = hashPsw.hashPsw;
      data["salt"] = hashPsw.salt;

      const setInfo = await UserStorage.setInfo(data);
      // 삽입 성공시 반환
      if (setInfo) return { result: true, msg: data.id };
    }
  }
}

module.exports = User;