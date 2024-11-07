import { useState } from 'react'
import { MakeContext } from './contextHelper'

const CreateLoading = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<number>()

  const loading = async (
    f: (setProgress: (v: number | undefined) => void) => Promise<void>,
  ) => {
    try {
      setIsLoading(true)
      await f(setProgress)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    progress,
    loading,
  }
}

export const { provider: LoadingProvider, use: useLoading } =
  MakeContext(CreateLoading)
