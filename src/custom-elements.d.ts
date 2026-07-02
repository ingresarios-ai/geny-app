/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'image-slot': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      shape?: string
      radius?: string
      placeholder?: string
    }
  }
}
