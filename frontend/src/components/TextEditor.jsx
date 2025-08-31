import React from 'react'
import { useCallback } from 'react'

function TextEditor({text, onChange, placeholder, disabled}) {

    const handleChange = useCallback((e) => {
        onChange(e.target.value);
    }, [onChange])


    const wordCount = text.trim() ? text.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
    const charCount = text.length
    const maxChars = 5000
    const remainingChars = maxChars - charCount

    return (
    <section className='bg-white rounded-xl shadow-lg p-6'>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Text Editor</h3>
            <div className="text-sm text-gray-500">
                {wordCount} words • {charCount} characters
            </div>
        </div>

        <textarea
            className={`
                w-full text-editor p-4 border-2 border-gray-200 rounded-lg
                focus:border-blue-500 focus:outline-none resize-y
                ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-75' : 'bg-white'}
                transition-all duration-200
            `}
            value={text}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={12}
            maxLength={maxChars}
            style={{minHeight: '300px'}}
        />

        <div className="mt-3 flex justify-between items-center text-xs">
            <span className="text-gray-400">
                Maximum {maxChars.toLocaleString()} characters
            </span>
            <span className={`
                ${remainingChars < 500 ? 'text-orange-500 font-semibold' : 'text-gray-400'}
                ${remainingChars < 100 ? 'text-red-500' : ''}
                `}>
                {remainingChars.toLocaleString()} remaining
            </span>
        </div>
        
        {/* Progress bar for character count */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
            className={`
                h-2 rounded-full transition-all duration-300
                ${charCount / maxChars < 0.8 ? 'bg-blue-500' : ''}
                ${charCount / maxChars >= 0.8 ? 'bg-orange-500' : ''}
                ${charCount / maxChars >= 0.95 ? 'bg-red-500' : ''}
            `}
            style={{ width: `${Math.min(100, (charCount / maxChars) * 100)}%` }}
            />
        </div>
    </section>


    )
}

export default TextEditor