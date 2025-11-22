import React from 'react'

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    variant?: 'primary' | 'danger' | 'ghost'
    icon?: React.ReactNode
}

export default function LiquidButton({
    children,
    variant = 'primary',
    icon,
    className = '',
    ...props
}: LiquidButtonProps) {

    const baseStyles = "relative px-8 py-4 rounded-full font-bold tracking-widest text-sm uppercase flex items-center justify-center gap-3 group transition-all duration-500 border-2"

    const variants = {
        primary: "text-cyan-300 hover:text-cyan-100 border-cyan-500 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]",
        danger: "text-red-400 hover:text-red-100 border-red-500 hover:border-red-400 hover:shadow-[0_0_30px_rgba(248,113,113,0.6)]",
        ghost: "text-white/60 hover:text-white border-white/30 hover:border-white/60"
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {/* Liquid Background Effect (Pseudo-element handled in CSS, but we add a glow here) */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] ease-in-out" />

            {/* Icon */}
            {icon && (
                <span className="transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                    {icon}
                </span>
            )}

            {/* Text */}
            <span className="relative z-10">{children}</span>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-tl-md" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-br-md" />
        </button>
    )
}
