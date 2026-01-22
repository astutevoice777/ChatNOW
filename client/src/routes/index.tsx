import { createFileRoute } from '@tanstack/react-router'
import logo from '../logo.svg'
import Recorder from '@/components/Recorder'
import UploadAudio from '@/components/UploadAudio'

export const Route = createFileRoute('/')({
  component: Recorder,
})

