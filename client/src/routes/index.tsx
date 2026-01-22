import { createFileRoute } from '@tanstack/react-router'
import logo from '../logo.svg'
import Recorder from '@/components/Recorder'

export const Route = createFileRoute('/')({
  component: Recorder,
})

