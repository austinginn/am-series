<script setup>
import EpisodeCard from "@/components/EpisodeCard.vue";
import EpisodeCardSmall from "@/components/EpisodeCardSmall.vue";
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { db } from '@/main.js';


const episode = ref(null);
const serviceData = ref(null);
const seriesData = ref(null);
const seriesEpisodes = ref(null);
const route = useRoute();


const getServiceData = () => {
  console.log(episode.value);

  serviceData.value = {
    title: episode.value.title,
  }

  for (let i = 0; i < episode.value.serviceTypes.length; i++) {
    serviceData.value[episode.value.serviceTypes[i]] = episode.value[episode.value.serviceTypes[i]];
  }

  console.log(serviceData.value);
}

const getSeriesData = async () => {
  //access series data
  const seriesRef = doc(db, 'series', episode.value.seriesId);
  const seriesDoc = await getDoc(seriesRef);
  if (seriesDoc.exists()) {
    console.log(seriesDoc.data());
    seriesData.value = seriesDoc.data();
  } else {
    console.log('No such document!');
  }
}

const getAllEpisodes = async () => {
  //get all episodes with same seriesId
  const seriesEpisodesQuery = query(
    collection(db, 'episodes'),
    where('seriesId', '==', episode.value.seriesId),
    orderBy('timestamp', 'desc') // Add this line
  );
  const seriesEpisodesSnapshot = await getDocs(seriesEpisodesQuery);

  if (!seriesEpisodesSnapshot.empty) {
    seriesEpisodes.value = seriesEpisodesSnapshot.docs.map(doc => doc.data());
    console.log(seriesEpisodes.value);
  } else {
    console.log('No episodes found for this series!');
  }

}

const loadData = async () => {
  //reset data
  episode.value = null;
  serviceData.value = null;
  seriesData.value = null;
  seriesEpisodes.value = null;

  //check if id is in url
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  console.log(id);
  if (id) {
    console.log('found ID in url... loading episode');

    //get episode by id from db
    const docRef = doc(db, 'episodes', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log(docSnap.data());
      episode.value = docSnap.data();
      getServiceData();
      await getSeriesData();
      await getAllEpisodes();
    } else {
      console.log('No such document!');
    }
    return;
  }

  //get most recent episode from db
  const q = query(collection(db, 'episodes'), orderBy('timestamp', 'desc'), limit(1));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    episode.value = doc.data();
  });


  getServiceData();
  await getSeriesData();
  await getAllEpisodes();
}

onMounted(loadData);

watch(route, loadData, { deep: true })


</script>

<template>
  <EpisodeCard v-if="serviceData" :episodeImage=seriesData.image :episodeTitle=episode.title :episodeDate="episode.date"
    episodeDescription="Episode Description" :serviceTypes=episode.serviceTypes :serviceData="serviceData" />
  <h1 class="text-centered">More from this series:</h1>
  <div class="card-container">
    <EpisodeCardSmall v-for="(episode, index) in seriesEpisodes" :key="index" :episodeImage=seriesData.image
      :episodeTitle=episode.title :episodeDate=episode.date :episodeId="episode.id" />
  </div>
  <h1 class="text-centered">Recent series:</h1>
  <div class="card-container">

  </div>
</template>

<style scoped>
.text-centered {
  text-align: center;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

@media (min-width: 768px) {
  .card-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}
</style>
