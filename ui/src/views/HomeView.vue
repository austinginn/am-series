<script setup>
import EpisodeCard from "@/components/EpisodeCard.vue";
import EpisodeCardSmall from "@/components/EpisodeCardSmall.vue";
import SeriesCardSmall from "@/components/SeriesCardSmall.vue";
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { db } from '@/main.js';


const episode = ref(null);
const serviceData = ref(null);
const seriesData = ref(null);
const seriesEpisodes = ref(null);
const route = useRoute();
const series = ref(null);

const loadEpisode = (episodeId) => {
  console.log("loadEpisode", episodeId);
  loadData(episodeId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const loadSeries = async (seriesId) => {
  const episodesRef = collection(db, 'episodes');
  const seriesQuery = query(episodesRef, where('seriesId', '==', seriesId), orderBy('timestamp'), limit(1));
  const querySnapshot = await getDocs(seriesQuery);

  if (!querySnapshot.empty) {
    const firstEpisode = querySnapshot.docs[0].data();
    console.log(firstEpisode);
    // Load the first episode here
    episode.value = firstEpisode;
    getServiceData();
    await getSeriesData();
    await getAllEpisodes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    console.log('No episodes found for this series.');
  }
}

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

const getAllSeries = async () => {
  //get all series
  const seriesQuery = query(
    collection(db, 'series'),
    orderBy('timestamp', 'desc') // Add this line
  );
  const seriesSnapshot = await getDocs(seriesQuery);

  if (!seriesSnapshot.empty) {
    series.value = seriesSnapshot.docs.map(doc => doc.data());
    console.log("getAllSeries", series.value);
  } else {
    console.log('No series found!');
  }
}

const loadData = async (id) => {
  //reset data
  // episode.value = null;
  // serviceData.value = null;
  // seriesData.value = null;
  // seriesEpisodes.value = null;

  console.log(id);
  if (id) {
    console.log('loading episode by id');

    //get episode by id from db
    const docRef = doc(db, 'episodes', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log(docSnap.data());
      episode.value = docSnap.data();
      getServiceData();
      await getSeriesData();
      if (!seriesEpisodes.value) {
        await getAllEpisodes();
      }
      if (!series.value) {
        await getAllSeries();
      }

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
  await getAllSeries();
}

onMounted(loadData);

watch(route, loadData, { deep: true })


</script>

<template>
    <a href="your-live-stream-link" class="fab" target="_blank">
    Looking for our live stream? Click here!
  </a>
  <EpisodeCard v-if="serviceData" :episodeImage=seriesData.image :episodeTitle=episode.title :episodeDate="episode.date"
    episodeDescription="Episode Description" :serviceTypes=episode.serviceTypes :serviceData="serviceData" />
  <h1 class="text-centered">More from this series:</h1>
  <div v-if="serviceData" class="card-container">
    <EpisodeCardSmall v-for="(episode, index) in seriesEpisodes" :key="index" :episodeImage=seriesData.image
      :episodeTitle=episode.title :episodeDate=episode.date :episodeId="episode.id" @select-episode="loadEpisode" />
  </div>
  <h1 class="text-centered">Recent series:</h1>
  <div v-if="series" class="card-container">
    <SeriesCardSmall v-for="(series, index) in series" :key="index" :seriesImage=series.image :seriesTitle=series.title
      :seriesId="series.id" :seriesStartDate="series.startDate" :seriesEndDate="series.endDate" :seriesDescription="series.description" @select-series="loadSeries"/>
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

.fab {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: rgb(190, 32, 46);
  color: white;
  padding: 10px 10px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 15px;
  transition: transform .1s ease-in-out;
  animation: hover 1.5s infinite alternate;
}

.fab:hover {
  transform: scale(1.5);
}

@keyframes hover {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-10px);
  }
}
</style>
