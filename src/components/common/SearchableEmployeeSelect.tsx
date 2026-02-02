import { Box, Text, TextField, Theme } from '@radix-ui/themes'
import { Check, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface BaseEmployee {
  id: string | number
  name: string
}

interface SearchableEmployeeSelectProps<T extends BaseEmployee> {
  employees: T[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  label?: string
  showAllOption?: boolean
  allOptionLabel?: string
  getEmployeeId?: (employee: T) => string
  getEmployeeName?: (employee: T) => string
}

export function SearchableEmployeeSelect<T extends BaseEmployee>({
  employees,
  value,
  onValueChange,
  placeholder = '직원을 선택하세요',
  label,
  showAllOption = false,
  allOptionLabel = '전체',
  getEmployeeId = (emp) => String(emp.id),
  getEmployeeName = (emp) => emp.name,
}: SearchableEmployeeSelectProps<T>) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isTyping, setIsTyping] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // value가 변경되면 input에 직원 이름 표시 (타이핑 중이 아닐 때만)
  useEffect(() => {
    if (isTyping) return

    if (value === 'all') {
      setInputValue('')
    } else if (value) {
      const employee = employees.find((emp) => getEmployeeId(emp) === value)
      if (employee) {
        setInputValue(getEmployeeName(employee))
      }
    } else {
      setInputValue('')
    }
  }, [value, employees, isTyping, getEmployeeId, getEmployeeName])

  const filteredEmployees = useMemo(() => {
    const query = inputValue.trim().toLowerCase()
    if (!query) return employees

    return employees.filter((emp) =>
      getEmployeeName(emp).toLowerCase().includes(query),
    )
  }, [employees, inputValue, getEmployeeName])

  // 드롭다운 위치 계산
  const updateDropdownPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [])

  // 외부 클릭 감지
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setHighlightedIndex(-1)
        setIsTyping(false)
      }
    }

    // 약간의 지연을 두고 리스너 등록 (드롭다운이 열린 후)
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 드롭다운이 열릴 때 위치 업데이트
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition()
      // 스크롤 시 위치 업데이트
      const handleScroll = () => updateDropdownPosition()
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleScroll)

      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', handleScroll)
      }
    }
  }, [isOpen, updateDropdownPosition])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setIsTyping(true)
    setInputValue(newValue)
    setIsOpen(true)
    setHighlightedIndex(-1)

    // 입력값을 완전히 지웠을 때만 "전체" 선택 (showAllOption이 true인 경우)
    // value가 비어있지 않은 상태에서 입력값만 지운 경우는 선택 해제
    if (!newValue && showAllOption && value) {
      onValueChange('all')
      setIsTyping(false)
    } else if (!newValue && !showAllOption && value) {
      onValueChange('')
      setIsTyping(false)
    }
  }

  const handleSelect = (employee: T) => {
    setIsTyping(false)
    setInputValue(getEmployeeName(employee))
    onValueChange(getEmployeeId(employee))
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleSelectAll = () => {
    setIsTyping(false)
    setInputValue('')
    onValueChange('all')
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true)
      return
    }

    if (!isOpen) return

    const totalItems = showAllOption
      ? filteredEmployees.length + 1
      : filteredEmployees.length

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev))
        break

      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break

      case 'Enter':
        e.preventDefault()
        if (highlightedIndex === -1) {
          setIsOpen(false)
        } else if (showAllOption && highlightedIndex === 0) {
          handleSelectAll()
        } else {
          const targetIndex = showAllOption
            ? highlightedIndex - 1
            : highlightedIndex
          if (filteredEmployees[targetIndex]) {
            handleSelect(filteredEmployees[targetIndex])
          }
        }
        break

      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setHighlightedIndex(-1)
        break

      default:
        break
    }
  }

  const handleFocus = () => {
    // 포커스만으로는 드롭다운을 열지 않음
    // 클릭이나 입력 시에만 열림
  }

  const handleClick = () => {
    setIsOpen(true)
  }

  // 드롭다운을 Portal로 렌더링
  const renderDropdown = () => {
    if (!isOpen) {
      return null
    }

    // 검색 결과가 없고 showAllOption도 없으면 드롭다운 표시
    const hasOptions = filteredEmployees.length > 0 || showAllOption
    if (!hasOptions) {
      return null
    }

    const isAllSelected = value === 'all'

    return createPortal(
      <Theme asChild>
        <div
          ref={dropdownRef}
          id="employee-listbox"
          role="listbox"
          className="rt-SelectContent rt-variant-solid rt-r-size-2"
          data-side="bottom"
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 99999,
            pointerEvents: 'auto',
          }}
        >
          <div
            className="rt-SelectViewport"
            style={{ maxHeight: '300px', overflowY: 'auto' }}
          >
            {showAllOption && (
              <div
                role="option"
                aria-selected={isAllSelected}
                onClick={handleSelectAll}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectAll()
                  }
                }}
                tabIndex={0}
                className="rt-SelectItem"
                data-highlighted={highlightedIndex === 0 ? '' : undefined}
                onMouseEnter={() => setHighlightedIndex(0)}
              >
                <span className="rt-SelectItemIndicator" aria-hidden="true">
                  {isAllSelected ? (
                    <Check className="rt-SelectItemIndicatorIcon" />
                  ) : null}
                </span>
                {allOptionLabel}
              </div>
            )}
            {filteredEmployees.length === 0 ? (
              <div className="rt-SelectItem" data-disabled="">
                검색 결과 없음
              </div>
            ) : (
              filteredEmployees.map((emp, index) => {
                const actualIndex = showAllOption ? index + 1 : index
                const empId = getEmployeeId(emp)
                const empName = getEmployeeName(emp)
                const isSelected = value === empId
                return (
                  <div
                    key={empId}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(emp)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSelect(emp)
                      }
                    }}
                    tabIndex={0}
                    className="rt-SelectItem"
                    data-highlighted={
                      highlightedIndex === actualIndex ? '' : undefined
                    }
                    onMouseEnter={() => setHighlightedIndex(actualIndex)}
                  >
                    <span className="rt-SelectItemIndicator" aria-hidden="true">
                      {isSelected ? (
                        <Check className="rt-SelectItemIndicatorIcon" />
                      ) : null}
                    </span>
                    {empName}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </Theme>,
      document.body,
    )
  }

  return (
    <Box ref={containerRef} style={{ position: 'relative' }}>
      {label && (
        <Text
          as="label"
          size="2"
          weight="medium"
          style={{ display: 'block', marginBottom: '8px' }}
        >
          {label}
        </Text>
      )}
      <TextField.Root
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onClick={handleClick}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="employee-listbox"
        autoComplete="off"
      >
        <TextField.Slot>
          <Search size={16} />
        </TextField.Slot>
      </TextField.Root>

      {renderDropdown()}
    </Box>
  )
}
