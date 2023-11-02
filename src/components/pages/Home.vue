<script setup>
import {ref, onMounted } from 'vue';
import {mdiCogOutline,mdiAlertCircleOutline } from '@mdi/js'
import Logo from "@/components/icons/Logo.vue";
import { useRouter} from 'vue-router'
import { functions } from '@/plugins/firebase';
import { httpsCallable} from 'firebase/functions';
import loadJson from "@/assets/setting.json";

import { storeToRefs } from 'pinia';
import { useSettingData } from '@/stores/setting_data';
import { useStorePlaces } from '@/stores/places_data';

const router = useRouter();
const { addPlaces,resetPlaces,updateTimestamp } = useStorePlaces();
const { setting, update_status } = storeToRefs(useSettingData());
const { caches_places_arr, update } = storeToRefs(useStorePlaces());

const loadingState = ref(false);
const current_location = ref(null);
const observe_element = ref(null);
const placeArr = ref([]);
const set_config = loadJson;
const exist_data = ref(false);
const dialog_notification = ref(false);
const notification_text = ref(null);
const dialog_review = ref(false);
const review_Arr = ref([]);

const getReview = async (place_id) => {
  loadingState.value = true;
  review_Arr.value.length = 0;
  try {
    const getReview = httpsCallable(functions, 'getReview');
    const review_data= await getReview({"place_id":place_id});
    review_data.data.forEach((review, index) => {
      review.score_icon = rating_icon(review.rating);
      review_Arr.value.push(review);
    })
    loadingState.value = false;
    dialog_review.value = true; 
  } catch (exceptionVar) {
      loadingState.value = false;
      dialog_notification.value = true;
      notification_text.value = "レビューを取得できませんでした";
      return;
  } 
};

const rating_icon =  (rating_score) => {
  switch (true) {
      case rating_score > 0.1 && rating_score <= 0.9:
        return new URL("img/icons/rating_05.png", import.meta.url).href;
        break;
      case rating_score >= 1 && rating_score <= 1.4:
        return  new URL("img/icons/rating_10.png", import.meta.url).href;
        break;
      case rating_score >= 1.5 && rating_score <= 1.9:
        return new URL("img/icons/rating_15.png", import.meta.url).href;
        break;
      case rating_score >= 2 && rating_score <= 2.4:
        return new URL("img/icons/rating_20.png", import.meta.url).href;
        break;
      case rating_score >= 2.5 && rating_score <= 2.9:
        return new URL("img/icons/rating_25.png", import.meta.url).href;
        break;
      case rating_score >= 3 && rating_score <= 3.4:
        return new URL("img/icons/rating_30.png", import.meta.url).href;
        break;
      case rating_score >= 3.5 && rating_score <= 3.9:
        return new URL("img/icons/rating_35.png", import.meta.url).href;
        break;
      case rating_score >= 4 && rating_score <= 4.4:
        return new URL("img/icons/rating_40.png", import.meta.url).href;
        break;
      case rating_score >= 4.5 && rating_score <= 4.9:
        return new URL("img/icons/rating_45.png", import.meta.url).href;
        break;
      case rating_score === 5:
        return new URL("img/icons/rating_50.png", import.meta.url).href;
        break;
      default:
        return new URL("img/icons/rating_00.png", import.meta.url).href;
    }
};

const getPlacedata = async(send_push) => {
  loadingState.value = true;

  if(!await checkOnline()) {
    loadingState.value = false;
    dialog_notification.value = true;
    notification_text.value = "ネットワークがオフラインです。ネットワークに接続してから再度お試しください";
    return;
  }
  
  try {
    current_location.value = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  } catch (exceptionVar) {
      loadingState.value = false;
      dialog_notification.value = true;
      notification_text.value = "緯度と経度を取得できませんでした。GPSが有効になっているか確認してください";
      return;
  } 

  const id_arr = [];

  if(placeArr.value.length > 0) {
    for (let place of placeArr.value) {
      id_arr.push(place.id);
    }
  }

  let raw_data = null;

  try {
      const addMessage = httpsCallable(functions, 'getPlaceData');
      raw_data = await addMessage({
      "location":{
        "lat":current_location.value.coords.latitude,"lng":current_location.value.coords.longitude
      },
      "set":{
        "distance":set_config.distance[setting.value.scan_distance].data,
        "shrine":set_config.display[setting.value.scan_shrine].data,
        "temple":set_config.display[setting.value.scan_temple].data,
        "sculpture":set_config.display[setting.value.scan_sculpture].data
      },
      "old_id":id_arr,
      "notification":send_push.status
    });
  } catch (exceptionVar) {
      loadingState.value = false;
      dialog_notification.value = true;
      notification_text.value = "データを取得できませんでした";
      return;
  } 

  let placeArr_temp = [];
  resetPlaces();
  
  for (let places of raw_data.data) {
    if(places.photo_reference == null) {
      places.photo_reference = new URL("img/no-image.png", import.meta.url).href;
    }

    places.route = `http://maps.google.com/maps?saddr=${current_location.value.coords.latitude},${current_location.value.coords.longitude}&daddr=${places.location.lat},${places.location.lng}&dirflg=w`;

    places.rating_icon = rating_icon(places.rating_score);

    let disabled_review = true;

    if(Number(places.rating_number) > 0) {
      disabled_review = false;
    }

    places.disabled_review = disabled_review;

    placeArr_temp.push(places);
    addPlaces(places);
  }

  placeArr.value = placeArr_temp;
  
  if(placeArr.value.length > 0) {
    exist_data.value = true;
  } else {
    exist_data.value = false;
    dialog_notification.value = true;
    notification_text.value = "周囲の史跡は見つかりませんでした";
  }

  updateTimestamp();
  loadingState.value = false;

};

const checkOnline = async () => {
  const date = new Date();
  const timestamp = date.getTime();

  try {
    let url = `/favicon.ico?${timestamp}`;
    let url02 = new URL(url, import.meta.url).href;
    await fetch(url02);
  } catch {
    return false;
  }
  return true;
};

onMounted(async () => {  
  if(update.value === 0){
    getPlacedata({'status':false});
  }

  if(caches_places_arr.value.length > 0) {
    placeArr.value = caches_places_arr.value;
    exist_data.value = true;
  }

  if(update_status.value.update) {
    getPlacedata({'status':false});
    update_status.value.update = false;
  } 
})

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
    <v-dialog
        v-model="dialog_review"
        width="auto"
        class="review_dialog"
    >

      <v-sheet>   
          <v-row v-for="(review) in review_Arr" class="d-flex flex-column" v-bind:key="review.id">
            <div class="d-flex justify-start">
              <v-avatar>
                <v-img
                :src="review.photo"
                alt="review.author_name"
                ></v-img>
              </v-avatar>
              <div class="author_space">
                <p>{{ review.author_name }}</p>
                <span>{{ review.time }}</span>
              </div>
            </div>
            <div class="rating_space">
              <div class="d-flex justify-start">
                <span>{{ review.rating }}</span>
                <img :src="review.score_icon">
              </div>
              <p>{{ review.text }}</p>
            </div>
          </v-row>
      </v-sheet>
    </v-dialog>
    <v-app-bar color="primary">
      <template v-slot:prepend>
      <v-icon :icon="Logo" color="primary"></v-icon>
      </template>
      <v-app-bar-title>史跡チェッカー</v-app-bar-title>
        <v-btn icon>
          <v-icon :icon="mdiCogOutline" @click="router.push('/setting');" size="x-large" />
        </v-btn>
    </v-app-bar>
    <v-main v-if="exist_data">
      <v-sheet v-show="exist_data" height="36px"
      class= "d-flex align-center justify-center rounded-lg notification"
      >
          <v-icon :icon="mdiAlertCircleOutline" />
          <p class="text-body-2">
            周辺に<span>{{placeArr.length}}</span>件の史跡が見つかりました
          </p>
      </v-sheet>
      <v-sheet class="place_data" v-for="(place) in placeArr" v-bind:key="place.id">
        <v-row class="d-flex justify-start position-relative" v-bind:class="{ update: place.update }">
          <div class="thumbnail_space">
            <v-img
            :aspect-ratio="1/1"
            cover
            :src="place.photo_reference"
            ></v-img>
            <span v-show="place.update" class="updated">New</span>
          </div>
          <div class="info">
            <p class="name">{{ place.name }}</p>
            <div class="d-flex justify-start position-relative rating">
              <span>{{ place.rating_score }}</span>
              <img :src= "place.rating_icon">
              <span>({{place.rating_number}})</span>
            </div>
            <p class="address">{{ place.address }}</p>
            <v-btn class="note distance">約{{ place.distance }}m</v-btn>
            <v-btn class="note time">徒歩{{ place.distance_time }}</v-btn>
            <v-row class="button">
              <v-btn
              :href="place.route"
              target="_blank">経路</v-btn>
              <v-btn
              @click="getReview(place.id)"
              v-bind:disabled="place.disabled_review"> クチコミ </v-btn>
            </v-row>
          </div>
        </v-row>
      </v-sheet>
    <div ref="observe_element"></div>
    </v-main>
	<v-main v-else-if="exist_data === false">
    <v-row
      class= "d-flex align-center justify-center"
      no-gutters
      style="height: 100%;"
    >
      <p class="no_data">表示するデータが存在しません</p>
    </v-row>
  </v-main>
  <v-footer class= "d-flex align-center justify-center" app>
    <v-btn @click="getPlacedata({'status':false})"> 周辺をスキャンする </v-btn>
  </v-footer>
  </v-app>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
