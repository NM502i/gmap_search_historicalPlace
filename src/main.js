import { createApp } from 'vue'
import App from '@/App.vue'
import router from './router'

import { registerSW } from 'virtual:pwa-register';
registerSW();

import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';

import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import 'vuetify/styles';
import '@/sass/variables.scss'


const myCustomLightTheme = {
    dark: false,
    colors: {
      background: '#FFFFFF',
      surface: '#FFFFFF',
      primary: '#3399E3',
      'primary-darken-1': '#3700B3',
      secondary: '#03DAC6',
      'secondary-darken-1': '#018786',
      error: '#B00020',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FB8C00',
    },
  };

const vuetify = createVuetify({
  theme: {
        defaultTheme: 'myCustomLightTheme',
        themes: {
          myCustomLightTheme,
        },
      },
  components,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(vuetify)
app.use(pinia)
pinia.use(piniaPluginPersistedstate)
app.mount('#app')