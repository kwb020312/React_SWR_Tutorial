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