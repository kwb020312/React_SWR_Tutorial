해당 저장소는 SWR <a href="https://swr.vercel.app/">공식 홈페이지</a>를 보고 작성되었음을 알립니다.


- Jamstack 지향
- 고속 , 경량 및 재사용 가능한 데이터 페칭
- 내장 캐시 및 요청 중복 제거
- 실시간 경험
- 전송 및 프로토콜에 구애받지 않음
- TypeScript 특화
- 네이티브 반응

이라고 소개되는 SWR은 기존 axios의 여러가지 사용자 불만사항을 개선하여 나오게 된 React Hooks 이다.

```javascript
import useSWR from 'swr'

function Profile() {
    const { data, error } = useSWR('/api/user' , fetcher)

    if(err) return <div>failed to load</div>
    if(!data) return <div>Loading...</div>
    return <div>Hello {data.name}!</div>
}
```

위 사항이 SWR의 기본구조 이며 fetcher 란 콜백함수를 의미한다.

## 설치

먼저 React 라이브러리 이므로 React 설치를 해야한다.

```javascript
npx create-react-app swr
cd swr
npm start
```

그 후 

```javascript
npm install swr
```

## fetcher

앞서 말했던 fetcher 콜백함수는 JSON데이터 를 다루는 RESTful API 경우 fetch를 해주어야 하는데

```javascript
const fetcher = (...args) => fetch(...args).then(res => res.json())
```

해당 함수를 앞서봤던 useSWR의 두번째 인자로 넣어주는 것이다.

이제 지옥같던 React 전달 방식 개선이 가능한데,

```javascript
function getData() {
    fetch('test').then(res => res.json()).then(data => setData(data))
}

return (
    <TestComponent data={data}>
        <TestChild data={data} />
    </TestComponent>
)
```

위와 같은 기존의 방식이 아닌

```javascript
function Content() {
    const { data , isLoading } = Profile()
    if (isLoading) return <Other />
    return <h1>Hi ! It is Content {data.mainData}</h1>
}
function Page() {
    return (
        <Content />
    )
}
```

단순 구조 변경이 가능한 것이다!

## fetcher function

fetcher 함수는 3가지 매개 변수를 갖는다.
1. key: 요청에 대한 고유 키 문자열 (api 주소)
2. [fetcher]: 데이터 처리 시 사용할 Promise 반환 함수
3. [options]: SWR Hooks 에 대한 옵션 객체

옵션에 대한 정보는 너무 많기에 <a href="https://swr.vercel.app/docs/options">해당 링크</a>에서 참고할 수 있도록 하자

return 값 은 4가지가 있는데

- data : 주어진 key에 해당하는 정보
- error : 오류 발생 시 정보
- isValidating : 요청에 재 검증이 필요한 경우
- mutate : 캐시 된 데이터를 변경하는 기능

## SWRConfig

만약 api를 항상 최신의 상태로 유지하고 싶다면 어떻게해야할까??
기존의 React Hooks 라면 useEffect를 일정 주기마다 호출해야 할 것이다.
하지만 SWR 의 경우는 전용 함수를 지원하는데

```javascript
import useSWR, {SWRConfig} from 'swr'

// 3초 마다 불러와질 함수
function Data() {
  const { data } = useSWR('something data api adress')
  // return ( ... )
}

function App() {
  return (
    <SWRConfig value={{
      // 3초 마다 불러올 것을 정의
      refreshInterval: 3000,
      // fetcher 함수 기존과 동일함
      fetcher: (resource, init) => fetch(resource,init).then(res => res.json())
    }}>
      <Data />
    </SWRConfig>
  );
}
```

## 호환성

SWR은 다른 API 호출 함수들과 호환이 매우 잘 되는데 Axios , GraphQL 그리고 내장 fetch 함수 모두 지원한다.

```javascript
import useSWR from 'swr'
import axios from 'axios'

// Fetch
const fetcher = url => fetch(url).then(res => res.json())
// Axios
const fetcher = url => axios.get(url).then(res => res.data)

function App() {
    const { data , error } = useSWR('API Adress' , fetcher)
    // return ( ... )
    // GraphQL 의 경우 Query 를 useSWR('해당부분에 삽입')
    const { data , error } = useSWR(`
        Movie(title: "Inception") {
            actors {
                name
            }
            rating
            comments
        }
    ` , fetcher)
}
```