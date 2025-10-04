'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface CountryCode {
  code: string
  country: string
  flag: string
}

const countryCodes: CountryCode[] = [
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+1', country: 'Barbados', flag: '🇧🇧' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+975', country: 'Bhutan', flag: '🇧🇹' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷' },
  { code: '+1', country: 'Cuba', flag: '🇨🇺' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+1', country: 'Dominican Republic', flag: '🇩🇴' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
  { code: '+1', country: 'Haiti', flag: '🇭🇹' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+98', country: 'Iran', flag: '🇮🇷' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+1', country: 'Jamaica', flag: '🇯🇲' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+218', country: 'Libya', flag: '🇱🇾' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+507', country: 'Panama', flag: '🇵🇦' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+1', country: 'Puerto Rico', flag: '🇵🇷' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+40', country: 'Romania', flag: '🇷🇴' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+221', country: 'Senegal', flag: '🇸🇳' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+963', country: 'Syria', flag: '🇸🇾' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+1', country: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
]

interface CountryCodeSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  allowTyping?: boolean
}

export default function CountryCodeSelector({ 
  value, 
  onChange, 
  className = '',
  allowTyping = false
}: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  
  const selectedCountry = countryCodes.find(country => country.code === value) || countryCodes[0]
  
  const handleSelect = (code: string) => {
    onChange(code)
    setInputValue(code)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  const handleInputBlur = () => {
    // Validate the input and find closest match
    const exactMatch = countryCodes.find(country => country.code === inputValue)
    if (exactMatch) {
      onChange(inputValue)
    } else {
      // Try to find a close match or keep the input value
      const closeMatch = countryCodes.find(country => 
        country.code.startsWith(inputValue) || inputValue.startsWith(country.code)
      )
      if (closeMatch) {
        onChange(closeMatch.code)
        setInputValue(closeMatch.code)
      } else {
        // Keep the user's input if it looks like a valid country code
        if (inputValue.match(/^\+\d{1,4}$/)) {
          onChange(inputValue)
        } else {
          // Reset to previous valid value
          setInputValue(value)
        }
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      {allowTyping ? (
        <div className="flex items-center gap-2 w-full px-3 py-2 text-sm border border-border rounded-md bg-bg-800 text-text-high focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
          <span className="text-lg">{selectedCountry.flag}</span>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={() => setIsOpen(true)}
            placeholder="+91"
            maxLength={4}
            size={1}
            className="bg-transparent outline-none border-none ring-0 focus:ring-0 focus:border-transparent border-transparent text-text-high placeholder-text-mid w-full"
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-bg-750 rounded "
          >
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm border border-border rounded-md bg-bg-800 text-text-high hover:bg-bg-750 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedCountry.flag}</span>
            <span>{selectedCountry.code}</span>
          </div>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-bg-800 border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {countryCodes.map((country) => (
            <button
              key={`${country.code}-${country.country}`}
              type="button"
              onClick={() => handleSelect(country.code)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-bg-750 flex items-center gap-2 ${
                country.code === value ? 'bg-primary text-white' : 'text-text-high'
              }`}
            >
              <span className="text-lg">{country.flag}</span>
              <span className="flex-1">{country.country}</span>
              <span className="text-sm font-medium">{country.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
