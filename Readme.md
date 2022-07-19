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

- terminal에서 "npx create-react-app frontend" 라는 명령어를 작성하면 자동으로 frontend라는 폴더가 생성되고 react-app이 설치된다.
- frontend/src/App.js와 frontend/src/App.css 를 내가 원하는 방식으로 수정 (코드 복사해옴)
- 그 이후 npm run start를 실행하면 작동하면 실행이 되나 코드 변경시 반영이 되지 않음 (원도우에서만 이러는 것으로 파악)
- 위의 문제는 frontend/package.json에서 수정하면 가능 (https://stackoverflow.com/questions/71297042/react-hot-reload-doesnt-work-in-docker-container 참조)

~~~json
기존 코드에서
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
   
  "scripts": {
    "start": "WATCHPACK_POLLING=true react-scripts start", <= 이부분을 수정하면 리엑트 핫로드 수행가능
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
~~~



## 3. React app을 위한 frontend 도커파일 작성
<hr/>

- frontend에서 사용할 도커파일들을 작성해주어야한다.
- 개발용 Dockerfile.dev과 운영을 위한 Dockerfile을 작성해야한다.
- Dockerfile은 평범하지만 Dockerfile.dev는 조금 다르다.
~~~
    FROM nginx
    EXPOSE 3000

    // 이게 밑에있는 nginx의 설정파일의 위치이며 COPY를 통해 기본파일을 우리가 작성한것으로 덮어쓰기하는것
    COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf 

    // build 파일들을 nginx가 가리키고 있는 경로로 보내라!
    COPY --from=builder /app/build /usr/share/nginx/html
~~~

- frontend에서 사용할 nginx에 대한 설정
~~~
    nginx의 default conf 설명
    server{

        listen 3000; => nginx 서버가 3000번 포트를 받기때문에 작성

        location / <= location/로 갈때 작동한다!

            root /usr/share/nginx/html;  => HTML 파일이 위치할 루트 설정 (Nginx가 생성한 Build 파일들의 위치)
            
            index index.html index.htm;  => 사이트의 index 페이지로 할 파일명 설정
 
            try_files $uri #uri/ /index.html; => React Router를 사용해서 페이지간 이동을 할 떄 이 부분이 필요 (이 부분이 없으면 페이지 이동이 불가능)
        }
    }
~~~


## 4. Node app을 위한 backend 도커파일 작성
<hr/>

- backend에서 사용할 도커파일들을 작성해주어야한다.
- 개발용 Dockerfile.dev과 운영을 위한 Dockerfile을 작성해야한다.
- Dockerfile은 평범하지만 Dockerfile.dev는 조금 다르다.
~~~
    FROM node:alpine

    WORKDIR /app

    COPY ./package.json ./

    RUN npm install

    COPY . .
    
    // package.json에서  코드가 변경될 때 바로 반영해주는 nodemon이라는 모듈을 사용해기 위하여 dev로 사용
    // package.json => "dev": "nodemon server.js"
    CMD ["npm","run","dev"]
~~~


## 5. mysql을 위한 도커파일 작성
<hr/>

- mysql이라는 폴더를 root 디렉토리에 생성후 Dockerfile을 생성

~~~
    // mysql 이미지를 가져와서 생성
    FROM mysql:5.7 

    // 추후 생성할 my.cnf 파일을 지금 작성할 my.cnf파일로 덮어쓰기 
    ADD ./my.cnf /etc/mysql/conf.d/my.cnf
~~~


- 그이후 my.cnf 파일 을 생성, 기본 my.cnf의 경우 라틴어로 설정되어있어 한국어를 사용할 경우 깨는 현상발생
- 이러한 현상을 방지하기 위하여 utf8로 샛팅을 변경해주어야 함

~~~
    [mysqld]
    character-set-server=utf8

    [mysql]
    default-character-set=utf8

    [client]
    default-character-set=utf8
~~~

- 그이후 mysql 내부에 sqls 폴더를 생성한 후 생성한 폴더에 initialize.sql 이라는 DATABASE와 TABLE을 작성

~~~
    DROP DATABASE IF EXISTS myapp; <= 기존에 DATABASE가 있다면 myapp을 드랍하라

    CREATE DATABASE myapp; <= myapp이라는 DATABASE가 생성
    USE myapp; <= myapp이라는 DATABASE를 사용

    CREATE TABLE lists ( <= myapp이라는 DATABASE 내부에 lists라는 TABLE을 생성하는데
        id INTEGER AUTO_INCREMENT, <= id는 int 타입에 1씩 증가하며
        value TEXT, <= 값은 text 이고 
        PRIMARY KEY (id) <= PRIMARY KEY는 id이다.
    );
~~~


## 6. NGINX를 위한 도커파일 작성 (연결 주소에 따라 fronted와 backend를 구분해줄수있는 기능)
<hr/>

- nginx이라는 폴더를 root 디렉토리에 생성후 Dockerfile과 default.conf을 생성
