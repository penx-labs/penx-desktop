import { Box, FowerHTMLProps } from '@fower/react'
import { IconLogo } from '@penx/icons'

interface Props extends FowerHTMLProps<'div'> {
  size?: number
  showText?: boolean
  stroke?: number | string
  showImage?: boolean
}

export const Logo = ({
  showText = true,
  showImage = false,
  size = 32,
  stroke = 2,
  ...rest
}: Props) => {
  const content = (
    <>
      {showImage && (
        <IconLogo
          size={size * 0.9}
          strokeWidth={30}
          stroke="black"
          fillWhite--dark
          stroke--dark="white"
        />
      )}

      {showText && (
        <Box>
          <Box text={size} fontBold toCenterY>
            <Box>Pen</Box>
            <Box brand500>X</Box>
          </Box>
        </Box>
      )}
    </>
  )
  return (
    <Box toCenterY gray800--hover black gapX1 {...rest}>
      {content}
    </Box>
  )
}
