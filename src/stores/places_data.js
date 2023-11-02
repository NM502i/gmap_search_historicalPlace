import { defineStore } from 'pinia';

export const useStorePlaces = defineStore('places_data', {
  state: () => ({
    caches_places_arr: [],
    update: 0,
  }),
  actions: {
    addPlaces(place) {
      this.caches_places_arr.push(place);
    },
    resetPlaces() {
      this.caches_places_arr = []
    },
    updateTimestamp(){
      const date = new Date();
      this.update = date.getTime() ;
    },
  },
  persist: true,
});