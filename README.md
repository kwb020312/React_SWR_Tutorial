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

## error

SWR의 에러 핸들링은 생각보다 간단하다 fetcher함수 내에서 error가 발생한다면 Hooks에 의해 반환되는데

```javascript
const fetcher = url => fetch(url).then(res => res.json())

// error가 있는경우 error변수에 객체가 담긴다.
const { data , error } = useSWR('/api/user',fetcher)
```

또한 더 자세한 정보를 얻고싶다면 사용자 정의가 가능한데,

```javascript
const fetcher = async url => {
    const res = await fetch(url)

    // status code가 200-299의 범위가 아니라면 res.ok = false
    if(!res.ok) {
        const error = new Error('문제가 발생했습니다.')
        error.info = await res.json()
        error.status = res.status
        throw error
    }
    return res.json()
}
```

위와 같이 fetcher를 정의한다.

또한 오류가 발생한 경우 useSWR의 3번째 인자를 사용하여 재시도가 가능하다

```javascript
useSWR('API 경로',fetcher함수,{
    // error인 경우 호출된다면 재시도
    onErrorRetry: ( err , key , config , revalidate ,{ retryCount }) => {
        // 404 code error인 경우
        if(err.status === 404) return
        // 경로가 잘못된 경우
        if(key === 'API 경로') return
        // 10번 이상 재시도 하는경우
        if(retryCount >= 10) return

        // revalidate함수를 호출하는 경우 해당 객체를 5번째 인자로 전달하며 onErrorRetry함수가 재실행됨
        setTimeout(() => revalidate({ retryCount: retryCount + 1 }), 5000)
    }
})
```

## 최신화

SWR의 가장 유용한점은 API 경로로 감지한 데이터가 변경되었을 때 자동으로 화면에 다시 그려준다는 것이다. 공식 홈페이지의 mp4데이터를 참고하자면

<video autoplay loop playsinline src="https://raw.githubusercontent.com/vercel/swr-site/master/.github/videos/focus-revalidate.mp4">

리로딩 되는 주기는 

```javascript
useSWR('/api/todos' , fetcher , { refreshInterval: 1000 })
```

위와같이 수정할 수 있다.

<video autoplay loop playsinline src="https://raw.githubusercontent.com/vercel/swr-site/master/.github/videos/refetch-interval.mp4">

## 조건부 데이터 패칭

SWR은 key값이 잘못되었다면 요청조차 시작시키지 않는다.

```javascript
// condition fetching
const { data } = useSWR(isNowFetch? '/api/data' : null , fetcher함수)

// 함수형도 가능하다.
const { data } = useSWR(() => isNowFetch ? '/api/data' : null , fetcher)

// 정의되지않은 변수 및 잘못된 경로로 접근했을 경우 error를 return함
const { data } = useSWR(() => '/api/data?uid=' + undefinedValue , fetcher)
```

## token

API를 사용하는 경우에는 토큰을 전달해야할 때가 있는데,
아래와 같은 형식을 써야한다

```javascript
useSWR(['/api/user', token], fetchWithToken)
```

## 동적로드 - useSWRInfinite

예를들어 게시판을 만들고자 할 때 

<img src="gitImages\inf_load.png">

위와 같은 페이지인 경우 

```javascript
// 피해야할 문법
for(let i = 0 ; i < cnt ; i ++) {
    const { data } = useSWR(`/api/data?page=${i}`)
    list.push(data)
}

// 다른 Component 생성
function Page({index}) {
    const { data } = useSWR(`/api/data?page=${index}` , fetcher)

    return data.map(item => <div key={item.id}>{item.name}</div>)
}

// 반복문에 사용함
for(let i = 0 ; i < cnt ; i++) {
    list.push(<Page index={i} key={i} />)
} 
```

하지만 몇몇 요청에서는 위와같은 작업들이 매우 불편하거나 동작하지 않을 수 있다.
그럴 때에 사용해야하는 것이 useSWRInfinite함수인데

```javascript
const { data, error, isValidating, mutate, size, setSize } = useSWRInfinite(getKey, fetcher?, options?)
```

위와같은 구조를 갖고있으며 useSWR과 유사한데 첫 번째 인자인 getKey의 경우 기존 API 경로와 같으며 fetcher함수 또한 마찬가지이다.

- data: 각 페이지 응답 값
- size: 가져와서 반환할 페이지 수
- setSize: 가져와야 할 페이지 수

## 프리 패칭 - mutate

때때로 화면이 렌더링 되기전에 미리 데이터를 프리로드 할 수 있어야한다
이 때 사용하는 함수가 mutate인데,

```javascript
import { mutate } from 'swr'

function prefetch() {
    // 첫 번째 파라미터는 경로이며 두 번째 파라미터는 Promise이다.
    mutate('/api/data' , fetch('/api/data').then(res => res.json()))
}
```

이러한 특징들 덕분에 Next.js와 함께 사용할 때 유용하며 같은 회사에서 개발된 라이브러리 이다.

## 장점

SWR의 장점은 3가지로 소개하고 있다.

- 불필요한 요청 없음
- 불필요한 리렌더링 없음
- 불필요한 코드를 가져 오지 않음
