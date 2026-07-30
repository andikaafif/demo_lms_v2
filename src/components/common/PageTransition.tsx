import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Box } from '@mui/material'

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      sx={{ height: '100%' }}
    >
      {children}
    </Box>
  )
}
