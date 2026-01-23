import { createFileRoute } from '@tanstack/react-router'
import Recorder from '@/components/Recorder'

export const Route = createFileRoute('/')({
  component: Recorder,
})

