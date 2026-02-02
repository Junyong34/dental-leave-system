import { Callout } from '@radix-ui/themes'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface NotificationCalloutProps {
  type: 'success' | 'error'
  message: string
}

export function NotificationCallout({
  type,
  message,
}: NotificationCalloutProps) {
  return (
    <Callout.Root color={type === 'success' ? 'green' : 'red'}>
      <Callout.Icon>
        {type === 'success' ? (
          <CheckCircle2 size={16} />
        ) : (
          <AlertCircle size={16} />
        )}
      </Callout.Icon>
      <Callout.Text>{message}</Callout.Text>
    </Callout.Root>
  )
}
