import { defineStore } from 'pinia';

export const useSettingData = defineStore('setting_data', {
  state: () => ({
    setting: {"scan_distance":0,"scan_shrine":0,"scan_temple":0,"scan_sculpture":0},
    update_status: {"update":false},
  }),
  persist: true,
});
