import AsyncStorage from '@react-native-async-storage/async-storage'

// AsyncStorage keys for persisting auth state between app launches
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const authStorage = {
  getToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(TOKEN_KEY)
  },

  setToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEY, token)
  },

  removeToken: async (): Promise<void> => {
    await AsyncStorage.removeItem(TOKEN_KEY)
  },

  getUser: async (): Promise<any | null> => {
    const userStr = await AsyncStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  },

  setUser: async (user: any): Promise<void> => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  removeUser: async (): Promise<void> => {
    await AsyncStorage.removeItem(USER_KEY)
  },

  clear: async (): Promise<void> => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY])
  },
}
