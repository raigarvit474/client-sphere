import { useState, useEffect } from 'react'

export interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface Toast extends ToastProps {
  id: string
}

let toasts: Toast[] = []
let listeners: Array<(toasts: Toast[]) => void> = []

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export function toast(props: ToastProps) {
  const id = generateId()
  const newToast: Toast = {
    id,
    duration: 5000,
    ...props,
  }
  
  toasts = [...toasts, newToast]
  
  // Notify all listeners
  listeners.forEach(listener => listener([...toasts]))
  
  // Auto remove after duration
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    listeners.forEach(listener => listener([...toasts]))
  }, newToast.duration)
  
  return id
}

export function dismissToast(toastId: string) {
  toasts = toasts.filter(t => t.id !== toastId)
  listeners.forEach(listener => listener([...toasts]))
}

export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>([])
  
  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToastList(newToasts)
    }
    
    listeners.push(listener)
    
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])
  
  return {
    toasts: toastList,
    toast,
    dismiss: dismissToast,
  }
}