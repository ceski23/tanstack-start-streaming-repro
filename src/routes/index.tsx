import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { useEffect, useState } from 'react'
import { setTimeout } from 'timers/promises'

export const Route = createFileRoute('/')({ component: App })

const streamNumbers = createServerFn({ method: 'GET' }).handler(async function*() {
  const signal = getRequest().signal

  // await setTimeout(50, undefined, { signal })

  for (let i=0; !signal.aborted; i++) {
    yield i
    await setTimeout(1000, undefined, { signal })
  }
})

function App() {
  const [messages, setMessages] = useState<Array<number>>([]);

  useEffect(() => {
    const abortController = new AbortController();

    (async () => {
      for await (const value of await streamNumbers({ signal: abortController.signal })) {
        setMessages((prev) => [...prev, value])
      }
    })()

    return () => abortController.abort()
  }, [])

  return <pre>{JSON.stringify(messages, null, 2)}</pre>
}
