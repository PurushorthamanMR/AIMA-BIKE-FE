import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'

interface ViewIconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function ViewIcon({ size = 20, className = '', style }: ViewIconProps) {
  return (
    <FontAwesomeIcon
      icon={faEye}
      style={{ width: size, height: size, fontSize: size, display: 'block', flexShrink: 0, ...style }}
      className={className}
    />
  )
}
