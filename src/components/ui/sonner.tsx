import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "#18181b",
          "--normal-text": "#FFFBFF",
          "--normal-border": "#27272a",
          "--success-bg": "#7089A8",
          "--success-text": "#191919",
          "--error-bg": "#ef4444",
          "--error-text": "#FFFBFF",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
