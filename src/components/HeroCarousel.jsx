import { useState, useEffect } from 'react'

function HeroCarousel() {
    const slides = [
        { id: 1, color: 'bg-green-500' },
        { id: 2, color: 'bg-green-600' },
        { id: 3, color: 'bg-green-700' }
    ]

    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length)
        }, 1500) // Auto slide every 1.5 seconds

        return () => clearInterval(interval)
    }, [slides.length])

    return (
        <div className='relative rounded-lg overflow-hidden'>
            <div className='relative h-40 overflow-hidden'>
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                            index === currentIndex
                                ? 'translate-x-0'
                                : index < currentIndex
                                ? '-translate-x-full'
                                : 'translate-x-full'
                        } ${slide.color}`}
                    >
                        <div className='w-full h-full flex items-center justify-center'>
                            <span className='text-white text-xl font-bold opacity-50'>Slide {slide.id}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default HeroCarousel

