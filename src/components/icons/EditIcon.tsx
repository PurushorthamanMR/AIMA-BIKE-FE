import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'

interface EditIconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function EditIcon({ size = 20, className = '', style }: EditIconProps) {
  return (
    <FontAwesomeIcon
      icon={faPenToSquare}
      style={{ width: size, height: size, fontSize: size, display: 'block', flexShrink: 0, ...style }}
      className={className}
    />
  )
}
