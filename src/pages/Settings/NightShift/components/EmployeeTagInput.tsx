import { Badge, Box, Flex, IconButton, Text, TextField } from '@radix-ui/themes'
import { X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

interface EmployeeTagInputProps {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  disabled?: boolean
}

const DELIMITER_REGEX = /[\n,]+/
const SUBMIT_KEYS = ['Enter', ',']

const splitTokens = (raw: string): string[] =>
  raw
    .split(DELIMITER_REGEX)
    .map((token) => token.trim())
    .filter(Boolean)

const isSubmitKey = (key: string): boolean => SUBMIT_KEYS.includes(key)

export function EmployeeTagInput({
  value,
  onChange,
  placeholder,
  disabled,
}: EmployeeTagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const composingRef = useRef(false)
  const pendingSubmitRef = useRef(false)

  const addTokens = useCallback(
    (raw: string) => {
      const tokens = splitTokens(raw)
      if (tokens.length === 0) return

      const existing = new Set(value)
      const uniqueTokens = tokens.filter((token) => !existing.has(token))

      if (uniqueTokens.length > 0) {
        onChange([...value, ...uniqueTokens])
      }
      setInputValue('')
    },
    [value, onChange]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isComposing = event.nativeEvent.isComposing || composingRef.current

      if (isComposing && isSubmitKey(event.key)) {
        pendingSubmitRef.current = true
        event.preventDefault()
        return
      }

      if (isSubmitKey(event.key)) {
        event.preventDefault()
        addTokens(inputValue)
        return
      }

      if (event.key === 'Backspace' && !inputValue && value.length > 0) {
        event.preventDefault()
        onChange(value.slice(0, -1))
      }
    },
    [inputValue, value, addTokens, onChange]
  )

  const handleBlur = useCallback(() => {
    if (inputValue.trim()) {
      addTokens(inputValue)
    }
  }, [inputValue, addTokens])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value

      if (!composingRef.current && DELIMITER_REGEX.test(nextValue)) {
        addTokens(nextValue)
        return
      }

      setInputValue(nextValue)
    },
    [addTokens]
  )

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true
  }, [])

  const handleCompositionEnd = useCallback(
    (event: React.CompositionEvent<HTMLInputElement>) => {
      composingRef.current = false

      if (pendingSubmitRef.current) {
        pendingSubmitRef.current = false
        addTokens(event.currentTarget.value)
      }
    },
    [addTokens]
  )

  const handleRemove = useCallback(
    (name: string) => {
      onChange(value.filter((item) => item !== name))
    },
    [value, onChange]
  )

  return (
    <Box>
      {value.length > 0 && (
        <Flex gap="2" wrap="wrap" mb="2">
          {value.map((name) => (
            <Badge key={name} color="gray" variant="soft">
              <Flex align="center" gap="1">
                <Text size="2">{name}</Text>
                <IconButton
                  size="1"
                  variant="ghost"
                  color="gray"
                  aria-label={`${name} 삭제`}
                  onClick={() => handleRemove(name)}
                >
                  <X size={12} />
                </IconButton>
              </Flex>
            </Badge>
          ))}
        </Flex>
      )}

      <TextField.Root
        placeholder={placeholder ?? '이름 입력 후 Enter 또는 , 로 추가'}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        disabled={disabled}
      />
      <Text size="1" color="gray" mt="1" as="div">
        Enter, 쉼표, 줄바꿈으로 여러 명을 한 번에 추가할 수 있습니다.
      </Text>
    </Box>
  )
}
