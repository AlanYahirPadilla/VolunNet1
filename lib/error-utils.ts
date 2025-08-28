// Error handling utilities to prevent runtime errors and message channel issues

export class DashboardError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DashboardError'
  }
}

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage: string = 'Operation failed'
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(errorMessage, error)
    return fallback
  }
}

// Debounced error logging to prevent console spam
let errorLogTimeout: NodeJS.Timeout | null = null
const errorLogQueue: Array<{ message: string; error: any }> = []

export function logError(message: string, error: any) {
  errorLogQueue.push({ message, error })
  
  if (errorLogTimeout) {
    clearTimeout(errorLogTimeout)
  }
  
  errorLogTimeout = setTimeout(() => {
    if (errorLogQueue.length > 0) {
      console.group('Dashboard Errors (batched)')
      errorLogQueue.forEach(({ message, error }) => {
        console.error(message, error)
      })
      console.groupEnd()
      errorLogQueue.length = 0
    }
  }, 1000)
}

// Safe state update wrapper
export function safeStateUpdate<T>(
  setter: (value: T | ((prev: T) => T)) => void,
  value: T | ((prev: T) => T)
) {
  try {
    setter(value)
  } catch (error) {
    logError('State update failed', error)
  }
}

// Abort controller wrapper for fetch operations
export function createAbortController(timeoutMs: number = 10000) {
  const controller = new AbortController()
  
  setTimeout(() => {
    try {
      controller.abort()
    } catch (error) {
      // Ignore abort errors
    }
  }, timeoutMs)
  
  return controller
}

// Safe fetch wrapper
export async function safeFetch(
  url: string, 
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = createAbortController(timeoutMs)
  
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new DashboardError('Request timed out', 'TIMEOUT')
    }
    throw error
  }
}






