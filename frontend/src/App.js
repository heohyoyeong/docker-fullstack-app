import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

function App() {

  useEffect(() =>{
    // 여기서 데이터베이스에 있는 값을 가져온다.
    // backend의 server.js에서 app.get('/api/values', 와같이 패스를 잡아주었기 때문에 아래도 동일한 패스로 잡아줌
    axios.get(`/api/values`)
      .then(Response =>{
        console.log('resonse',Response)
        setLists(Response.data)
      })
  }, [])

  // 초기 lists와 value를 설정
  const [lists,setLists] = useState([])
  const [value, setValue] = useState("")

  const changeHandler = (event) => {
    setValue(event.currentTarget.value)
  }

  const submitHandler = (event) => {
    // 원래 이벤트의 기능을 방지
    event.preventDefault();

    axios.post('/api/value', { value: value })
      .then(response => {
        if (response.data.success) {
          console.log('response', response)
          setLists([...lists, response.data])
          setValue("");
        } else {
          alert('값을 DB에 넣는데 실패했습니다.')
        }
      })
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="container">
          {lists && lists.map((list, index) => (
              <li key={index}>{list.value} </li>
            ))}

          <form className="example" onSubmit={submitHandler}>
            <input
              type="text"
              placeholder="입력해주세요..."
              onChange={changeHandler}
              value={value}
            />
            <button type="submit">확인.</button>
          </form>
        </div>
      </header>
    </div>
  );
}

export default App;
