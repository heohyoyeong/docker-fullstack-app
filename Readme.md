# Docker-Fullstack-App 코드작성 순서
<hr/>

## 1. Node.js 코드작성
<hr/>
- 가장 처음 backend 폴더를 생성한 후 cd backend하여 폴더 진입
- terminal에서 npm init을 사용하여 package.json 파일 생성 후 변경

~~~json
기본내용에 아래 내용을 추가
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
  "dependencies": {
    "express": "4.16.3",
    "mysql": "2.16.0",
    "nodemon": "1.18.3",
    "body-parser": "1.19.0"
  }
~~~

- 그 이후 backend 폴더에 Server.js 파일 생성 

~~~js
    // 필요한 모듈들을 가져오기
    const express = require("express")
    const bodyParser = require('body-parser')

    // Express 서버 생성
    const app = express();

    // json 형태로 오는 요청의 본문을 해석해줄수있게 등록
    app.use(bodyParser.json());

    app.listen(5000, ()=>{
        console.log("어플리케이션이 5000번 포트에서 시작되었습니다.");
    })
~~~

- 그 이후 backend 폴더에 db.js 파일을 생성
~~~js
    const mysql = require("mysql");
    const pool = mysql.createPool({
        connectionLimit: 10,
        host: 'mysql',
        user: 'root',
        password: 'hhy',
        database: 'myapp'
    });

    exports.pool = pool;
~~~

- db.js 파일을 작성후 server.js에 db에 대한 내용 추가
~~~js
    // export된 pool을 시작점인 server.js에서 불러오기
    const db = require('./db');

    //DB lists 테이블에 있는 모든 데이터를 프론트 서버에 보내주기
    app.get('/api/values',function(req,res) {
        // DB 데이터베이스에서 모든 정보 가져오기
        db.pool.query('SELECT * FROM lists;',
        (err, results, fileds) => {
            //만약 에러면 상태 500을 보내고
            if (err)
                return res.status(500).send(err)
            else
            // 아니면 결과물을 가져와라
                return res.json(results)
        })
    })

    // 클라이언트에서 입력한 값을 데이터 베이스 lists 테이블에 넣어주기
    app.post('/api/value', function(req,res,next){
        // 데이터베이스에 값을 넣어주기 (body를 가져올수있는 이유는 3번재 줄의 bodyparser를 호출해오기 때문)
        db.pool.query(`INSERT INTO lists (value) VALUES("${req.body.value}")`,
        (err,results,fileds) =>{
            if(err)
                //만약 에러면 상태 500을 보내고
                return res.status(500).send(err)
            else
                //아니면 결과물을 lists에 넣어라
                return res.json({ success: true, value: req.body.value })
        })
    })

    // 작업할 내용을 작성한 후 이러한 작업이 진행될 테이블 생성 코드 작성 하기
    // id는 인트로 생성되며 자동으로 1씩 증가
    // 값은 text로 저장
    // 작됭되면 콘솔에 결과를 출력
    db.pool.query(`CREATE TABLE lists(
        id INTEGER AUTO_INCREMENT,
        value TEXT,
        PRIMARY KEY (id)
    )`, (err, results, fileds)=>{
        console.log('results', results)
    })
~~~


## 2. React.js 코드작성
<hr/>
- 