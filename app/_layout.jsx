import React from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '../AuthContext'

const _layout = () => {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false
        }}
      />
    </AuthProvider>
  )
}

export default _layout