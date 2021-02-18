import useSWR, {SWRConfig} from 'swr'

function Data() {
  const { data } = useSWR('something data api adress')

  // return ( ... )
}

function App() {
  return (
    <SWRConfig value={{
      refreshInterval: 3000,
      fetcher: (resource, init) => fetch(resource,init).then(res => res.json())
    }}>
      <Data />
    </SWRConfig>
  );
}

export default App;
