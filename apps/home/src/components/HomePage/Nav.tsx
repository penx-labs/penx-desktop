import { ReactNode } from 'react'
import { Box } from '@fower/react'
import { StyledLink } from '../StyledLink'

type NavItem = {
  text?: ReactNode
  icon?: ReactNode
  to: string
  isExternal?: boolean
}

export const Nav = () => {
  const navData: NavItem[] = [
    {
      text: 'Bounty tasks',
      to: '/tasks',
    },
    {
      text: 'Believer NFTs',
      to: '/believer-nft',
    },

    {
      text: 'Whitepaper',
      to: 'https://whitepaper.penx.io',
      isExternal: true,
    },

    {
      text: 'Downloads',
      to: 'https://github.com/penxio/penx/releases',
      isExternal: true,
    },
    {
      text: 'Feedback',
      to: 'https://github.com/penxio/penx/issues',
      isExternal: true,
    },
    { text: 'Docs', to: 'https://docs.penx.io/', isExternal: true },
  ]

  return (
    <Box listNone toCenterY gap6 textBase>
      {navData.map((item, i) => {
        if (item.isExternal) {
          return (
            <Box key={i}>
              <Box
                as="a"
                href={item.to}
                target="_blank"
                cursorPointer
                gray600
                toCenterY
                gap1
                brand500--hover
                noUnderline
                transitionCommon
              >
                {item.text && <Box>{item.text}</Box>}
                {!!item.icon && item.icon}
                {/* <Box inlineFlex>
                  <ExternalLink size={16}></ExternalLink>
                </Box> */}
              </Box>
            </Box>
          )
        }

        return (
          <Box key={i}>
            <StyledLink
              href={item.to}
              gray600
              brand500--hover
              transitionCommon
              noUnderline
            >
              {item.text}
            </StyledLink>
          </Box>
        )
      })}
    </Box>
  )
}