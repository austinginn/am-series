<script setup>
import EpisodeCard from "@/components/EpisodeCard.vue";
import EpisodeCardSmall from "@/components/EpisodeCardSmall.vue";
import SeriesCardSmall from "@/components/SeriesCardSmall.vue";
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { db } from '@/main.js';

const route = useRoute();
const router = useRouter();

const content = ref(null);
const series = ref(null);
const seriesContent = ref([]);
const mediaId = ref(null);
const searchTerm = ref('');
const config = ref(null);

const search = () => {
  console.log("search", searchTerm.value);
  router.push({ path: '/search', query: { q: searchTerm.value } });
}

const loadEpisode = async (episodeId) => {
  console.log("loadEpisode", episodeId);
  const contentRef = doc(db, 'episodes', episodeId);
  const contentDoc = await getDoc(contentRef);

  if (contentDoc.exists()) {
    content.value = contentDoc.data();
    console.log(content.value);
    //get all other content from the same series
    seriesContent.value = await fetchSeriesContent();
    console.log("seriesContent", seriesContent.value);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    console.log('No such document!');
  }
}

//fetch config
const fetchConfig = async () => {
  const configQuery = query(collection(db, 'config'));
  const querySnapshot = await getDocs(configQuery);
  let configData = {};
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    configData = docSnap.data();
    console.log(configData);
  }

  return configData;
}


//get all episodes
const loadSeries = async (seriesId) => {
  console.log("loadSeries", seriesId);
  const contentRef = collection(db, 'episodes');
  const seriesQuery = query(contentRef, where('seriesId', '==', seriesId), orderBy('timestamp'), limit(1));
  const querySnapshot = await getDocs(seriesQuery);

  if (!querySnapshot.empty) {
    const firstContent = querySnapshot.docs[0].data();
    console.log(firstContent);
    // Load the first episode here
    content.value = firstContent;
    //get all other content from the same series
    seriesContent.value = await fetchSeriesContent();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    console.log('No episodes found for this series.');
  }
}

//get most recent content
const fetchMostRecentContent = async () => {
  const contentQuery = query(collection(db, 'episodes'), orderBy('timestamp', 'desc'), limit(1));
  const contentSnapshot = await getDocs(contentQuery);

  if (!contentSnapshot.empty) {
    const firstDoc = contentSnapshot.docs[0];
    return firstDoc.data();
  }
};

//get all series
const fetchSeries = async () => {
  //get all series
  const seriesQuery = query(
    collection(db, 'series'),
    orderBy('timestamp', 'desc') // Add this line
  );
  let seriesData = [];
  const seriesSnapshot = await getDocs(seriesQuery);

  if (!seriesSnapshot.empty) {
    const seriesDocs = seriesSnapshot.docs;

    for (let i = 0; i < seriesDocs.length; i++) {
      seriesData.push(seriesDocs[i].data());
    }
  }
  return seriesData;
};

const fetchSeriesContent = async () => {
  const seriesQuery = query(collection(db, 'episodes'), where('seriesId', '==', content.value.seriesId), orderBy('timestamp'));
  const seriesSnapshot = await getDocs(seriesQuery);
  const seriesData = [];

  if (!seriesSnapshot.empty) {
    const seriesDocs = seriesSnapshot.docs;


    for (let i = 0; i < seriesDocs.length; i++) {
      seriesData.push(seriesDocs[i].data());
    }


  }
  console.log("seriesData", seriesData);
  return seriesData;
};

onMounted(async () => {
  console.log("params", route.params);
  if (route.params.episodeId) {
    mediaId.value = route.params.mediaId;
    await loadEpisode(route.params.episodeId);
    mediaId.value = route.params.mediaId;

  } else {
    //most recent content
    content.value = await fetchMostRecentContent();
    console.log(content.value);
  }


  //get all other content from the same series
  seriesContent.value = await fetchSeriesContent();
  console.log("seriesContent", seriesContent.value);

  //get all series
  series.value = await fetchSeries();
  console.log(series.value);

  //get config
  config.value = await fetchConfig();
});


</script>

<template>
  <a v-if="config && config.liveUrl" :href="config.liveUrl" class="fab" target="_blank">
    Looking for our live stream? Click here!
  </a>

  <div class="header">
    <h1>Alpharetta Methodist</h1>
    <div class="search-box">
      <input type="text" v-model="searchTerm" placeholder="Search..." @keyup.enter="search" />
      <a href="/search" class="search-icon">
        <i class="fas fa-search"></i>
      </a>
    </div>
  </div>
    <EpisodeCard v-if="content" :content=content :mediaId=mediaId />

  <h1 v-if="content && seriesContent.length > 1" class="text-centered">More from this series:</h1>
  <div v-if="content && seriesContent.length > 1" class="card-container">
    <EpisodeCardSmall v-for="(content, index) in seriesContent" :key="index" :content="content"
      @select-episode="loadEpisode" />
  </div>
  <h1 class="text-centered">Recent series:</h1>
  <div v-if="series" class="card-container">
    <SeriesCardSmall v-for="(series, index) in series" :key="index" :series="series" @select-series="loadSeries" />
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

  .search-box {
    width: 100%;
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

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  padding-bottom: 0;
  padding-top: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin-right: 20px;
}


.search-box input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.search-box {
  position: relative;
  width: 250px;
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #333;
}

</style>
