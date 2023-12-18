"use client"

import React, { ComponentProps } from "react";
import { useFormStatus } from "react-dom"

type FormSubmitbuttonProps = {
    children: React.ReactNode,
    className?: string,
} & ComponentProps<"button">

export default function SubmitButton(
    { children, className, ...props }: FormSubmitbuttonProps
) {

    const { pending } = useFormStatus()

    return (
        <button
            {...props}
            type="submit"
            className={`btn btn-primary ${className}`}
            disabled={pending}
        >
            {pending && (<span className="loading loading-dots loading-md" />)}
            {children}
        </button>
    )
}