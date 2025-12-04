import { useState, useEffect, useRef } from 'react'

const DragBottomSheet = ({ isOpen, onClose, children }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const sheetRef = useRef(null)

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setStartY(e.clientY)
    setCurrentY(e.clientY)
  }

  const handleTouchStart = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setCurrentY(e.touches[0].clientY)
  }


  useEffect(() => {
    const handleMouseMoveEvent = (e) => {
      if (!isDragging) return
      e.preventDefault()
      setCurrentY(e.clientY)
      const offset = Math.max(0, e.clientY - startY)
      setDragOffset(offset)
    }

    const handleTouchMoveEvent = (e) => {
      if (!isDragging) return
      e.preventDefault()
      setCurrentY(e.touches[0].clientY)
      const offset = Math.max(0, e.touches[0].clientY - startY)
      setDragOffset(offset)
    }

    const handleDragEndEvent = () => {
      if (!isDragging) return
      setIsDragging(false)
      
      // Calculate the height of the sheet - use a more reliable calculation
      const sheetHeight = sheetRef.current ? sheetRef.current.offsetHeight : 400
      const threshold = Math.min(150, sheetHeight / 3) // Close if dragged 150px or 1/3 of height
      
      // Close if dragged more than the threshold
      if (dragOffset > threshold) {
        setIsClosing(true)
        // Animate to full height before closing
        setDragOffset(window.innerHeight)
        setTimeout(() => {
          onClose()
          setIsClosing(false)
          setDragOffset(0)
        }, 300) // Match transition duration
        return
      }
      
      // Reset position if not closing
      setDragOffset(0)
      setStartY(0)
      setCurrentY(0)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveEvent)
      document.addEventListener('mouseup', handleDragEndEvent)
      document.addEventListener('touchmove', handleTouchMoveEvent, { passive: false })
      document.addEventListener('touchend', handleDragEndEvent)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveEvent)
        document.removeEventListener('mouseup', handleDragEndEvent)
        document.removeEventListener('touchmove', handleTouchMoveEvent)
        document.removeEventListener('touchend', handleDragEndEvent)
      }
    }
  }, [isDragging, startY, dragOffset, onClose])

  // Reset position when sheet opens
  useEffect(() => {
    if (isOpen) {
      setDragOffset(0)
      setIsClosing(false)
      setIsDragging(false)
      setStartY(0)
      setCurrentY(0)
      // Prevent body scroll when sheet is open
      document.body.style.overflow = 'hidden'
    } else {
      // Restore body scroll when sheet closes
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Prevent scroll during dragging
  useEffect(() => {
    if (isDragging) {
      const preventScroll = (e) => {
        e.preventDefault()
      }
      
      document.addEventListener('touchmove', preventScroll, { passive: false })
      document.addEventListener('wheel', preventScroll, { passive: false })
      
      return () => {
        document.removeEventListener('touchmove', preventScroll)
        document.removeEventListener('wheel', preventScroll)
      }
    }
  }, [isDragging])

  if (!isOpen) return null

  return (
    <>
      <style>
        {`
          .bottom-sheet-content::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end'
    }}>
      <div
        ref={sheetRef}
        style={{
          backgroundColor: 'blackUnable to preventDefault inside passive event listener invocation.',
          width: '100%',
          height: '60vh',
          maxHeight: '600px',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          transform: `translateY(${dragOffset}px)`,
          transition: (isDragging && !isClosing) ? 'none' : 'transform 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #e0e0e0',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div
            style={{
              width: '40px',
              height: '4px',
              backgroundColor: '#d0d0d0',
              borderRadius: '2px',
              position: 'absolute',
              top: '8px'
            }}
          />
          <button
            onClick={() => {
              setIsClosing(true)
              setDragOffset(window.innerHeight)
              setTimeout(() => {
                onClose()
                setIsClosing(false)
                setDragOffset(0)
              }, 300)
            }}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#aaa',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
        <div 
          className="bottom-sheet-content"
          style={{
            flex: 1,
            padding: '20px',
            overflow: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE and Edge
          }}
        >
          {children}
        </div>
      </div>
    </div>
    </>
  )
}

export default DragBottomSheet