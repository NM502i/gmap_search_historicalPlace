<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Logo from "@/components/icons/Logo.vue";
import loadJson from "@/assets/setting.json";
import _ from 'lodash'

import { storeToRefs } from 'pinia';
import { useSettingData } from '@/stores/setting_data';

const { setting,update_status } = storeToRefs(useSettingData());

const dialog_notification = ref(false);
const notification_text = ref(null);
const router = useRouter();
const set_config = loadJson;
const loadingState = ref(false);
const scan_distance = ref(null),
scan_shrine = ref(null),
scan_temple = ref(null),
scan_sculpture = ref(null);

(async()=> {
  loadingState.value = true;
  scan_distance.value = set_config.distance[setting.value.scan_distance].id;
  scan_shrine.value = set_config.display[setting.value.scan_shrine].id;
  scan_temple.value = set_config.display[setting.value.scan_temple].id;
  scan_sculpture.value = set_config.display[setting.value.scan_sculpture].id;
  loadingState.value = false;
})();

const back = () => { 

  const update_data = {"scan_distance":scan_distance.value,"scan_shrine":scan_shrine.value,"scan_temple":scan_temple.value,"scan_sculpture":scan_sculpture.value};

  if(!_.isEqual(setting.value, update_data)) {
    setting.value.scan_distance = scan_distance.value;
    setting.value.scan_shrine = scan_shrine.value;
    setting.value.scan_temple = scan_temple.value;
    setting.value.scan_sculpture = scan_sculpture.value; 
    update_status.value.update = true;
  };

  router.push("/"); 
}
  



</script>

<template>
  <v-app>
    <v-overlay
  :model-value="loadingState"
  :persistent="true"
  class="align-center justify-center"
>
  <v-progress-circular
    color="primary"
    indeterminate
    :size="64"
  />
</v-overlay>
    <v-dialog
      v-model="dialog_notification"
      width="auto"
    >
      <v-card>
        <v-card-text class="text-h7">{{notification_text}}</v-card-text>
      </v-card>
    </v-dialog>
    <v-app-bar color="primary">
      <template v-slot:prepend>
      <v-icon :icon="Logo" color="primary"></v-icon>
      </template>
      <v-app-bar-title>史跡チェッカー</v-app-bar-title>
        <v-btn class="header_btn" @click="back">戻る</v-btn>
    </v-app-bar>
    <v-main class="setting">
     <h2>設定一覧</h2>
     <h3>周辺スキャン設定</h3>
     <v-sheet class="rounded-lg">
      <v-select
        v-model="scan_distance"
        :items="set_config.distance"
        item-title="label"
        item-value="id"
        density="compact"
        label="距離"
        hide-details="auto"
      ></v-select>
      <v-select
        v-model="scan_shrine"
        :items="set_config.display"
        item-title="label"
        item-value="id"
        density="compact"
        label="神社"
        hide-details="auto"
      ></v-select>
      <v-select
        v-model="scan_temple"
        :items="set_config.display"
        item-title="label"
        item-value="id"
        density="compact"
        label="寺院"
        hide-details="auto"
      ></v-select>
      <v-select
        v-model="scan_sculpture"
        :items="set_config.display"
        item-title="label"
        item-value="id"
        density="compact"
        label="彫刻"
        hide-details="auto"
      ></v-select>
     </v-sheet>
    </v-main>
  </v-app>
</template>


