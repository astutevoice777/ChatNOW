import { createFileRoute } from '@tanstack/react-router'
import logo from '../logo.svg'
import UploadAudio from '@/components/UploadAudio'

export const Route = createFileRoute('/')({
  component: UploadAudio,
})

