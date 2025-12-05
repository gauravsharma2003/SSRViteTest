import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

const DragBottomSheet = ({ isOpen, onClose, children }) => {
  const [state, setState] = useState({
    dragOffset: 0,
    isAnimating: false
  })
  
  const dragRef = useRef({
    isDragging: false,
    startY: 0,
    isClosing: false,
    isOpening: false
  })
  
  const sheetRef = useRef(null)
  const animationTimeoutRef = useRef(null)

  const ANIMATION_DURATION = 300
  const CLOSE_THRESHOLD_RATIO = 0.33
  const MIN_CLOSE_THRESHOLD = 150
  const SHEET_HEIGHT = '60vh'
  const MAX_SHEET_HEIGHT = 600

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    dragRef.current.isDragging = true
    dragRef.current.startY = e.clientY
  }, [])

  const handleTouchStart = useCallback((e) => {
    dragRef.current.isDragging = true
    dragRef.current.startY = e.touches[0].clientY
  }, [])


  const closeWithAnimation = useCallback(() => {
    dragRef.current.isClosing = true
    setState(prev => ({ ...prev, dragOffset: window.innerHeight, isAnimating: true }))
    
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current)
    
    animationTimeoutRef.current = setTimeout(() => {
      onClose()
      dragRef.current.isClosing = false
      setState({ dragOffset: 0, isAnimating: false })
    }, ANIMATION_DURATION)
  }, [onClose])

  const handleDragEnd = useCallback(() => {
    if (!dragRef.current.isDragging) return
    dragRef.current.isDragging = false
    
    const sheetHeight = sheetRef.current?.offsetHeight || MAX_SHEET_HEIGHT
    const threshold = Math.min(MIN_CLOSE_THRESHOLD, sheetHeight * CLOSE_THRESHOLD_RATIO)
    
    if (state.dragOffset > threshold) {
      closeWithAnimation()
    } else {
      setState(prev => ({ ...prev, dragOffset: 0 }))
      dragRef.current.startY = 0
    }
  }, [state.dragOffset, closeWithAnimation])

  // Combined effect for drag handling and scroll prevention
  useEffect(() => {
    const drag = dragRef.current
    
    const handleMouseMove = (e) => {
      if (!drag.isDragging) return
      e.preventDefault()
      const offset = Math.max(0, e.clientY - drag.startY)
      setState(prev => ({ ...prev, dragOffset: offset }))
    }

    const handleTouchMove = (e) => {
      if (!drag.isDragging) return
      e.preventDefault()
      const offset = Math.max(0, e.touches[0].clientY - drag.startY)
      setState(prev => ({ ...prev, dragOffset: offset }))
    }

    const handleEnd = () => {
      if (!drag.isDragging) return
      handleDragEnd()
    }

    const preventScroll = (e) => {
      if (drag.isDragging) e.preventDefault()
    }

    // Add all listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleEnd)
    document.addEventListener('wheel', preventScroll, { passive: false })
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleEnd)
      document.removeEventListener('wheel', preventScroll)
    }
  }, [handleDragEnd])

  // Opening animation effect
  useEffect(() => {
    if (isOpen) {
      Object.assign(dragRef.current, { isOpening: true, isClosing: false, isDragging: false, startY: 0 })
      setState({ dragOffset: window.innerHeight, isAnimating: true })
      document.body.style.overflow = 'hidden'
      
      const openTimer = setTimeout(() => {
        setState({ dragOffset: 0, isAnimating: true })
        setTimeout(() => {
          dragRef.current.isOpening = false
          setState(prev => ({ ...prev, isAnimating: false }))
        }, ANIMATION_DURATION)
      }, 10)
      
      return () => {
        clearTimeout(openTimer)
        document.body.style.overflow = 'unset'
      }
    } else {
      document.body.style.overflow = 'unset'
      dragRef.current.isOpening = false
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  const overlayStyle = useMemo(() => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-end'
  }), [])

  const sheetStyle = useMemo(() => ({
    backgroundColor: 'black',
    width: '100%',
    height: SHEET_HEIGHT,
    maxHeight: `${MAX_SHEET_HEIGHT}px`,
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    transform: `translateY(${state.dragOffset}px)`,
    transition: (dragRef.current.isDragging && !dragRef.current.isClosing && !dragRef.current.isOpening) ? 'none' : `transform ${ANIMATION_DURATION}ms ease-out`,
    display: 'flex',
    flexDirection: 'column',
  }), [state.dragOffset, state.isAnimating])

  const headerStyle = useMemo(() => ({
    padding: '16px',
    borderBottom: '1px solid #e0e0e0',
    cursor: dragRef.current.isDragging ? 'grabbing' : 'grab',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  }), [state.isAnimating])

  const pillStyle = useMemo(() => ({
    width: '40px',
    height: '4px',
    backgroundColor: '#d0d0d0',
    borderRadius: '2px',
    position: 'absolute',
    top: '8px'
  }), [])

  const closeButtonStyle = useMemo(() => ({
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }), [])

  const contentStyle = useMemo(() => ({
    flex: 1,
    padding: '20px',
    overflow: 'auto',
    overflowX: 'hidden',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }), [])

  if (!isOpen) return null

  return (
    <>
      <style>
        {'.bottom-sheet-content::-webkit-scrollbar { display: none; }'}
      </style>
      <div style={overlayStyle}>
        <div ref={sheetRef} style={sheetStyle}>
          <div style={headerStyle} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
            <div style={pillStyle} />
            <button onClick={closeWithAnimation} style={closeButtonStyle}>
              ×
            </button>
          </div>
          <div className="bottom-sheet-content" style={contentStyle}>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default DragBottomSheet